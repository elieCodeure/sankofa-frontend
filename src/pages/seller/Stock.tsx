import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { productService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Package, Edit, Trash2, AlertCircle, Sparkles, Eye } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function Stock() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [productForm, setProductForm] = useState<any>({
    name_fr: "", name_en: "",
    description_fr: "", description_en: "",
    price: "", currency: "EUR",
    stock_quantity: "", stock_threshold: "5",
    category: "", country: "",
    image: null, span: "square",
    tag_fr: "", tag_en: "",
    is_active: true
  });
  
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const prodData = await productService.getProducts({ my_products: 'true' });
      setProducts(prodData);
      const [catData, countryData] = await Promise.all([
        productService.getCategories(),
        productService.getCountries()
      ]);
      setCategories(catData);
      setCountries(countryData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
      const formData = new FormData();
      Object.keys(productForm).forEach(key => {
        if (productForm[key] !== null && productForm[key] !== undefined) {
          // Don't append empty string for image to avoid validation errors
          if (key === 'image' && typeof productForm[key] === 'string') {
            return; // skip if it's a string url (from backend)
          }
          formData.append(key, productForm[key]);
        }
      });

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, formData);
        toast.success("Produit mis à jour !");
      } else {
        await productService.createProduct(formData);
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

  return (
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
                       onClick={() => navigate(`/seller/dashboard/product/${product.id}`)}
                     >
                        <Eye size={12} className="mr-1" /> Voir
                     </Button>
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
  );
}
