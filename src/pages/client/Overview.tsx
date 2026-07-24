import { useState, useEffect } from "react";
import { orderService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, CheckCircle, ArrowRight, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export function Overview() {
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const ordersData = await orderService.getOrders();
      setOrders(ordersData);
    } catch (err) {
      console.error(err);
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

  return (
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
  );
}
