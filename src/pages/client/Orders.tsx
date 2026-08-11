
import { useState, useEffect } from "react";
import { orderService } from "@/api-services";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Info, HandHeart } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function Orders() {
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

  return (
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
  );
}
