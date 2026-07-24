import { useState, useEffect } from "react";
import { logisticsService, orderService, authService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, CheckCircle, ArrowRight, ShieldCheck, Lock, MapPin, Globe, FileText, ShoppingBag, Box, Weight, Sparkles, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Shipping() {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [user, setUser] = useState<any>(authService.getCurrentUser());
  const [preselectedTransporterId, setPreselectedTransporterId] = useState<number | null>(null);

  const [shipmentType, setShipmentType] = useState<"MARKETPLACE" | "PERSONAL">("MARKETPLACE");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [recommendMode, setRecommendMode] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    description: "",
    origin: "",
    destination: user?.profile?.address || "",
    weight: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);
      
      const paidOrders = ordersData.filter((o: any) => o.status === 'PAID' && !o.shipping_delegated);
      if (paidOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(paidOrders[0].id);
      }

      const shipData = await logisticsService.getShipments();
      setShipments(shipData);

      const transData = await logisticsService.getTransporters();
      setTransporters(transData);

      const storedId = localStorage.getItem("preselected_transporter_id");
      if (storedId) {
        setPreselectedTransporterId(parseInt(storedId, 10));
        localStorage.removeItem("preselected_transporter_id");
        toast.success("Expéditeur sélectionné depuis Sankhofa Ship ! Remplissez le formulaire puis cliquez sur Demander l'expédition.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRequestShipment = async (transporterId: number) => {
    if (shipmentType === "MARKETPLACE" && !selectedOrderId) {
      toast.error("Veuillez d'abord sélectionner une commande payée.");
      return;
    }

    if (!shipmentForm.description || !shipmentForm.origin || !shipmentForm.destination) {
      toast.error("Veuillez remplir tous les détails de l'expédition.");
      return;
    }

    try {
      await logisticsService.requestShipment({
        order: shipmentType === "MARKETPLACE" ? selectedOrderId : null,
        shipment_type: shipmentType,
        transporter: transporterId,
        ...shipmentForm
      });
      toast.success("Demande d'expédition envoyée !");
      fetchData();
    } catch (err) {
      toast.error("Échec de la demande d'expédition.");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELIVERED': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  const isTransporterRecommended = (trans: any): { recommended: boolean, reason?: string } => {
    if (!recommendMode) return { recommended: false };
    
    const weight = parseFloat(shipmentForm.weight) || 0;
    const dest = shipmentForm.destination.toLowerCase();
    const coverage = (trans.coverage_area || "").toLowerCase();

    let score = 0;
    let reasons = [];

    if (weight > 500) {
      if (trans.vehicle_type === 'TRUCK') { score += 50; reasons.push("Véhicule lourd"); }
      else if (trans.vehicle_type === 'MOTORCYCLE') { score -= 100; }
    } else if (weight > 50) {
      if (trans.vehicle_type === 'VAN' || trans.vehicle_type === 'TRUCK') { score += 30; reasons.push("Capacité adaptée"); }
    } else {
      score += 10;
    }

    if (dest && coverage && (coverage.includes(dest) || dest.includes(coverage))) {
      score += 40;
      reasons.push("Zone de couverture idéale");
    }

    return { 
      recommended: score >= 40, 
      reason: reasons.join(" · ") 
    };
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div className="space-y-1">
          <h1 className="text-3xl font-display font-light text-balance">Sankhofa Ship</h1>
          <p className="text-muted-foreground">Logistique premium & suivi sécurisé.</p>
        </div>
        <Truck size={40} className="hidden sm:block text-accent opacity-20" />
      </div>

      {shipments.length > 0 && (
        <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
           <h3 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
             <Truck size={16} /> Mes expéditions actives
           </h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {shipments.map(ship => (
                <Card key={ship.id} className="bg-white/5 border-white/10 group hover:border-accent/30 overflow-hidden shadow-2xl">
                   <div className="p-4">
                      <div className="flex justify-between items-start gap-4 mb-4">
                         <div className="flex items-center gap-3">
                            <Package size={16} className="text-accent" />
                            <span className="text-sm font-bold">Colis #{ship.id}</span>
                         </div>
                         <Badge variant="outline" className={cn("text-[8px] uppercase font-bold", getStatusColor(ship.status))}>
                            {ship.status}
                         </Badge>
                      </div>
                      <div className="flex items-center gap-2 mb-4 text-[11px] text-white/40">
                         <MapPin size={10} />
                         <span>{ship.origin} <ArrowRight size={10} className="inline mx-1" /> {ship.destination}</span>
                      </div>
                      
                      {ship.status !== 'DELIVERED' && ship.status !== 'CANCELLED' && ship.verification_code && (
                        <div className="p-3 rounded-lg bg-accent/5 border border-accent/20 flex items-center justify-between">
                           <div className="space-y-0.5">
                              <p className="text-[9px] uppercase font-bold text-accent/60 tracking-widest leading-none">Code de sécurité</p>
                              <p className="text-xs font-mono font-bold text-accent tracking-[0.3em]">{ship.verification_code}</p>
                           </div>
                           <Lock size={12} className="text-accent/40" />
                        </div>
                      )}

                      {ship.status === 'DELIVERED' && (
                         <div className="flex items-center gap-2 text-[10px] text-accent font-bold bg-accent/10 p-2 rounded-lg border border-accent/20">
                            <CheckCircle size={12} /> Colis livré avec succès
                         </div>
                      )}
                   </div>
                </Card>
              ))}
           </div>
        </div>
      )}

      <div className="pt-8 border-t border-white/5">
         <h3 className="text-sm font-bold uppercase tracking-widest text-accent/40 mb-6">Nouvelle demande d'expédition</h3>
      </div>

      <div className="flex flex-wrap gap-4 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
        <button 
          onClick={() => setShipmentType("MARKETPLACE")}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
            shipmentType === "MARKETPLACE" ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-white/40 hover:text-white"
          )}
        >
          <ShoppingBag size={16} />
          Commande Marketplace
        </button>
        <button 
          onClick={() => {
            setShipmentType("PERSONAL");
            setSelectedOrderId(null);
          }}
          className={cn(
            "flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all",
            shipmentType === "PERSONAL" ? "bg-accent text-accent-foreground shadow-lg shadow-accent/20" : "text-white/40 hover:text-white"
          )}
        >
          <Box size={16} />
          Envoi Personnel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {shipmentType === "MARKETPLACE" && (
            <section className="space-y-4 animate-in fade-in duration-500">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px]">1</span>
                Choisir la commande
              </h3>
              <div className="grid grid-cols-1 gap-3">
                {orders.filter(o => o.status === 'PAID' && !o.shipping_delegated).length === 0 ? (
                  <Card className="bg-white/5 border-dashed border-white/10 p-12 text-center">
                    <AlertTriangle className="mx-auto mb-4 text-white/20" size={32} />
                    <p className="text-white/40 italic text-sm">Aucune commande payée en attente.</p>
                  </Card>
                ) : (
                  orders.filter(o => o.status === 'PAID' && !o.shipping_delegated).map(order => (
                    <Card 
                      key={order.id} 
                      onClick={() => setSelectedOrderId(order.id)}
                      className={cn(
                        "bg-white/5 border-white/10 cursor-pointer hover:border-accent/40 transition-all group overflow-hidden",
                        selectedOrderId === order.id && "border-accent ring-1 ring-accent/20"
                      )}
                    >
                      <CardContent className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="p-3 rounded-full bg-accent/5 text-accent">
                            <Package size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-white">Commande #{order.id}</p>
                            <p className="text-xs text-white/40">{order.items.length} article(s) · {order.total_price}€</p>
                          </div>
                        </div>
                        {selectedOrderId === order.id && <Badge className="bg-accent text-accent-foreground">Sélectionnée</Badge>}
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px]">
                  {shipmentType === "MARKETPLACE" ? "2" : "1"}
                </span>
                Détails de l'expédition
              </h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setRecommendMode(true)}
                className="text-xs text-accent hover:bg-accent/10 gap-2 font-bold uppercase tracking-tighter"
              >
                <Sparkles size={14} /> Recommander des transporteurs
              </Button>
            </div>
            <Card className="bg-white/5 border-white/10 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-white/60 flex items-center gap-2">
                    <FileText size={14} className="text-accent" /> Contenu du colis
                  </Label>
                  <Input 
                    placeholder="Ex: Tissus traditionnels..." 
                    value={shipmentForm.description}
                    onChange={(e) => setShipmentForm({...shipmentForm, description: e.target.value})}
                    className="bg-deep border-white/10 focus:border-accent"
                  />
                </div>
                <div className="space-y-2 md:col-span-1">
                  <Label className="text-white/60 flex items-center gap-2">
                    <Weight size={14} className="text-accent" /> Poids estimé (kg)
                  </Label>
                  <Input 
                    type="number"
                    placeholder="Ex: 5" 
                    value={shipmentForm.weight}
                    onChange={(e) => setShipmentForm({...shipmentForm, weight: e.target.value})}
                    className="bg-deep border-white/10 focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60 flex items-center gap-2">
                    <MapPin size={14} className="text-accent" /> Lieu de départ
                  </Label>
                  <Input 
                    placeholder="Adresse complète" 
                    value={shipmentForm.origin}
                    onChange={(e) => setShipmentForm({...shipmentForm, origin: e.target.value})}
                    className="bg-deep border-white/10 focus:border-accent"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white/60 flex items-center gap-2">
                    <MapPin size={14} className="text-accent" /> Lieu d'arrivée
                  </Label>
                  <Input 
                    placeholder="Adresse de livraison" 
                    value={shipmentForm.destination}
                    onChange={(e) => setShipmentForm({...shipmentForm, destination: e.target.value})}
                    className="bg-deep border-white/10 focus:border-accent"
                  />
                </div>
              </div>
            </Card>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px]">
                {shipmentType === "MARKETPLACE" ? "3" : "2"}
              </span>
              Choisir un transporteur
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {transporters.length === 0 ? (
                <Card className="col-span-2 bg-white/5 border-white/10 p-8 text-center border-dashed">
                  <p className="text-sm text-white/30 italic">Aucun transporteur vérifié n'est disponible pour le moment.</p>
                </Card>
              ) : (
                transporters.map(trans => {
                  const { recommended, reason } = isTransporterRecommended(trans);
                  const isPreselected = trans.id === preselectedTransporterId;
                  return (
                    <Card key={trans.id} className={cn(
                      "bg-deep border-border/10 transition-all group overflow-hidden relative",
                      isPreselected ? "border-accent ring-2 ring-accent shadow-lg shadow-accent/10" :
                      recommended ? "border-accent shadow-lg shadow-accent/5 ring-1 ring-accent/20" : "hover:border-accent/40"
                    )}>
                      {isPreselected ? (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest z-10">
                          <Sparkles size={8} /> Sélectionné
                        </div>
                      ) : recommended ? (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest z-10 animate-pulse">
                          <Sparkles size={8} /> Recommandé
                        </div>
                      ) : null}
                      <div className={cn("h-1 transition-colors duration-500", isPreselected || recommended ? "bg-accent" : "bg-accent/10 group-hover:bg-accent")} />
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                           <CardTitle className="text-base">{trans.profile?.business_name || trans.business_name || `${trans.first_name} ${trans.last_name}`}</CardTitle>
                           <ShieldCheck size={16} className="text-accent" />
                        </div>
                        <CardDescription className="text-accent text-[10px] font-bold uppercase tracking-wider">{trans.profile?.vehicle_type || trans.vehicle_type}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4 pt-2">
                        <div className="flex items-center gap-2 text-xs text-white/60">
                          <Globe size={12} className="text-accent/60" />
                          <span>Zones : {trans.profile?.coverage_area || trans.coverage_area}</span>
                        </div>
                        {recommended && reason && (
                          <div className="p-2 rounded bg-accent/5 text-[10px] text-accent italic border border-accent/10">
                            {reason}
                          </div>
                        )}
                        <Button variant="outline" className={cn(
                          "w-full text-xs font-bold border-accent/20 text-accent transition-all duration-300",
                          isPreselected || recommended ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                        )} onClick={() => handleRequestShipment(trans.id)}>
                          Demander l'expédition
                        </Button>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <Card className="bg-accent/5 border-accent/20 lg:sticky lg:top-8 overflow-hidden transition-all hover:bg-accent/10">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full -translate-y-16 translate-x-16" />
            <CardHeader>
              <CardTitle className="text-lg font-display">Garantie Sankhofa</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-5 text-white/70 relative z-10">
              {[
                "Transporteurs 100% vérifiés (CNI, Itinéraires).",
                "Expéditions personnelles ou Marketplace.",
                "Paiement au transporteur à la livraison.",
                "Suivi sécurisé par la plateforme."
              ].map((text, idx) => (
                <div key={idx} className="flex gap-3">
                  <CheckCircle size={18} className="text-accent flex-shrink-0" />
                  <p className="leading-tight">{text}</p>
                </div>
              ))}
              <div className="pt-4 mt-6 border-t border-accent/10 flex items-center gap-2 grayscale hover:grayscale-0 transition-all opacity-50 hover:opacity-100">
                <ShieldCheck size={14} className="text-accent" />
                <span className="text-[10px] italic font-bold uppercase tracking-[0.2em]">Authenticité certifiée</span>
              </div>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
