import { useState, useEffect } from "react";
import { authService, productService, orderService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, ShoppingCart, AlertCircle, Sparkles, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Overview() {
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const prodData = await productService.getProducts({ my_products: 'true' });
        setProducts(prodData);
        
        const orderData = await orderService.getSellerOrders();
        setOrders(orderData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
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
  );
}
