import { useState, useEffect } from "react";
import { orderService } from "@/api-services";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Package, Truck, HandHeart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

export function Orders() {
  const [orders, setOrders] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const orderData = await orderService.getSellerOrders();
        setOrders(orderData);
      } catch (err) {
        console.error(err);
      }
    };
    fetchOrders();
  }, []);

  return (
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
                           <Button className="flex-1 bg-accent text-accent-foreground gap-2" onClick={() => navigate(`/seller/dashboard/shipping?order_id=${order.id}`)}>
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
  );
}
