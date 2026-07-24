import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Package, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const data = await productService.getProduct(id);
        setProduct(data);
      } catch (error) {
        toast.error("Impossible de charger le produit.");
        navigate("/seller/dashboard/stock");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Sparkles className="w-8 h-8 text-accent animate-pulse" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center text-white/50 py-12">
        <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Produit introuvable</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon" 
          className="bg-transparent border-white/10 hover:bg-white/5"
          onClick={() => navigate("/seller/dashboard/stock")}
        >
          <ArrowLeft size={16} />
        </Button>
        <h2 className="text-xl font-bold uppercase tracking-widest text-accent">Détails du Produit</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="aspect-square bg-deep rounded-xl overflow-hidden border border-white/10 relative">
            <img 
              src={product.image || "https://images.unsplash.com/photo-1544648151-5079751bfccd?auto=format&fit=crop&q=80&w=800"} 
              alt={product.name_fr}
              className="w-full h-full object-cover"
            />
            {product.is_low_stock && (
              <div className="absolute top-4 right-4 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest shadow-lg backdrop-blur-md">
                Stock critique
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/5 border-white/10 shadow-2xl">
            <CardHeader className="border-b border-white/5 pb-6">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-2xl md:text-3xl font-display mb-2">{product.name_fr}</CardTitle>
                  <CardDescription className="text-sm font-bold tracking-[0.2em] uppercase text-white/40">
                    {product.category_name} • {product.country_name}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-accent whitespace-nowrap">
                    {product.price}<span className="text-xl">{product.currency === 'EUR' ? '€' : product.currency}</span>
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-8">
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-widest text-white/40">Histoire du produit</h4>
                <p className="text-sm text-white/80 leading-relaxed">
                  {product.description_fr}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-deep border border-white/5 rounded-lg p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Stock disponible</p>
                  <p className={cn("text-xl font-bold", product.is_low_stock ? "text-red-400" : "text-green-400")}>
                    {product.stock_quantity} unités
                  </p>
                </div>
                <div className="bg-deep border border-white/5 rounded-lg p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Seuil d'alerte</p>
                  <p className="text-xl font-bold text-white/80">
                    {product.stock_threshold} unités
                  </p>
                </div>
                <div className="bg-deep border border-white/5 rounded-lg p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Statut</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={cn("w-2 h-2 rounded-full", product.is_active ? "bg-green-500" : "bg-red-500")} />
                    <span className="text-sm font-semibold">{product.is_active ? "En ligne" : "Hors ligne"}</span>
                  </div>
                </div>
                <div className="bg-deep border border-white/5 rounded-lg p-4">
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Tag promotionnel</p>
                  <p className="text-sm font-bold text-accent">
                    {product.tag_fr || "Aucun"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
