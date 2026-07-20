import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/sankhofa/DashboardLayout";
import { authService, productService, orderService, collaborationService, logisticsService } from "@/services/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Plus, Package, ShoppingCart, Users, Truck, Store, 
  Trash2, Edit, AlertCircle, CheckCircle, Search,
  MessageCircle, Mail, Sparkles, ShieldCheck, ArrowRight, User,
  Globe, MapPin, Weight, FileText, ShoppingBag, Box, Info, AlertTriangle,
  X, HandHeart
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Tab = "overview" | "stock" | "orders" | "collab" | "profile" | "shipping";

interface DashboardSellerProps {
  view?: Tab;
}

export default function DashboardSeller({ view = "overview" }: DashboardSellerProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
    origin: user?.profile?.address || "",
    destination: "",
    weight: ""
  });

  // Form states
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<any>({
    name_fr: "", 
    name_en: "",
    description_fr: "", 
    description_en: "",
    price: "",
    currency: "EUR",
    stock_quantity: "",
    stock_threshold: "5",
    category: "",
    country: "",
    image: null,
    span: "square",
    tag_fr: "",
    tag_en: "",
    is_active: true
  });
  
  const [countries, setCountries] = useState<any[]>([]);
  const [activeLangTab, setActiveLangTab] = useState<"fr" | "en">("fr");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    profile: {
      business_name: user?.profile?.business_name || "",
      phone_number: user?.profile?.phone_number || "",
      address: user?.profile?.address || "",
    }
  });

  useEffect(() => {
    fetchData();
    // Check if redirect with order ID
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('order_id');
    if (orderId && view === 'shipping') {
      setSelectedOrderId(parseInt(orderId));
    }
  }, [view]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (view === "overview" || view === "stock") {
        const prodData = await productService.getProducts({ my_products: 'true' });
        setProducts(prodData);
        const [catData, countryData] = await Promise.all([
          productService.getCategories(),
          productService.getCountries()
        ]);
        setCategories(catData);
        setCountries(countryData);
      }
      if (view === "orders" || view === "overview" || view === "shipping") {
        const orderData = await orderService.getSellerOrders();
        setOrders(orderData);
        
        // Auto select first paid order if in shipping view and no selection
        if (view === 'shipping' && !selectedOrderId) {
            const firstPaid = orderData.find((o: any) => o.status === 'PAID');
            if (firstPaid) setSelectedOrderId(firstPaid.id);
        }
      }
      if (view === "collab") {
        const sellerData = await collaborationService.getSellers();
        setSellers(sellerData);
        const reqData = await collaborationService.getRequests();
        setRequests(reqData);
      }
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductForm({ ...productForm, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productForm);
        toast.success("Produit mis à jour !");
      } else {
        await productService.createProduct(productForm);
        toast.success("Produit créé avec succès !");
      }
      setShowProductForm(false);
      setEditingProduct(null);
      setImagePreview(null);
      fetchData();
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement du produit.");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm("Voulez-vous vraiment supprimer ce produit ?")) {
      try {
        await productService.deleteProduct(id);
        toast.success("Produit supprimé.");
        fetchData();
      } catch (err) {
        toast.error("Impossible de supprimer le produit.");
      }
    }
  };

  const handleSendRequest = async (id: number) => {
    try {
      await collaborationService.sendRequest(id);
      toast.success("Demande de connexion envoyée !");
      fetchData();
    } catch (err) {
      toast.error("Demande déjà envoyée ou erreur.");
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      toast.success("Profil boutique mis à jour !");
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
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
      window.location.href = '/seller/dashboard/orders'; // Return to orders
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

  const getPageTitle = () => {
    switch(view) {
      case 'stock': return "Gestion du Stock";
      case 'orders': return "Ventes & Commandes";
      case 'collab': return "Réseau des Artisans";
      case 'profile': return "Mon Profil Artisan";
      case 'shipping': return "Sankhofa Ship";
      default: return "Vue d'ensemble";
    }
  };

  const getPageSubtitle = () => {
    switch(view) {
      case 'stock': return "Gérez votre inventaire et vos produits.";
      case 'orders': return "Suivez vos ventes et gérez les commandes clients.";
      case 'collab': return "Échangez avec vos pairs et développez votre activité.";
      case 'profile': return "Gérez l'identité de votre boutique.";
      case 'shipping': return "Expédiez vos commandes via nos transporteurs certifiés.";
      default: return `Bienvenue, ${user?.profile?.business_name || user?.first_name}. Voici l'état de votre activité.`;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
          <div className="space-y-1">
            <h1 className="text-3xl font-display font-light text-balance">{getPageTitle()}</h1>
            <p className="text-muted-foreground">{getPageSubtitle()}</p>
          </div>
          {(view === 'overview' || view === 'shipping') && (
             <div className="flex items-center gap-2 p-3 rounded-xl bg-accent/5 border border-accent/20">
                <Store size={18} className="text-accent" />
                <span className="text-sm font-display font-bold text-accent uppercase tracking-widest">{user?.profile?.business_name || "Sankhofa Artisan"}</span>
             </div>
          )}
        </div>

        {view === "overview" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-widest">Ventes Totales</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{orders.length}</div>
                  <p className="text-[10px] text-white/40 mt-1">Commandes reçues</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-widest">Produits Actifs</CardTitle>
                  <Package className="h-4 w-4 text-accent" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.length}</div>
                  <p className="text-[10px] text-white/40 mt-1">En catalogue</p>
                </CardContent>
              </Card>
              <Card className={cn(
                "bg-white/5 border-white/10 backdrop-blur-sm",
                products.some(p => p.is_low_stock) && "border-red-500/20 bg-red-500/5"
              )}>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-medium text-white/60 uppercase tracking-widest">Alertes Stock</CardTitle>
                  <AlertCircle className={cn("h-4 w-4", products.some(p => p.is_low_stock) ? "text-red-500 animate-pulse" : "text-white/20")} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{products.filter(p => p.is_low_stock).length}</div>
                  <p className="text-[10px] text-white/40 mt-1">Produits à réapprovisionner</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
               <Card className="bg-white/5 border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg font-display tracking-wide">Dernières Commandes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {orders.length === 0 ? (
                      <p className="text-sm text-white/20 italic">Aucune vente pour le moment.</p>
                    ) : (
                      orders.slice(0, 5).map(order => (
                        <div key={order.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                          <div className="flex items-center gap-4">
                            <div className="text-accent underline font-mono text-xs">#{order.id}</div>
                            <div>
                              <p className="text-sm font-medium">{order.total_price}€</p>
                              <p className="text-[10px] text-white/40">{new Date(order.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                          <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-tighter">
                            {order.status}
                          </Badge>
                        </div>
                      ))
                    )}
                  </CardContent>
               </Card>

               <Card className="bg-accent/5 border-accent/20 border-dashed backdrop-blur-sm shadow-xl shadow-accent/5">
                  <CardHeader>
                    <CardTitle className="text-lg font-display tracking-wide text-accent">Conseil Artisan</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-deep/50 border border-border/10 flex gap-4">
                      <Sparkles className="text-accent flex-shrink-0" />
                      <p className="text-sm text-white/80 leading-relaxed">
                        Le réseautage avec d'autres vendeurs peut booster vos ventes croisées. Connectez-vous avec vos pairs !
                      </p>
                    </div>
                    <Button variant="link" className="text-accent p-0 h-auto text-xs" onClick={() => window.location.href='/seller/dashboard/collab'}>
                      Découvrir les vendeurs <ArrowRight size={12} className="ml-1" />
                    </Button>
                  </CardContent>
               </Card>
            </div>
          </div>
        )}

        {view === "stock" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Inventaire Réel</h2>
              {!showProductForm && (
                <Button onClick={() => {
                  setEditingProduct(null);
                  setImagePreview(null);
                  setProductForm({ 
                    name_fr: "", name_en: "",
                    description_fr: "", description_en: "",
                    price: "", currency: "EUR",
                    stock_quantity: "", stock_threshold: "5",
                    category: "", country: "",
                    image: null, span: "square",
                    is_active: true
                  });
                  setShowProductForm(true);
                }} className="bg-accent text-accent-foreground gap-2">
                  <Plus size={16} /> Ajouter un produit
                </Button>
              )}
            </div>

            {showProductForm ? (
              <Card className="bg-white/5 border-white/10 animate-in slide-in-from-top-4 duration-500 max-w-5xl mx-auto shadow-2xl">
                <CardHeader className="border-b border-white/5">
                  <CardTitle>{editingProduct ? "Modifier le produit" : "Ajouter un trésor au catalogue"}</CardTitle>
                  <CardDescription>Remplissez les détails avec soin pour vos clients.</CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                  <form onSubmit={handleProductSubmit} className="space-y-8">
                    <Tabs defaultValue="fr" className="w-full">
                       <TabsList className="bg-white/5 border border-white/10 mb-6">
                         <TabsTrigger value="fr" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">Français (FR)</TabsTrigger>
                         <TabsTrigger value="en" className="data-[state=active]:bg-accent data-[state=active]:text-accent-foreground">English (EN)</TabsTrigger>
                       </TabsList>
                       
                       <TabsContent value="fr" className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-white/60">Nom du produit (FR)</Label>
                              <Input 
                                value={productForm.name_fr}
                                onChange={(e) => setProductForm({...productForm, name_fr: e.target.value})}
                                className="bg-deep border-white/10 focus:border-accent"
                                required
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/60">Tag court (FR) - ex: Exclusivité</Label>
                              <Input 
                                value={productForm.tag_fr}
                                onChange={(e) => setProductForm({...productForm, tag_fr: e.target.value})}
                                className="bg-deep border-white/10 focus:border-accent"
                                placeholder="Optionnel"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-white/60">Description de l'histoire du produit (FR)</Label>
                              <textarea 
                                value={productForm.description_fr}
                                onChange={(e) => setProductForm({...productForm, description_fr: e.target.value})}
                                className="w-full bg-deep border border-white/10 rounded-md p-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                rows={4}
                                required
                              />
                            </div>
                         </div>
                       </TabsContent>

                       <TabsContent value="en" className="space-y-6">
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label className="text-white/60">Nom du produit (EN)</Label>
                              <Input 
                                value={productForm.name_en}
                                onChange={(e) => setProductForm({...productForm, name_en: e.target.value})}
                                className="bg-deep border-white/10 focus:border-accent"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label className="text-white/60">Tag court (EN) - ex: Exclusive</Label>
                              <Input 
                                value={productForm.tag_en}
                                onChange={(e) => setProductForm({...productForm, tag_en: e.target.value})}
                                className="bg-deep border-white/10 focus:border-accent"
                                placeholder="Optional"
                              />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label className="text-white/60">Product Story (EN)</Label>
                              <textarea 
                                value={productForm.description_en}
                                onChange={(e) => setProductForm({...productForm, description_en: e.target.value})}
                                className="w-full bg-deep border border-white/10 rounded-md p-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                                rows={4}
                              />
                            </div>
                         </div>
                       </TabsContent>
                    </Tabs>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t border-white/5">
                      <div className="space-y-2">
                        <Label className="text-white/60">Catégorie</Label>
                        <select 
                          value={productForm.category}
                          onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                          className="w-full bg-deep border border-white/10 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          required
                        >
                          <option value="">Sélectionner</option>
                          {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60">Pays d'origine</Label>
                        <select 
                          value={productForm.country}
                          onChange={(e) => setProductForm({...productForm, country: e.target.value})}
                          className="w-full bg-deep border border-white/10 rounded-md h-10 px-3 text-sm focus:outline-none focus:ring-1 focus:ring-accent"
                          required
                        >
                          <option value="">Sélectionner</option>
                          {countries.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60">Prix de vente</Label>
                        <div className="flex gap-2">
                          <Input 
                            type="number"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                            className="bg-deep border-white/10 focus:border-accent"
                            required
                          />
                          <select 
                            value={productForm.currency}
                            onChange={(e) => setProductForm({...productForm, currency: e.target.value})}
                            className="bg-deep border border-white/10 rounded-md px-2 text-xs"
                          >
                            <option value="EUR">€ (EUR)</option>
                            <option value="XOF">CFA (XOF)</option>
                            <option value="GHS">GH₵ (GHS)</option>
                            <option value="USD">$ (USD)</option>
                          </select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60">Layout Marketplace</Label>
                        <select 
                          value={productForm.span}
                          onChange={(e) => setProductForm({...productForm, span: e.target.value})}
                          className="w-full bg-deep border border-white/10 rounded-md h-10 px-3 text-sm"
                        >
                          <option value="square">Standard (Carré)</option>
                          <option value="tall">Vertical</option>
                          <option value="wide">Large</option>
                          <option value="large">Mise en avant (Grand)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-white/60">Stock initial</Label>
                        <Input 
                          type="number"
                          value={productForm.stock_quantity}
                          onChange={(e) => setProductForm({...productForm, stock_quantity: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60">Alerte stock faible</Label>
                        <Input 
                          type="number"
                          value={productForm.stock_threshold}
                          onChange={(e) => setProductForm({...productForm, stock_threshold: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-white/60">Image du produit</Label>
                        <div className="flex flex-col gap-4">
                           <div className="flex items-center justify-center w-full">
                              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-lg cursor-pointer bg-deep hover:bg-white/5 transition-colors">
                                 <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <Sparkles className="w-8 h-8 mb-4 text-accent/60" />
                                    <p className="mb-2 text-sm text-white/50"><span className="font-semibold text-accent">Cliquez</span> pour charger</p>
                                    <p className="text-xs text-white/20">PNG, JPG ou WEBP</p>
                                 </div>
                                 <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                              </label>
                           </div>
                           {imagePreview && (
                             <div className="relative w-20 h-20 rounded-md overflow-hidden border border-white/20">
                                <img src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                             </div>
                           )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 pt-6 border-t border-white/5">
                      <div className="flex items-center gap-2">
                        <input 
                          type="checkbox"
                          id="is_active"
                          checked={productForm.is_active}
                          onChange={(e) => setProductForm({...productForm, is_active: e.target.checked})}
                          className="w-4 h-4 rounded border-white/10 bg-deep text-accent focus:ring-accent"
                        />
                        <Label htmlFor="is_active" className="text-white/60 cursor-pointer">Publier immédiatement sur la Marketplace</Label>
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                       <Button type="button" variant="ghost" className="text-white/40 hover:text-white" onClick={() => setShowProductForm(false)}>Annuler</Button>
                       <Button type="submit" className="bg-accent text-accent-foreground px-10 py-6 text-base font-display tracking-widest uppercase shadow-xl shadow-accent/20">Mettre en ligne</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {products.length === 0 ? (
                  <Card className="col-span-full py-20 bg-white/5 border-dashed border-white/10 text-center">
                    <Package className="h-12 w-12 text-white/10 mx-auto mb-4" />
                    <p className="text-white/40 italic">Votre boutique est vide.</p>
                  </Card>
                ) : (
                  products.map(product => (
                    <Card key={product.id} className={cn(
                      "group bg-deep border-border/10 overflow-hidden relative transition-all duration-500 hover:shadow-2xl hover:shadow-accent/5",
                      product.is_low_stock && "ring-1 ring-red-500/30"
                    )}>
                      {product.is_low_stock && (
                        <div className="absolute top-3 right-3 flex items-center gap-1 bg-red-500 text-white px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest z-10 animate-pulse shadow-lg">
                          <AlertCircle size={10} /> Stock critique
                        </div>
                      )}
                      <div className="aspect-square bg-white/5 overflow-hidden">
                         <img 
                           src={product.image || "https://images.unsplash.com/photo-1544648151-5079751bfccd?auto=format&fit=crop&q=80&w=400"} 
                           className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                           alt={product.name_fr} 
                         />
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start gap-3">
                          <CardTitle className="text-base truncate">{product.name_fr}</CardTitle>
                          <span className="text-sm font-bold text-accent whitespace-nowrap">{product.price}{product.currency === 'EUR' ? '€' : product.currency}</span>
                        </div>
                        <CardDescription className="text-[9px] text-white/30 uppercase tracking-[0.2em] font-bold">
                          {product.category_name}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center text-[11px] p-2 rounded bg-white/5">
                          <span className="text-white/40">Unités restantes:</span>
                          <span className={cn("font-bold px-2 py-0.5 rounded", product.is_low_stock ? "text-red-100 bg-red-500/20" : "text-green-400 bg-green-500/10")}>
                            {product.stock_quantity}
                          </span>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="flex-1 text-[10px] h-8 bg-white/5 border-white/10 hover:bg-accent hover:text-accent-foreground"
                             onClick={() => {
                               setEditingProduct(product);
                               setImagePreview(product.image || null);
                               setProductForm({
                                 name_fr: product.name_fr,
                                 name_en: product.name_en || "",
                                 description_fr: product.description_fr,
                                 description_en: product.description_en || "",
                                 price: product.price,
                                 currency: product.currency || "EUR",
                                 stock_quantity: product.stock_quantity,
                                 stock_threshold: product.stock_threshold,
                                 category: product.category,
                                 country: product.country,
                                 image: null,
                                 span: product.span || "square",
                                 tag_fr: product.tag_fr || "",
                                 tag_en: product.tag_en || "",
                                 is_active: product.is_active
                               });
                               setShowProductForm(true);
                             }}
                           >
                              <Edit size={12} className="mr-1" /> Gérer
                           </Button>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="flex-shrink-0 h-8 w-8 p-0 border-red-500/20 text-red-500/60 hover:bg-red-500 hover:text-white"
                             onClick={() => handleDeleteProduct(product.id)}
                           >
                              <Trash2 size={12} />
                           </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {view === "orders" && (
          <div className="space-y-8">
            <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Gestion des Commandes Clients</h2>
            <div className="grid grid-cols-1 gap-4">
              {orders.length === 0 ? (
                <Card className="p-12 text-center bg-white/5 border-dashed border-white/10">
                   <p className="text-white/40 italic">Aucune commande n'a encore été passée pour vos produits.</p>
                </Card>
              ) : (
                [...orders].sort((a, b) => Number(b.shipping_delegated) - Number(a.shipping_delegated)).map(order => (
                  <Card key={order.id} className={cn(
                    "bg-white/5 border-white/10 group hover:border-accent/40 transition-colors",
                    order.shipping_delegated && order.status === 'PAID' && "ring-1 ring-accent/40 border-accent/30"
                  )}>
                    <div className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-8">
                        <div className="flex items-start gap-4">
                          <div className="p-3 rounded-xl bg-accent/10 text-accent group-hover:scale-110 transition-transform">
                             <ShoppingCart size={24} />
                          </div>
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-3">
                              <h3 className="text-lg font-medium">Contrat #{order.id}</h3>
                              <Badge variant="outline" className="text-[10px] h-5 px-3 border-accent/20 text-accent">
                                {order.status}
                              </Badge>
                              {order.shipping_delegated && order.status === 'PAID' && (
                                <Badge className="text-[10px] h-5 px-3 bg-accent text-accent-foreground gap-1">
                                  <HandHeart size={10} /> Confié par le client
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-white/40">Émis le {new Date(order.created_at).toLocaleString('fr-FR')}</p>
                          </div>
                        </div>
                        <div className="sm:text-right border-l sm:border-l-0 sm:border-r border-white/5 sm:pr-6 pl-6 sm:pl-0">
                          <p className="text-2xl font-display font-bold text-accent">{order.total_price}€</p>
                          <p className="text-[10px] text-white/30 uppercase tracking-widest">Valeur Transactionnelle</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-6 border-t border-white/5">
                        <div className="space-y-4">
                          <h4 className="text-[10px] uppercase tracking-widest text-white/20 font-bold flex items-center gap-2">
                             <Package size={12} /> Articles Concernés
                          </h4>
                          <div className="space-y-2">
                            {order.items.map((item: any) => (
                              <div key={item.id} className="flex justify-between items-center text-sm p-3 rounded bg-deep">
                                 <span className="font-medium">{item.quantity}x {item.product_name}</span>
                                 <span className="text-accent/60">{item.price}€</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4 flex flex-col justify-between">
                            <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-2">
                               <p className="text-[10px] uppercase font-bold text-green-500/60">Livraison</p>
                               <p className="text-xs text-white/90"><strong>Adresse:</strong> {order.shipping_address}</p>
                               <p className="text-xs text-white/90"><strong>Tél:</strong> {order.phone_number}</p>
                            </div>
                            {order.status === 'PAID' && (
                              <div className="flex gap-3">
                                 <Button className="flex-1 bg-accent text-accent-foreground gap-2" onClick={() => window.location.href=`/seller/dashboard/shipping?order_id=${order.id}`}>
                                    <Truck size={16} /> Expédier le colis
                                 </Button>
                                 <Button variant="outline" className="text-white/40 border-white/10 hover:bg-white/5">Détails client</Button>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}

        {view === "shipping" && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
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
        )}

        {view === "collab" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Demandes de connexion */}
              <div className="space-y-6">
                 <h3 className="text-xs uppercase tracking-widest font-bold text-accent px-1">Réception d'invitations</h3>
                 <div className="space-y-3">
                 {requests.filter(r => r.status === 'PENDING' && r.receiver === user.id).length === 0 ? (
                   <div className="p-12 border border-white/5 bg-white/[0.02] rounded-xl text-center border-dashed">
                     <Users className="mx-auto mb-3 opacity-10" size={32} />
                     <p className="text-xs text-white/20 italic">Aucune nouvelle invitation de confrère.</p>
                   </div>
                 ) : (
                   requests.filter(r => r.status === 'PENDING' && r.receiver === user.id).map(req => (
                     <Card key={req.id} className="bg-white/5 border-white/10 group animate-in slide-in-from-left-4">
                        <CardContent className="p-5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center font-bold text-accent shadow-inner">
                                {req.sender_details.first_name[0]}
                              </div>
                              <div>
                                <p className="text-sm font-bold">{req.sender_details.business_name || req.sender_details.first_name}</p>
                                <p className="text-[10px] text-accent uppercase tracking-tighter">Artisan Certifié</p>
                              </div>
                           </div>
                           <div className="flex gap-2">
                             <Button size="sm" className="bg-accent text-accent-foreground h-8 px-4" onClick={() => collaborationService.acceptRequest(req.id).then(fetchData)}>
                               Accepter
                             </Button>
                             <Button size="sm" variant="ghost" className="h-8 text-white/40 hover:text-red-400" onClick={() => collaborationService.rejectRequest(req.id).then(fetchData)}>
                               <X size={16} />
                             </Button>
                           </div>
                        </CardContent>
                     </Card>
                   ))
                 )}
                 </div>

                 <h3 className="text-xs uppercase tracking-widest font-bold text-accent px-1 pt-6 flex items-center gap-2">
                    <ShieldCheck size={14} /> Réseau de Confiance
                 </h3>
                 <div className="grid grid-cols-1 gap-3">
                   {requests.filter(r => r.status === 'ACCEPTED').length === 0 ? (
                      <p className="text-xs text-white/20 italic px-1 pt-4">Votre réseau de collaboration est encore vide.</p>
                   ) : (
                     requests.filter(r => r.status === 'ACCEPTED').map(req => {
                       const partner = req.sender === user.id ? req.receiver_details : req.sender_details;
                       return (
                         <div key={req.id} className="p-5 rounded-xl bg-deep border border-accent/10 flex items-center justify-between group hover:border-accent transition-all">
                            <div className="flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:scale-110 transition-all">
                                  <User size={18} />
                               </div>
                               <div>
                                 <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">{partner.business_name}</p>
                                 <p className="text-[10px] text-white/40">{partner.first_name} {partner.last_name}</p>
                               </div>
                            </div>
                            <div className="flex gap-2">
                               <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground shadow-lg shadow-accent/5" asChild title="WhatsApp">
                                  <a href={`https://wa.me/${partner.phone_number}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /></a>
                               </Button>
                               <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-white/10 text-white/40 hover:bg-white hover:text-black" asChild title="Email">
                                  <a href={`mailto:${partner.email}`}><Mail size={16} /></a>
                               </Button>
                            </div>
                         </div>
                       );
                     })
                   )}
                 </div>
              </div>

              {/* Annuaire des vendeurs */}
              <div className="space-y-6">
                <h3 className="text-xs uppercase tracking-widest font-bold text-white/40 px-1">Comptoirs & Ateliers Sankhofa</h3>
                <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto no-scrollbar pr-2">
                  {sellers.length === 0 ? (
                    <p className="text-sm text-white/20 italic">Aucun autre vendeur listé.</p>
                  ) : (
                    sellers.map(s => (
                      <Card key={s.id} className="bg-deep border-white/5 hover:border-accent/40 transition-all group overflow-hidden">
                        <CardContent className="p-5 flex items-center justify-between">
                           <div className="flex items-center gap-4">
                              <div className="w-14 h-14 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all">
                                 <Store size={22} className="text-white/10 group-hover:text-accent group-hover:scale-110 transition-all" />
                              </div>
                              <div>
                                 <p className="font-bold text-sm text-balance">{s.business_name || `${s.first_name} ${s.last_name}`}</p>
                                 <p className="text-[10px] text-white/40 flex items-center gap-1">
                                    <ShieldCheck size={10} className="text-accent" /> Profil Certifié
                                 </p>
                              </div>
                           </div>
                           <Button 
                             size="sm" 
                             variant="outline" 
                             className="text-[11px] font-bold h-9 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground shadow-xl transition-all"
                             onClick={() => handleSendRequest(s.id)}
                             disabled={requests.some(r => (r.sender === user.id && r.receiver === s.id) || (r.sender === s.id && r.receiver === user.id))}
                           >
                             {requests.some(r => (r.sender === user.id && r.receiver === s.id) || (r.sender === s.id && r.receiver === user.id)) ? "En relation" : "Collaborer"}
                           </Button>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "profile" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <div className="lg:col-span-3 space-y-8">
                   <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl">
                      <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Store className="text-accent" size={20} />
                            <CardTitle className="text-lg">Vitrine de l'Artisan</CardTitle>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-8">
                         <form onSubmit={handleUpdateProfile} className="space-y-8">
                            <div className="space-y-4">
                               <Label className="text-xs uppercase tracking-widest text-accent font-bold">Identité du Business</Label>
                               <Input 
                                 value={profileData.profile.business_name}
                                 onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, business_name: e.target.value }})}
                                 className="bg-deep border-white/10 text-xl font-display focus:ring-accent"
                                 placeholder="Nom de votre enseigne"
                               />
                            </div>
                            <div className="space-y-4">
                               <Label className="text-xs uppercase tracking-widest text-accent font-bold">Responsable</Label>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 <Input 
                                   value={profileData.first_name}
                                   onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                                   className="bg-deep border-white/10 focus:ring-accent"
                                   placeholder="Prénom"
                                 />
                                 <Input 
                                   value={profileData.last_name}
                                   onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                                   className="bg-deep border-white/10 focus:ring-accent"
                                   placeholder="Nom"
                                 />
                               </div>
                            </div>
                            <div className="space-y-4">
                               <Label className="text-xs uppercase tracking-widest text-accent font-bold">Contact Officiel</Label>
                               <Input 
                                 value={profileData.profile.phone_number}
                                 onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, phone_number: e.target.value }})}
                                 className="bg-deep border-white/10 focus:ring-accent placeholder:text-white/10"
                                 placeholder="Numéro WhatsApp (avec code pays)"
                               />
                            </div>
                            <div className="space-y-4">
                               <Label className="text-xs uppercase tracking-widest text-accent font-bold">Atelier / Point de retrait</Label>
                               <textarea 
                                 value={profileData.profile.address}
                                 onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, address: e.target.value }})}
                                 className="w-full bg-deep border border-white/10 rounded-md p-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                                 rows={4}
                                 placeholder="Adresse où le transporteur doit récupérer vos colis..."
                               />
                            </div>
                            <Button type="submit" className="bg-accent text-accent-foreground w-full h-12 text-sm font-bold uppercase tracking-widest shadow-xl shadow-accent/10">Valider mon identité boutique</Button>
                         </form>
                      </CardContent>
                   </Card>
                </div>

                <div className="lg:col-span-2 space-y-6">
                   <Card className="bg-deep border-white/5 p-8 flex flex-col items-center text-center shadow-xl">
                      <div className="w-24 h-24 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center text-accent mb-6 shadow-inner">
                         <User size={48} />
                      </div>
                      <h3 className="text-xl font-display mb-1">{user?.profile?.business_name || "Vendeur Sankhofa"}</h3>
                      <p className="text-xs text-white/30 font-mono mb-6">{user?.email}</p>
                      <div className="w-full space-y-2">
                         <div className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">
                            <span>Statut Compte</span>
                            <span className="text-green-400">Certifié</span>
                         </div>
                         <div className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">
                            <span>Vérification ID</span>
                            <ShieldCheck size={14} className="text-accent" />
                         </div>
                      </div>
                   </Card>

                   <div className="p-8 rounded-2xl border border-accent/20 bg-accent/5 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                         <Truck size={64} />
                      </div>
                      <h4 className="font-display text-lg mb-3 relative z-10 text-accent underline">Prêt pour l'envoi ?</h4>
                      <p className="text-xs text-white/60 mb-6 leading-relaxed relative z-10">
                        Votre adresse d'atelier est prête. Dès qu'une vente est validée, utilisez <strong>Sankhofa Ship</strong> pour commander un transporteur et acheminer votre trésor.
                      </p>
                      <Button variant="outline" className="w-full text-[10px] uppercase font-bold tracking-widest border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-500 relative z-10" onClick={() => window.location.href='/seller/dashboard/shipping'}>
                        Module Logistique <ArrowRight size={14} className="ml-2" />
                      </Button>
                   </div>
                </div>
             </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
