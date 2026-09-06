import { useState, useEffect } from "react";
import { authService, orderService, logisticsService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ShoppingBag, Box, AlertTriangle, HandHeart, Package, Sparkles, FileText, Weight, MapPin, ShieldCheck, Globe, CheckCircle, Truck, ArrowRight, Lock } from "lucide-react";import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function Shipping() {
  const [orders, setOrders] = useState<any[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [shipments, setShipments] = useState<any[]>([]);
  const [user, setUser] = useState<any>(authService.getCurrentUser());
  const [preselectedTransporterId, setPreselectedTransporterId] = useState<number | null>(null);

  const [shipmentType, setShipmentType] = useState<"MARKETPLACE" | "PERSONAL">("MARKETPLACE");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [recommendMode, setRecommendMode] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    description: "",
    origin: user?.profile?.address || "",
    destination: "",
    weight: ""
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [orderData, transData, shipData] = await Promise.all([
          orderService.getSellerOrders(),
          logisticsService.getTransporters(),
          logisticsService.getShipments()
        ]);
        setOrders(orderData);
        setTransporters(transData);
        setShipments(shipData);

        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        if (orderId) {
          setSelectedOrderId(parseInt(orderId));
        } else {
          const firstPaid = orderData.find((o: any) => o.status === 'PAID');
          if (firstPaid) setSelectedOrderId(firstPaid.id);
        }

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
    fetchData();
  }, []);

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
      navigate('/seller/dashboard/orders');
    } catch (err) {
      toast.error("Échec de la demande d'expédition.");
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'SHIPPED': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'DELIVERED': return 'bg-accent/10 text-accent border-accent/20';
      default: return 'bg-white/5 text-white/40 border-white/10';
    }
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
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
          Envoi Libre / Personnel
          </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
          {shipmentType === "MARKETPLACE" && (
              <section className="space-y-4 animate-in fade-in duration-500">
              <h3 className="text-sm font-bold uppercase tracking-widest text-accent flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground flex items-center justify-center text-[10px]">1</span>
                  Choisir la commande à envoyer
              </h3>
              <div className="grid grid-cols-1 gap-3 max-h-[400px] overflow-y-auto no-scrollbar pr-2">
                  {orders.filter(o => o.status === 'PAID').length === 0 ? (
                  <Card className="bg-white/5 border-dashed border-white/10 p-12 text-center">
                      <AlertTriangle className="mx-auto mb-4 text-white/20" size={32} />
                      <p className="text-white/40 italic text-sm">Aucune commande payée en attente d'expédition.</p>
                  </Card>
                  ) : (
                  orders.filter(o => o.status === 'PAID').sort((a, b) => Number(b.shipping_delegated) - Number(a.shipping_delegated)).map(order => (
                      <Card 
                      key={order.id} 
                      onClick={() => setSelectedOrderId(order.id)}
                      className={cn(
                          "bg-white/5 border-white/10 cursor-pointer hover:border-accent/40 transition-all group overflow-hidden relative",
                          selectedOrderId === order.id && "border-accent ring-1 ring-accent/20 shadow-xl shadow-accent/5"
                      )}
                      >
                      {order.shipping_delegated && (
                        <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest z-10">
                          <HandHeart size={9} /> Confiée
                        </div>
                      )}
                      <CardContent className="p-6 flex items-center justify-between">
                          <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-accent/5 text-accent shadow-inner">
                              <Package size={20} />
                          </div>
                          <div>
                              <p className="font-bold text-white">Commande #{order.id}</p>
                              <p className="text-xs text-white/40">{order.items.length} article(s) · {order.total_price}€</p>
                          </div>
                          </div>
                          {selectedOrderId === order.id && <Badge className="bg-accent text-accent-foreground font-bold tracking-widest uppercase text-[10px]">Sélectionnée</Badge>}
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
                  Détails du colis
              </h3>
              <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setRecommendMode(true)}
                  className="text-[10px] text-accent hover:bg-accent/10 gap-2 font-bold uppercase tracking-widest"
              >
                  <Sparkles size={14} /> Intelligence Logistique
              </Button>
              </div>
              <Card className="bg-white/5 border-white/10 p-8 shadow-2xl">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                  <Label className="text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                      <FileText size={14} className="text-accent" /> Nature du colis
                  </Label>
                  <Input 
                      placeholder="Ex: Sculpture en bois d'ébène..." 
                      value={shipmentForm.description}
                      onChange={(e) => setShipmentForm({...shipmentForm, description: e.target.value})}
                      className="bg-deep border-white/10 focus:border-accent"
                  />
                  </div>
                  <div className="space-y-3">
                  <Label className="text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                      <Weight size={14} className="text-accent" /> Charge estimée (kg)
                  </Label>
                  <Input 
                      type="number"
                      placeholder="Ex: 12" 
                      value={shipmentForm.weight}
                      onChange={(e) => setShipmentForm({...shipmentForm, weight: e.target.value})}
                      className="bg-deep border-white/10 focus:border-accent"
                  />
                  </div>
                  <div className="space-y-3">
                  <Label className="text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                      <MapPin size={14} className="text-accent" /> Lieu d'enlèvement (Départ)
                  </Label>
                  <Input 
                      placeholder="Adresse de votre atelier" 
                      value={shipmentForm.origin}
                      onChange={(e) => setShipmentForm({...shipmentForm, origin: e.target.value})}
                      className="bg-deep border-white/10 focus:border-accent"
                  />
                  </div>
                  <div className="space-y-3">
                  <Label className="text-white/40 flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest">
                      <MapPin size={14} className="text-accent" /> Destination (Arrivée)
                  </Label>
                  <Input 
                      placeholder="Adresse du destinataire" 
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
              Sélectionner un transporteur certifié
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {transporters.length === 0 ? (
                  <Card className="col-span-2 bg-white/5 border-white/10 p-12 text-center border-dashed">
                     <p className="text-sm text-white/30 italic">Aucun partenaire logistique disponible à proximité.</p>
                  </Card>
              ) : (
                  transporters.map(trans => {
                  const { recommended, reason } = isTransporterRecommended(trans);
                  const isPreselected = trans.id === preselectedTransporterId;
                  return (
                      <Card key={trans.id} className={cn(
                      "bg-deep border-border/10 transition-all group overflow-hidden relative shadow-lg",
                      isPreselected ? "border-accent ring-2 ring-accent shadow-lg shadow-accent/10" :
                      recommended ? "border-accent ring-1 ring-accent/20 bg-accent/[0.02]" : "hover:border-accent/40"
                      )}>
                      {isPreselected ? (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.2em] z-10">
                          <Sparkles size={8} /> Sélectionné
                          </div>
                      ) : recommended ? (
                          <div className="absolute top-2 right-2 flex items-center gap-1 bg-accent text-accent-foreground px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-[0.2em] z-10 animate-pulse">
                          <Sparkles size={8} /> Elite Partner
                          </div>
                      ) : null}
                      <div className={cn("h-1 transition-colors duration-500", isPreselected || recommended ? "bg-accent" : "bg-white/5 group-hover:bg-accent")} />
                      <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                          <CardTitle className="text-base font-display">{trans.business_name || trans.profile?.business_name || `${trans.first_name} ${trans.last_name}`}</CardTitle>
                          <ShieldCheck size={18} className="text-accent" />
                          </div>
                          <CardDescription className="text-accent text-[9px] font-bold uppercase tracking-[0.3em]">{trans.vehicle_type || trans.profile?.vehicle_type}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-5 pt-2">
                          <div className="flex items-center gap-2 text-[10px] text-white/50 bg-white/5 p-2 rounded">
                          <Globe size={12} className="text-accent" />
                          <span>Régions : {trans.coverage_area || trans.profile?.coverage_area || 'National'}</span>
                          </div>
                          {recommended && reason && (
                          <div className="p-3 rounded-lg bg-accent/5 text-[9px] text-accent italic border border-accent/10 leading-relaxed font-medium">
                              <span className="not-italic font-bold uppercase mr-1">Raison:</span> {reason}
                          </div>
                          )}
                          <Button className={cn(
                          "w-full text-xs font-bold uppercase tracking-widest h-11 transition-all duration-300 shadow-xl",
                          isPreselected || recommended ? "bg-accent text-accent-foreground shadow-accent/20" : "bg-white/5 text-white/60 hover:bg-accent hover:text-accent-foreground border-white/10"
                          )} onClick={() => handleRequestShipment(trans.id)}>
                          Initier l'expédition
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
          <Card className="bg-gradient-to-br from-accent/10 to-transparent border-accent/20 lg:sticky lg:top-8 overflow-hidden backdrop-blur-md">
              <CardHeader>
              <CardTitle className="text-lg font-display tracking-widest uppercase">Garantie Ship</CardTitle>
              </CardHeader>
              <CardContent className="text-xs space-y-6 text-white/80 relative z-10 font-light leading-relaxed">
              {[
                  "Audit rigoureux de chaque transporteur africain.",
                  "Traçabilité totale de l'atelier au client.",
                  "Paiement fiduciaire sécurisé via la plateforme.",
                  "Support prioritaire pour les partenaires Artisans."
              ].map((text, idx) => (
                  <div key={idx} className="flex gap-4">
                  <CheckCircle size={18} className="text-accent flex-shrink-0" />
                  <p>{text}</p>
                  </div>
              ))}
              <div className="pt-6 mt-6 border-t border-accent/10">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-accent mb-4">Besoin d'aide ?</p>
                  <Button variant="outline" className="w-full text-[10px] uppercase font-bold tracking-widest border-white/5 bg-white/5">Service Conciergerie</Button>
              </div>
              </CardContent>
          </Card>
          </aside>
      </div>
    </div>
  );
}
