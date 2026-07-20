import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/sankhofa/DashboardLayout";
import { orderService, logisticsService, authService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Package, Truck, Store, CheckCircle, ArrowRight, Info, AlertTriangle, User, ShieldCheck, Lock, MapPin, Globe, FileText, ShoppingBag, Box, Weight, Sparkles, HandHeart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  view?: "overview" | "orders" | "shipping" | "profile";
}

export default function DashboardClient({ view = "overview" }: DashboardClientProps) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(authService.getCurrentUser());
  const [preselectedTransporterId, setPreselectedTransporterId] = useState<number | null>(null);

  // Shipment specific state
  const [shipmentType, setShipmentType] = useState<"MARKETPLACE" | "PERSONAL">("MARKETPLACE");
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [recommendMode, setRecommendMode] = useState(false);
  const [shipmentForm, setShipmentForm] = useState({
    description: "",
    origin: "",
    destination: user?.profile?.address || "",
    weight: ""
  });

  // Profile Form states
  const [profileData, setProfileData] = useState({
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    profile: {
      phone_number: user?.profile?.phone_number || "",
      address: user?.profile?.address || "",
      country: user?.profile?.country || "",
    }
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);
      
      const paidOrders = ordersData.filter((o: any) => o.status === 'PAID');
      if (paidOrders.length > 0 && !selectedOrderId) {
        setSelectedOrderId(paidOrders[0].id);
      }

      const shipData = await logisticsService.getShipments();
      setShipments(shipData);

      if (view === "shipping") {
        const transData = await logisticsService.getTransporters();
        setTransporters(transData);

        const storedId = localStorage.getItem("preselected_transporter_id");
        if (storedId) {
          setPreselectedTransporterId(parseInt(storedId, 10));
          localStorage.removeItem("preselected_transporter_id");
          toast.success("Expéditeur sélectionné depuis Sankhofa Ship ! Remplissez le formulaire puis cliquez sur Demander l'expédition.");
        }
      }
      
      if (view === "profile") {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
        setProfileData({
          email: currentUser?.email || "",
          first_name: currentUser?.first_name || "",
          last_name: currentUser?.last_name || "",
          profile: {
            phone_number: currentUser?.profile?.phone_number || "",
            address: currentUser?.profile?.address || "",
            country: currentUser?.profile?.country || "",
          }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      toast.success("Profil mis à jour avec succès !");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de la mise à jour.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await authService.changePassword(passwordData);
      toast.success("Mot de passe modifié !");
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      const msg = err.response?.data?.old_password?.[0] || "Erreur lors du changement.";
      toast.error(msg);
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

  const handleDelegateShipping = async (orderId: number) => {
    try {
      await orderService.delegateShipping(orderId);
      toast.success("Expédition confiée au vendeur ! Il s'en occupe désormais pour vous.");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Impossible de confier cette expédition.");
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

    // Rule 1: Weight vs Vehicle
    if (weight > 500) {
      if (trans.vehicle_type === 'TRUCK') { score += 50; reasons.push("Véhicule lourd"); }
      else if (trans.vehicle_type === 'MOTORCYCLE') { score -= 100; }
    } else if (weight > 50) {
      if (trans.vehicle_type === 'VAN' || trans.vehicle_type === 'TRUCK') { score += 30; reasons.push("Capacité adaptée"); }
    } else {
      score += 10; // Light is easy for all
    }

    // Rule 2: Coverage match
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
    <DashboardLayout>
      {view === "overview" && (
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-display font-light">Bienvenue sur votre espace</h1>
            <p className="text-muted-foreground">Voici un aperçu de votre activité récente sur Sankhofa.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider">Commandes actives</CardTitle>
                <Package className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{orders.filter(o => o.status !== 'DELIVERED').length}</div>
                <p className="text-[10px] md:text-xs text-white/40 mt-1">En attente ou expédiées</p>
              </CardContent>
            </Card>
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs md:text-sm font-medium text-white/60 uppercase tracking-wider">Livraisons terminées</CardTitle>
                <CheckCircle className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent>
                <div className="text-xl md:text-2xl font-bold">{orders.filter(o => o.status === 'DELIVERED').length}</div>
                <p className="text-[10px] md:text-xs text-white/40 mt-1">Colis bien reçus</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-display tracking-wide">Commandes Récentes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orders.length === 0 ? (
                  <p className="text-sm text-white/30 italic">Aucune commande pour le moment.</p>
                ) : (
                  orders.slice(0, 3).map(order => (
                    <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="p-2 rounded bg-accent/10 text-accent">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">Commande #{order.id}</p>
                          <p className="text-xs text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Badge variant="outline" className={cn("text-[10px] h-5", getStatusColor(order.status))}>
                        {order.status}
                      </Badge>
                    </div>
                  ))
                )}
                <Button variant="link" className="text-accent p-0 h-auto text-xs" onClick={() => window.location.href='/client/dashboard/orders'}>
                  Voir tout l'historique <ArrowRight size={12} className="ml-1" />
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-accent/5 border-accent/20 border-dashed backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg font-display tracking-wide text-accent">Besoin d'expédier ?</CardTitle>
                <CardDescription className="text-white/60">Utilisez Sankhofa Ship pour vos envois personnels ou pro.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-deep/50 border border-border/10">
                  <Truck className="mb-3 text-accent" />
                  <p className="text-sm mb-4">Connectez-vous directement avec des transporteurs africains vérifiés pour acheminer vos colis en toute sécurité.</p>
                  <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => window.location.href='/client/dashboard/shipping'}>
                    Démarrer une expédition
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {view === "orders" && (
        <div className="space-y-6">
          <h1 className="text-3xl font-display font-light text-balance">Mes Commandes</h1>
          <div className="space-y-4">
            {orders.length === 0 ? (
              <p className="text-white/40 italic">Vous n'avez passé aucune commande pour le moment.</p>
            ) : (
              orders.map(order => (
                <Card key={order.id} className="bg-white/5 border-white/10 overflow-hidden">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-3">
                          <h2 className="text-lg font-medium">Commande #{order.id}</h2>
                          <Badge variant="outline" className={cn("text-[10px] h-5", getStatusColor(order.status))}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-white/40">Passée le {new Date(order.created_at).toLocaleString()}</p>
                      </div>
                      <div className="sm:text-right">
                        <p className="text-2xl font-bold text-accent">{order.total_price}€</p>
                        <p className="text-xs text-white/40 italic">TVA incluse</p>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs uppercase tracking-wider text-white/30 font-bold">Articles</h3>
                      {order.items.map((item: any) => (
                        <div key={item.id} className="flex justify-between items-center text-sm p-3 rounded bg-white/5 hover:bg-white/10 transition-colors">
                          <div className="flex items-center gap-2">
                             <Package size={14} className="text-accent/40" />
                             <span>{item.quantity}x {item.product_name}</span>
                          </div>
                          <span className="font-medium">{item.price}€</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {order.status === 'PAID' && !order.shipping_delegated && (
                    <div className="bg-accent/10 p-4 border-t border-accent/20 flex flex-col sm:flex-row justify-between items-center gap-3">
                      <div className="flex items-center gap-2 text-xs text-accent">
                        <Info size={14} />
                        Prête pour l'expédition.
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full sm:w-auto h-8 text-xs border-accent/30 text-accent hover:bg-accent/10 gap-1.5"
                          onClick={() => handleDelegateShipping(order.id)}
                        >
                          <HandHeart size={13} />
                          Confier au vendeur
                        </Button>
                        <Button size="sm" className="w-full sm:w-auto h-8 text-xs bg-accent text-accent-foreground" onClick={() => window.location.href='/client/dashboard/shipping'}>
                          Expédier via Sankhofa Ship
                        </Button>
                      </div>
                    </div>
                  )}
                  {order.status === 'PAID' && order.shipping_delegated && (
                    <div className="bg-blue-500/10 p-4 border-t border-blue-500/20 flex items-center gap-2 text-xs text-blue-400">
                      <HandHeart size={14} />
                      Expédition confiée au vendeur — il s'en occupe pour vous.
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        </div>
      )}

      {view === "shipping" && (
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
                               <CardTitle className="text-base">{trans.business_name || `${trans.first_name} ${trans.last_name}`}</CardTitle>
                               <ShieldCheck size={16} className="text-accent" />
                            </div>
                            <CardDescription className="text-accent text-[10px] font-bold uppercase tracking-wider">{trans.vehicle_type}</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4 pt-2">
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <Globe size={12} className="text-accent/60" />
                              <span>Zones : {trans.coverage_area}</span>
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
      )}

      {view === "profile" && (
        <div className="space-y-8 pb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-light">Mon Profil</h1>
            <p className="text-muted-foreground">Gérez vos informations personnelles et votre sécurité.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Infos Personnelles */}
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <User className="text-accent" size={18} />
                    <CardTitle className="text-lg">Informations Personnelles</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleUpdateProfile} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="first_name" className="text-white/60">Prénom</Label>
                        <Input 
                          id="first_name"
                          value={profileData.first_name}
                          onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="last_name" className="text-white/60">Nom</Label>
                        <Input 
                          id="last_name"
                          value={profileData.last_name}
                          onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-white/60">Adresse Email</Label>
                      <Input 
                        id="email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                        className="bg-deep border-white/10 focus:border-accent/50"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-white/60">Téléphone</Label>
                        <Input 
                          id="phone"
                          value={profileData.profile.phone_number}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            profile: { ...profileData.profile, phone_number: e.target.value }
                          })}
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country" className="text-white/60">Pays de résidence</Label>
                        <Input 
                          id="country"
                          value={profileData.profile.country}
                          onChange={(e) => setProfileData({
                            ...profileData, 
                            profile: { ...profileData.profile, country: e.target.value }
                          })}
                          placeholder="Ex: Sénégal, France, Côte d'Ivoire..."
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-white/60">Adresse complète</Label>
                      <textarea 
                        id="address"
                        value={profileData.profile.address}
                        onChange={(e) => setProfileData({
                          ...profileData, 
                          profile: { ...profileData.profile, address: e.target.value }
                        })}
                        rows={3}
                        className="w-full bg-deep border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                        placeholder="Rue, Quartier, Ville..."
                      />
                    </div>

                    <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                      Enregistrer les modifications
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Sécurité */}
              <Card className="bg-white/5 border-white/10 overflow-hidden">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <Lock className="text-accent" size={18} />
                    <CardTitle className="text-lg">Sécurité & Mot de passe</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <form onSubmit={handleChangePassword} className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="old_p" className="text-white/60">Ancien mot de passe</Label>
                      <Input 
                        id="old_p"
                        type="password"
                        value={passwordData.old_password}
                        onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                        className="bg-deep border-white/10 focus:border-accent/50"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="new_p" className="text-white/60">Nouveau mot de passe</Label>
                        <Input 
                          id="new_p"
                          type="password"
                          value={passwordData.new_password}
                          onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="conf_p" className="text-white/60">Confirmer le mot de passe</Label>
                        <Input 
                          id="conf_p"
                          type="password"
                          value={passwordData.confirm_password}
                          onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                    </div>
                    <Button type="submit" variant="outline" className="border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground">
                      Mettre à jour le mot de passe
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <aside className="space-y-6">
               <Card className="bg-white/5 border-white/10 text-center p-8">
                  <div className="mx-auto w-24 h-24 rounded-full bg-accent/10 border-2 border-accent/20 flex items-center justify-center text-accent mb-4">
                    <User size={48} />
                  </div>
                  <h2 className="text-xl font-display">{user?.first_name} {user?.last_name}</h2>
                  <p className="text-sm text-white/40 mb-6">{user?.email}</p>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                      <span className="text-white/40">Rôle</span>
                      <span className="text-accent font-bold uppercase">{user?.role}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs p-2 rounded bg-white/5">
                      <span className="text-white/40">Statut</span>
                      <Badge variant="outline" className="text-[9px] h-4 bg-green-500/10 text-green-500 border-green-500/20">ACTIF</Badge>
                    </div>
                  </div>
               </Card>

               <div className="p-6 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent">
                  <div className="flex items-center gap-3 mb-4 text-accent">
                    <MapPin size={18} />
                    <h3 className="font-medium">Adresse par défaut</h3>
                  </div>
                  <p className="text-sm text-white/60 italic leading-relaxed">
                    {user?.profile?.address || "Aucune adresse renseignée."}
                  </p>
               </div>
            </aside>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
