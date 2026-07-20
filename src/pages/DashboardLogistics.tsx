import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/sankhofa/DashboardLayout";
import { authService, logisticsService, productService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Truck, Package, MapPin, CheckCircle, Clock, AlertCircle, 
  Plus, Trash2, ShieldCheck, User, ArrowRight, TrendingUp,
  Map as MapIcon, Calendar, Weight, Info, Tag, Layers, Sparkles
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Tab = "overview" | "routes" | "shipments" | "profile";

interface DashboardLogisticsProps {
  view?: Tab;
}

export default function DashboardLogistics({ view = "overview" }: DashboardLogisticsProps) {
  const [shipments, setShipments] = useState<any[]>([]);
  const [routes, setRoutes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(authService.getCurrentUser());

  // Route Form state
  const [showRouteForm, setShowRouteForm] = useState(false);
  const [routeForm, setRouteForm] = useState({
    origin: "",
    destination: "",
    frequency: "Quotidien",
    price_per_kg: ""
  });
  const [pricingMode, setPricingMode] = useState<"flat" | "per_category">("flat");
  const [categoryPrices, setCategoryPrices] = useState<Record<string, string>>({});
  const [productExceptions, setProductExceptions] = useState<
    { product_id: string; product_name: string; category: string; price_per_kg: string }[]
  >([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [allProducts, setAllProducts] = useState<any[]>([]);

  useEffect(() => {
    productService.getCategories().then(setCategories).catch(() => {});
    productService.getProducts({}).then(setAllProducts).catch(() => {});
  }, []);

  const resetRouteForm = () => {
    setRouteForm({ origin: "", destination: "", frequency: "Quotidien", price_per_kg: "" });
    setPricingMode("flat");
    setCategoryPrices({});
    setProductExceptions([]);
  };

  const addProductException = () => {
    setProductExceptions((prev) => [...prev, { product_id: "", product_name: "", category: "", price_per_kg: "" }]);
  };

  const updateProductException = (index: number, field: string, value: string) => {
    setProductExceptions((prev) =>
      prev.map((row, i) => {
        if (i !== index) return row;
        if (field === "product_id") {
          const product = allProducts.find((p) => String(p.id) === value);
          return { ...row, product_id: value, product_name: product?.name_fr || "", category: product?.category || "" };
        }
        return { ...row, [field]: value };
      })
    );
  };

  const removeProductException = (index: number) => {
    setProductExceptions((prev) => prev.filter((_, i) => i !== index));
  };

  // Profile Form state
  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    profile: {
      business_name: user?.profile?.business_name || "",
      phone_number: user?.profile?.phone_number || "",
      vehicle_type: user?.profile?.vehicle_type || "",
      address: user?.profile?.address || "",
    }
  });

  // Verification code state for delivery
  const [verificationCodes, setVerificationCodes] = useState<Record<number, string>>({});

  useEffect(() => {
    fetchData();
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === "overview" || view === "shipments") {
        const shipData = await logisticsService.getShipments();
        setShipments(shipData);
      }
      if (view === "overview" || view === "routes") {
        const routeData = await logisticsService.getRoutes();
        setRoutes(routeData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault();

    if (pricingMode === "per_category") {
      const missing = categories.filter((c) => !categoryPrices[c.id]);
      if (missing.length > 0) {
        toast.error(`Merci de renseigner un prix pour : ${missing.map((c) => c.name).join(", ")}`);
        return;
      }
    }

    try {
      await logisticsService.createRoute({
        ...routeForm,
        pricing_mode: pricingMode,
        category_prices: Object.entries(categoryPrices).map(([category, price_per_kg]) => ({ category, price_per_kg })),
        product_exceptions: productExceptions
          .filter((row) => row.product_id && row.price_per_kg)
          .map((row) => ({ product_id: row.product_id, product_name: row.product_name, price_per_kg: row.price_per_kg })),
      });
      toast.success("Itinéraire ajouté !");
      setShowRouteForm(false);
      resetRouteForm();
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de la création de l'itinéraire.");
    }
  };

  const handleDeleteRoute = async (id: number) => {
    if (confirm("Supprimer cet itinéraire ?")) {
      try {
        await logisticsService.deleteRoute(id);
        toast.success("Itinéraire supprimé.");
        fetchData();
      } catch (err) {
        toast.error("Impossible de supprimer.");
      }
    }
  };

  const handleUpdateStatus = async (shipmentId: number, status: string) => {
    try {
      const code = verificationCodes[shipmentId];
      await logisticsService.updateShipmentStatus(shipmentId, status, code);
      toast.success(`Statut mis à jour : ${status}`);
      fetchData();
    } catch (err: any) {
      const msg = err.response?.data?.error || "Erreur lors de la mise à jour.";
      toast.error(msg);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      toast.success("Profil mis à jour !");
      setUser(authService.getCurrentUser());
    } catch (err) {
      toast.error("Erreur de mise à jour.");
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'REQUESTED': return <Badge variant="outline" className="text-yellow-500 border-yellow-500/20 bg-yellow-500/5">Demande reçue</Badge>;
      case 'ACCEPTED': return <Badge variant="outline" className="text-blue-500 border-blue-500/20 bg-blue-500/5">Acceptée</Badge>;
      case 'PICKED_UP': return <Badge variant="outline" className="text-purple-500 border-purple-500/20 bg-purple-500/5">Récupérée</Badge>;
      case 'IN_TRANSIT': return <Badge variant="outline" className="text-cyan-500 border-cyan-500/20 bg-cyan-500/5 animate-pulse">En Transit</Badge>;
      case 'DELIVERED': return <Badge variant="outline" className="text-accent border-accent/20 bg-accent/5">Livré</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPageTitle = () => {
    switch(view) {
      case 'routes': return "Mes Itinéraires";
      case 'shipments': return "Livraisons en cours";
      case 'profile': return "Profil Expéditeur";
      default: return "Vue d'ensemble Logistique";
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-light text-balance">{getPageTitle()}</h1>
            <p className="text-muted-foreground">Pilotez votre flotte et suivez vos tournées africaines.</p>
          </div>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/20">
            <Truck size={18} className="text-accent" />
            <span className="text-sm font-display font-bold text-accent uppercase tracking-widest">{user?.profile?.business_name || "Transporteur Certifié"}</span>
          </div>
        </div>

        {view === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-widest">Colis Actifs</CardTitle>
                  <Package className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{shipments.filter(s => s.status !== 'DELIVERED').length}</div>
                  <p className="text-[10px] text-white/40 mt-1">En attente ou en transit</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-widest">Itinéraires</CardTitle>
                  <MapPin className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{routes.length}</div>
                  <p className="text-[10px] text-white/40 mt-1">Lignes régulières actives</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-widest">Performance</CardTitle>
                  <TrendingUp className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">100%</div>
                  <p className="text-[10px] text-white/40 mt-1">Livraisons à temps</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <Card className="bg-white/5 border-white/10">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-lg font-display tracking-wide">Dernières Demandes</CardTitle>
                    <Button variant="link" className="text-accent text-xs p-0 h-auto" onClick={() => window.location.href='/logistics/dashboard/shipments'}>
                       Tout voir <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {shipments.length === 0 ? (
                      <p className="text-sm text-white/20 italic">Aucune expédition en attente.</p>
                    ) : (
                      shipments.slice(0, 5).map(ship => (
                        <div key={ship.id} className="flex items-center justify-between p-3 rounded-lg bg-deep border border-white/5 group hover:border-accent/40 transition-colors">
                          <div className="flex items-center gap-4">
                            <div className="p-2 rounded bg-accent/5 text-accent shadow-inner">
                              <Package size={16} />
                            </div>
                            <div>
                               <p className="text-sm font-medium">{ship.origin} → {ship.destination}</p>
                               <p className="text-[10px] text-white/40 uppercase tracking-widest">{ship.weight}kg · {ship.description}</p>
                            </div>
                          </div>
                          {getStatusBadge(ship.status)}
                        </div>
                      ))
                    )}
                  </CardContent>
               </Card>

               <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-display tracking-wide">Mes Trajets</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {routes.length === 0 ? (
                      <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                         <p className="text-xs text-white/20 mb-4">Aucun itinéraire enregistré.</p>
                         <Button size="sm" variant="outline" className="text-accent border-accent/20" onClick={() => window.location.href='/logistics/dashboard/routes'}>Ajouter un trajet</Button>
                      </div>
                    ) : (
                      routes.slice(0, 4).map(route => (
                        <div key={route.id} className="flex items-center justify-between p-3 rounded-lg bg-deep border border-white/5">
                           <div className="flex items-center gap-3">
                              <MapIcon size={16} className="text-accent/60" />
                              <span className="text-sm font-bold">{route.origin} → {route.destination}</span>
                           </div>
                           <Badge variant="ghost" className="text-[10px] text-white/40 uppercase">{route.frequency}</Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
               </Card>
            </div>
          </div>
        )}

        {view === "routes" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Gestion de Tournées</h2>
              {!showRouteForm && (
                <Button onClick={() => setShowRouteForm(true)} className="bg-accent text-accent-foreground gap-2">
                  <Plus size={16} /> Définir un nouveau trajet
                </Button>
              )}
            </div>

            {showRouteForm && (
              <Card className="bg-white/5 border-white/10 max-w-2xl mx-auto shadow-2xl animate-in slide-in-from-top-4 duration-500">
                <CardHeader>
                   <CardTitle>Nouvel Itinéraire</CardTitle>
                   <CardDescription>Indiquez vos zones de passage régulières pour rassurer les clients.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                   <form onSubmit={handleCreateRoute} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Ville de départ</Label>
                        <Input 
                          value={routeForm.origin}
                          onChange={(e) => setRouteForm({...routeForm, origin: e.target.value})}
                          placeholder="Ex: Abidjan"
                          className="bg-deep border-white/10 focus:border-accent"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Ville d'arrivée</Label>
                        <Input 
                          value={routeForm.destination}
                          onChange={(e) => setRouteForm({...routeForm, destination: e.target.value})}
                          placeholder="Ex: Accra"
                          className="bg-deep border-white/10 focus:border-accent"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Fréquence</Label>
                        <select 
                          value={routeForm.frequency}
                          onChange={(e) => setRouteForm({...routeForm, frequency: e.target.value})}
                          className="w-full bg-deep border border-white/10 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                        >
                           <option>Quotidien</option>
                           <option>Hebdomadaire</option>
                           <option>Bimensuel</option>
                           <option>Occasionnel</option>
                        </select>
                      </div>

                      {/* ── Mode de tarification ── */}
                      <div className="md:col-span-2 space-y-3 pt-4 border-t border-white/5">
                        <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                          <Tag size={12} className="text-accent" /> Tarification
                        </Label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <button
                            type="button"
                            onClick={() => setPricingMode("flat")}
                            className={cn(
                              "text-left p-3 rounded-md border transition-all",
                              pricingMode === "flat" ? "border-accent bg-accent/5" : "border-white/10 hover:border-white/20"
                            )}
                          >
                            <p className="text-sm font-medium text-white">Même prix pour tous les produits</p>
                            <p className="text-[11px] text-white/40 mt-0.5">Un seul tarif au kg, quel que soit le type de marchandise.</p>
                          </button>
                          <button
                            type="button"
                            onClick={() => setPricingMode("per_category")}
                            className={cn(
                              "text-left p-3 rounded-md border transition-all",
                              pricingMode === "per_category" ? "border-accent bg-accent/5" : "border-white/10 hover:border-white/20"
                            )}
                          >
                            <p className="text-sm font-medium text-white">Prix différent selon le type de produit</p>
                            <p className="text-[11px] text-white/40 mt-0.5">Un tarif au kg propre à chaque catégorie (mode, alimentaire...).</p>
                          </button>
                        </div>
                      </div>

                      {pricingMode === "flat" ? (
                        <div className="md:col-span-2 space-y-2">
                          <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest">Prix / kg — tous produits (€)</Label>
                          <Input 
                            type="number"
                            step="0.01"
                            value={routeForm.price_per_kg}
                            onChange={(e) => setRouteForm({...routeForm, price_per_kg: e.target.value})}
                            placeholder="Ex: 2.50"
                            className="bg-deep border-white/10 focus:border-accent max-w-xs"
                            required
                          />
                        </div>
                      ) : (
                        <div className="md:col-span-2 space-y-3">
                          <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                            <Layers size={12} /> Prix par catégorie (€ / kg)
                          </Label>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {categories.map((cat) => (
                              <div key={cat.id} className="space-y-1">
                                <Label className="text-white/50 text-xs">{cat.name}</Label>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={categoryPrices[cat.id] || ""}
                                  onChange={(e) => setCategoryPrices({ ...categoryPrices, [cat.id]: e.target.value })}
                                  placeholder="Ex: 5"
                                  className="bg-deep border-white/10 focus:border-accent"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* ── Exceptions par produit ── */}
                      <div className="md:col-span-2 space-y-3 pt-4 border-t border-white/5">
                        <div className="flex items-center justify-between">
                          <Label className="text-white/40 uppercase text-[10px] font-bold tracking-widest flex items-center gap-2">
                            <Sparkles size={12} className="text-accent" /> Exceptions sur un produit précis
                          </Label>
                          <Button type="button" variant="ghost" size="sm" onClick={addProductException} className="h-7 text-xs gap-1 text-accent hover:bg-accent/10">
                            <Plus size={12} /> Ajouter une exception
                          </Button>
                        </div>
                        <p className="text-[11px] text-white/30">
                          Un produit précis coûte plus cher (ou moins cher) à transporter que le reste de sa catégorie ? Fixez-lui son propre tarif — il primera sur tout le reste.
                        </p>

                        {productExceptions.length === 0 ? (
                          <p className="text-xs text-white/20 italic">Aucune exception pour le moment.</p>
                        ) : (
                          <div className="space-y-2">
                            {productExceptions.map((row, i) => (
                              <div key={i} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-deep/60 border border-white/10 rounded-md p-3">
                                <select
                                  value={row.product_id}
                                  onChange={(e) => updateProductException(i, "product_id", e.target.value)}
                                  className="flex-1 bg-deep border border-white/10 rounded-md h-9 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                >
                                  <option value="">Choisir un produit…</option>
                                  {allProducts.map((p) => (
                                    <option key={p.id} value={p.id}>{p.name_fr} — {p.category_name}</option>
                                  ))}
                                </select>
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={row.price_per_kg}
                                  onChange={(e) => updateProductException(i, "price_per_kg", e.target.value)}
                                  placeholder="Prix / kg (€)"
                                  className="bg-deep border-white/10 focus:border-accent sm:w-36"
                                />
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeProductException(i)} className="h-9 w-9 shrink-0 text-white/30 hover:text-red-400">
                                  <Trash2 size={14} />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 flex justify-end gap-3 pt-6 border-t border-white/5">
                         <Button type="button" variant="ghost" onClick={() => { setShowRouteForm(false); resetRouteForm(); }}>Annuler</Button>
                         <Button type="submit" className="bg-accent text-accent-foreground">Enregistrer l'itinéraire</Button>
                      </div>
                   </form>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               {routes.map(route => (
                 <Card key={route.id} className="bg-deep border-white/5 group hover:border-accent/40 transition-all overflow-hidden">
                    <div className="h-1 bg-accent/20 group-hover:bg-accent transition-colors" />
                    <CardHeader className="pb-2">
                       <div className="flex justify-between items-start">
                          <CardTitle className="text-base flex items-center gap-2">
                             <MapIcon size={16} className="text-accent" />
                             {route.origin} → {route.destination}
                          </CardTitle>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-white/20 hover:text-red-400"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                             <Trash2 size={14} />
                          </Button>
                       </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                       <div className="flex justify-between text-xs text-white/40 uppercase tracking-tighter">
                          <span>Fréquence</span>
                          <span className="font-bold text-white/80">{route.frequency}</span>
                       </div>

                       {route.pricing_mode === "per_category" ? (
                         <div className="space-y-2">
                           <div className="flex justify-between text-xs text-white/40 uppercase tracking-tighter">
                              <span className="flex items-center gap-1"><Layers size={11} /> Tarif par catégorie</span>
                           </div>
                           <div className="space-y-1">
                             {(route.category_prices || []).map((cp: any) => (
                               <div key={cp.category} className="flex justify-between text-xs">
                                 <span className="text-white/50 capitalize">{cp.category}</span>
                                 <span className="font-semibold text-accent">{cp.price_per_kg}€/kg</span>
                               </div>
                             ))}
                           </div>
                         </div>
                       ) : (
                         <div className="flex justify-between text-xs text-white/40 uppercase tracking-tighter">
                            <span>Base Tarifaire</span>
                            <span className="font-bold text-accent">{route.price_per_kg}€ / kg</span>
                         </div>
                       )}

                       {route.product_exceptions?.length > 0 && (
                         <div className="pt-2 border-t border-white/5 space-y-1">
                           <p className="text-[10px] uppercase tracking-widest text-white/30 flex items-center gap-1">
                             <Sparkles size={10} /> Exceptions
                           </p>
                           {route.product_exceptions.map((pe: any) => (
                             <div key={pe.product_id} className="flex justify-between text-xs">
                               <span className="text-white/50 truncate max-w-[60%]">{pe.product_name}</span>
                               <span className="font-semibold text-accent">{pe.price_per_kg}€/kg</span>
                             </div>
                           ))}
                         </div>
                       )}
                    </CardContent>
                 </Card>
               ))}
            </div>
          </div>
        )}

        {view === "shipments" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Fret & Colis à acheminer</h2>
            <div className="space-y-4">
               {shipments.length === 0 ? (
                 <Card className="p-12 text-center border-dashed border-white/10 bg-white/5">
                   <p className="text-white/40 italic">Aucune mission de transport assignée pour le moment.</p>
                 </Card>
               ) : (
                 shipments.map(ship => (
                   <Card key={ship.id} className="bg-white/5 border-white/10 overflow-hidden shadow-xl">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row justify-between gap-6 mb-8">
                           <div className="flex gap-4">
                              <div className="p-4 rounded-xl bg-accent/5 text-accent border border-accent/10">
                                 <Package size={32} />
                              </div>
                              <div className="space-y-1">
                                 <div className="flex items-center gap-3">
                                    <h3 className="text-lg font-bold">Colis #{ship.id}</h3>
                                    {getStatusBadge(ship.status)}
                                 </div>
                                 <p className="text-xs text-white/40 italic">{ship.description}</p>
                                 <div className="flex items-center gap-4 mt-2 text-[10px] text-white/60">
                                    <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-1 font-bold">
                                       <Weight size={10} className="text-accent" /> {ship.weight} kg
                                    </span>
                                    <span className="bg-white/5 px-2 py-0.5 rounded flex items-center gap-1">
                                       <User size={10} className="text-accent" /> {ship.client_name}
                                    </span>
                                 </div>
                              </div>
                           </div>

                           <div className="flex flex-col items-end gap-2 text-right">
                              <div className="p-3 rounded-lg bg-deep border border-white/5 space-y-1">
                                 <p className="text-[10px] uppercase text-white/20 font-bold tracking-widest">Itinéraire</p>
                                 <p className="text-sm font-bold flex items-center gap-2">
                                    {ship.origin} <ArrowRight size={12} className="text-accent" /> {ship.destination}
                                 </p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-white/5">
                           <div className="p-4 rounded-xl bg-deep border border-white/5 space-y-3">
                              <p className="text-[10px] uppercase font-bold text-white/30 flex items-center gap-2">
                                 <Clock size={12} /> Prochaine étape
                              </p>
                              {ship.status === 'REQUESTED' && (
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" onClick={() => handleUpdateStatus(ship.id, 'ACCEPTED')}>
                                   Accepter la mission
                                </Button>
                              )}
                              {ship.status === 'ACCEPTED' && (
                                <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white" onClick={() => handleUpdateStatus(ship.id, 'PICKED_UP')}>
                                   Confirmer le ramassage
                                </Button>
                              )}
                              {ship.status === 'PICKED_UP' && (
                                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white" onClick={() => handleUpdateStatus(ship.id, 'IN_TRANSIT')}>
                                   Démarrer le transit
                                </Button>
                              )}
                              {ship.status === 'IN_TRANSIT' && (
                                <div className="space-y-3">
                                   <Label className="text-[10px] text-accent font-bold uppercase">Code de validation client</Label>
                                   <Input 
                                     placeholder="Entrez le code..." 
                                     className="bg-black/20 border-accent/20 text-center font-mono tracking-[0.5em] text-lg uppercase"
                                     value={verificationCodes[ship.id] || ""}
                                     onChange={(e) => setVerificationCodes({...verificationCodes, [ship.id]: e.target.value.toUpperCase()})}
                                   />
                                   <Button className="w-full bg-accent text-accent-foreground font-bold" onClick={() => handleUpdateStatus(ship.id, 'DELIVERED')}>
                                      Confirmer la livraison
                                   </Button>
                                </div>
                              )}
                              {ship.status === 'DELIVERED' && (
                                <div className="flex items-center gap-2 text-accent font-bold text-sm bg-accent/10 p-2 rounded-lg border border-accent/20">
                                   <CheckCircle size={16} /> Mission accomplie
                                </div>
                              )}
                           </div>

                           <div className="md:col-span-2 p-4 rounded-xl bg-accent/5 border border-accent/10 flex flex-col justify-between">
                              <div className="flex items-start gap-3">
                                 <Info size={16} className="text-accent mt-0.5" />
                                 <div className="space-y-1">
                                    <p className="text-xs text-white/80 font-medium">Informations de livraison</p>
                                    <p className="text-[11px] text-white/40 leading-relaxed">
                                       Vérifiez l'état du colis lors du ramassage. Le client doit vous fournir le code de sécurité uniquement à la réception effective du colis.
                                    </p>
                                 </div>
                              </div>
                              <div className="flex gap-2 mt-4">
                                 <Button variant="ghost" className="text-[10px] uppercase font-bold text-white/40 hover:text-white" asChild>
                                    <a href={`mailto:${ship.client_email}`}>Contacter le client</a>
                                 </Button>
                                 {ship.status !== 'DELIVERED' && (
                                   <Button variant="ghost" className="text-[10px] uppercase font-bold text-red-400/60 hover:text-red-400 hover:bg-red-400/5" onClick={() => handleUpdateStatus(ship.id, 'CANCELLED')}>
                                      Annuler
                                   </Button>
                                 )}
                              </div>
                           </div>
                        </div>
                      </div>
                   </Card>
                 ))
               )}
            </div>
          </div>
        )}

        {view === "profile" && (
           <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                 <div className="lg:col-span-3 space-y-8">
                    <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl">
                       <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                         <div className="flex items-center gap-3">
                           <Truck className="text-accent" size={20} />
                           <CardTitle className="text-lg">Compte Transporteur Certifié</CardTitle>
                         </div>
                       </CardHeader>
                       <CardContent className="pt-8">
                          <form onSubmit={handleUpdateProfile} className="space-y-8">
                             <div className="space-y-4">
                                <Label className="text-xs uppercase tracking-widest text-accent font-bold">Dénomination Commerciale</Label>
                                <Input 
                                  value={profileData.profile.business_name}
                                  onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, business_name: e.target.value }})}
                                  className="bg-deep border-white/10 text-xl font-display focus:ring-accent"
                                  placeholder="Ex: Sahel Express Logistics"
                                />
                             </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-4">
                                  <Label className="text-xs uppercase tracking-widest text-accent font-bold">Contact Téléphonique</Label>
                                  <Input 
                                    value={profileData.profile.phone_number}
                                    onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, phone_number: e.target.value }})}
                                    className="bg-deep border-white/10"
                                  />
                                </div>
                                <div className="space-y-4">
                                  <Label className="text-xs uppercase tracking-widest text-accent font-bold">Type de Véhicule</Label>
                                  <select 
                                    value={profileData.profile.vehicle_type}
                                    onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, vehicle_type: e.target.value }})}
                                    className="w-full bg-deep border border-white/10 rounded-md h-10 px-3 text-sm focus:ring-1 focus:ring-accent outline-none"
                                  >
                                    <option value="MOTORCYCLE">Vélomoteur</option>
                                    <option value="VAN">Camionnette</option>
                                    <option value="TRUCK">Camion</option>
                                    <option value="OTHER">Autre</option>
                                  </select>
                                </div>
                             </div>
                             <div className="space-y-4">
                                <Label className="text-xs uppercase tracking-widest text-accent font-bold">Adresse du Siège / Dépôt</Label>
                                <textarea 
                                  value={profileData.profile.address}
                                  onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, address: e.target.value }})}
                                  className="w-full bg-deep border border-white/10 rounded-md p-4 text-sm focus:ring-1 focus:ring-accent outline-none"
                                  rows={4}
                                />
                             </div>
                             <Button type="submit" className="bg-accent text-accent-foreground w-full h-12 font-bold uppercase tracking-widest shadow-xl shadow-accent/10 transition-all hover:scale-[1.01]">
                                Mettre à jour mon identité logistique
                             </Button>
                          </form>
                       </CardContent>
                    </Card>
                 </div>

                 <div className="lg:col-span-2 space-y-6">
                    <Card className="bg-deep border-white/5 p-8 flex flex-col items-center text-center shadow-xl">
                       <div className="w-24 h-24 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center text-accent mb-6 shadow-inner relative">
                          <User size={48} />
                          <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full border-4 border-deep p-1">
                             <ShieldCheck size={16} className="text-white" />
                          </div>
                       </div>
                       <h3 className="text-xl font-display mb-1">{user?.profile?.business_name || "Expéditeur Pro"}</h3>
                       <p className="text-xs text-white/30 font-mono mb-6">{user?.email}</p>
                       <div className="w-full space-y-2">
                          <div className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">
                             <span>Statut Audité</span>
                             <span className="text-green-400">Certifié Sankhofa</span>
                          </div>
                          <div className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">
                             <span>Vérification ID</span>
                             <Badge className="bg-green-500/20 text-green-500 text-[8px] border-none">Validé</Badge>
                          </div>
                       </div>
                    </Card>

                    <div className="p-8 rounded-2xl border border-blue-500/20 bg-blue-500/5 relative overflow-hidden group">
                       <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                          <ShieldCheck size={64} className="text-blue-500" />
                       </div>
                       <h4 className="font-display text-lg mb-3 relative z-10 text-blue-400 underline decoration-blue-500/30">Badge Confiance</h4>
                       <p className="text-xs text-white/60 mb-6 leading-relaxed relative z-10">
                         Votre profil est vérifié. Cela vous permet d'apparaître en priorité dans les recommandations pour les envois Marketplace et personnels.
                       </p>
                    </div>
                 </div>
              </div>
           </div>
        )}
      </div>
    </DashboardLayout>
  );
}
