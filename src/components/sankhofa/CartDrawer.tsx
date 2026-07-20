import React, { useState } from 'react';
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetFooter,
  SheetDescription
} from "@/components/ui/sheet";
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { orderService, authService } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface CartDrawerProps {
  lang: 'fr' | 'en';
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ lang }) => {
  const { cart, removeFromCart, updateQuantity, totalPrice, totalItems, isOpen, setIsOpen, clearCart } = useCart();
  const [step, setStep] = useState<'cart' | 'checkout'>('cart');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const user = authService.getCurrentUser();
  
  const [shippingData, setShippingData] = useState({
    shipping_address: '',
    phone_number: ''
  });
  const [shippingResponsibility, setShippingResponsibility] = useState<'self' | 'seller'>('self');

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingData.shipping_address || !shippingData.phone_number) {
      toast({
        title: lang === 'fr' ? "Erreur" : "Error",
        description: lang === 'fr' ? "Veuillez remplir tous les champs" : "Please fill all fields",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          product_id: item.id,
          product_name: item.name[lang],
          quantity: item.quantity,
          price: item.price
        })),
        shipping_address: shippingData.shipping_address,
        phone_number: shippingData.phone_number,
        shipping_delegated: shippingResponsibility === 'seller'
      };

      await orderService.createOrder(orderData);
      
      toast({
        title: lang === 'fr' ? "Commande confirmée !" : "Order confirmed!",
        description: lang === 'fr' 
          ? "Un mail de confirmation vous a été envoyé ainsi qu'au vendeur." 
          : "A confirmation email has been sent to you and the seller.",
      });
      
      clearCart();
      setIsOpen(false);
      setStep('cart');
      setShippingData({ shipping_address: '', phone_number: '' });
      setShippingResponsibility('self');
    } catch (error) {
      toast({
        title: lang === 'fr' ? "Erreur" : "Error",
        description: lang === 'fr' ? "Une erreur est survenue lors de la commande." : "An error occurred during checkout.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-md bg-background flex flex-col p-0 border-l border-white/5 shadow-2xl">
        <SheetHeader className="p-6 border-b border-white/5">
          <SheetTitle className="flex items-center gap-3 font-display text-2xl tracking-tight">
            <ShoppingBag className="w-6 h-6 text-accent" />
            {step === 'cart' 
              ? (lang === 'fr' ? 'Votre Panier' : 'Your Cart')
              : (lang === 'fr' ? 'Finalisation' : 'Checkout')
            }
            <span className="ml-auto text-xs font-sans font-normal text-muted-foreground bg-secondary px-2 py-1">
              {totalItems} {lang === 'fr' ? 'articles' : 'items'}
            </span>
          </SheetTitle>
          <SheetDescription className="text-xs text-muted-foreground/60 font-light mt-1">
            {step === 'cart' 
              ? (lang === 'fr' ? 'Gérez vos articles avant de finaliser.' : 'Manage your items before checkout.')
              : (lang === 'fr' ? 'Remplissez vos informations de livraison.' : 'Fill in your shipping details.')
            }
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-hidden flex flex-col">
          {step === 'cart' ? (
            cart.length > 0 ? (
              <ScrollArea className="flex-1 px-6">
                <div className="py-6 space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-24 bg-secondary overflow-hidden shrink-0">
                        <img 
                          src={item.image} 
                          alt={item.name[lang]} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="text-sm font-medium leading-none mb-1">{item.name[lang]}</h4>
                          <p className="text-xs text-muted-foreground uppercase tracking-widest">{item.price} {item.currency}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-white/10 bg-secondary/30">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="p-1 px-2 hover:bg-white/5 transition-colors"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs w-8 text-center">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="p-1 px-2 hover:bg-white/5 transition-colors"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="text-muted-foreground hover:text-destructive transition-colors ml-auto"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-40">
                <ShoppingBag className="w-12 h-12 mb-4" />
                <p className="text-sm tracking-widest uppercase">{lang === 'fr' ? 'Le panier est vide' : 'Cart is empty'}</p>
                <Button variant="link" onClick={() => setIsOpen(false)} className="mt-4">
                  {lang === 'fr' ? 'Retourner à la boutique' : 'Back to shop'}
                </Button>
              </div>
            )
          ) : (
            <div className="flex-1 px-6 py-8 overflow-y-auto">
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Truck size={12} className="text-accent" />
                    {lang === 'fr' ? 'Adresse de livraison' : 'Shipping Address'}
                  </label>
                  <Textarea 
                    placeholder={lang === 'fr' ? "Rue, Ville, Pays..." : "Street, City, Country..."}
                    value={shippingData.shipping_address}
                    onChange={(e) => setShippingData({...shippingData, shipping_address: e.target.value})}
                    className="min-h-[100px] bg-secondary/30 border-white/5 focus:ring-accent rounded-none resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    {lang === 'fr' ? 'Téléphone' : 'Phone Number'}
                  </label>
                  <Input 
                    type="tel"
                    placeholder="+221 ..."
                    value={shippingData.phone_number}
                    onChange={(e) => setShippingData({...shippingData, phone_number: e.target.value})}
                    className="bg-secondary/30 border-white/5 focus:ring-accent rounded-none"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <Truck size={12} className="text-accent" />
                    {lang === 'fr' ? "Qui s'occupe de l'expédition ?" : 'Who handles shipping?'}
                  </label>
                  <div className="grid grid-cols-1 gap-2">
                    <button
                      type="button"
                      onClick={() => setShippingResponsibility('self')}
                      className={`text-left p-3 border transition-all ${
                        shippingResponsibility === 'self'
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-white/10 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {lang === 'fr' ? "Je m'en occupe moi-même" : "I'll handle it myself"}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {lang === 'fr'
                          ? "Vous choisirez un transporteur via Sankhofa Ship après la commande."
                          : "You'll choose a carrier via Sankhofa Ship after ordering."}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShippingResponsibility('seller')}
                      className={`text-left p-3 border transition-all ${
                        shippingResponsibility === 'seller'
                          ? 'border-accent bg-accent/5 text-foreground'
                          : 'border-white/10 text-muted-foreground hover:border-white/20'
                      }`}
                    >
                      <p className="text-sm font-medium">
                        {lang === 'fr' ? 'Confier au vendeur' : 'Let the seller handle it'}
                      </p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        {lang === 'fr'
                          ? "Le vendeur choisira et paiera l'expédition pour vous."
                          : "The seller will arrange and cover the shipment for you."}
                      </p>
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-accent/5 border border-accent/10 space-y-3">
                   <p className="text-[10px] uppercase tracking-widest text-accent font-bold">
                     {lang === 'fr' ? 'Récapitulatif' : 'Summary'}
                   </p>
                   {cart.map(item => (
                     <div key={item.id} className="flex justify-between text-[11px] text-muted-foreground">
                        <span>{item.quantity}x {item.name[lang]}</span>
                        <span>{item.price * item.quantity} {item.currency}</span>
                     </div>
                   ))}
                </div>
              </form>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <SheetFooter className="p-6 border-t border-white/5 bg-secondary/10 sm:flex-col gap-4">
            <div className="w-full flex justify-between items-end mb-2">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total</span>
              <span className="text-2xl font-display text-accent">{totalPrice.toFixed(2)} {cart[0]?.currency}</span>
            </div>
            
            {step === 'cart' ? (
              user ? (
                <Button 
                  onClick={() => setStep('checkout')}
                  className="w-full py-7 text-sm tracking-[0.2em] uppercase bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-all duration-500 rounded-none group"
                >
                  {lang === 'fr' ? 'Passer à la caisse' : 'Proceed to Checkout'}
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              ) : (
                <div className="w-full space-y-3">
                  <p className="text-[10px] text-center uppercase tracking-widest text-muted-foreground italic">
                    {lang === 'fr' ? 'Connectez-vous pour finaliser la commande' : 'Login to finalize your order'}
                  </p>
                  <Button 
                    onClick={() => window.location.href = '/auth'}
                    className="w-full py-7 text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground shadow-lg shadow-accent/20 rounded-none"
                  >
                    {lang === 'fr' ? 'Se connecter / S\'inscrire' : 'Login / Sign Up'}
                  </Button>
                </div>
              )
            ) : (
              <div className="flex flex-col gap-2 w-full">
                <Button 
                  type="submit"
                  form="checkout-form"
                  disabled={loading}
                  className="w-full py-7 text-sm tracking-[0.2em] uppercase bg-accent text-accent-foreground shadow-xl shadow-accent/20 rounded-none"
                >
                  {loading 
                    ? (lang === 'fr' ? 'Traitement...' : 'Processing...') 
                    : (lang === 'fr' ? 'Confirmer la commande' : 'Confirm Order')
                  }
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setStep('cart')}
                  className="text-[10px] uppercase tracking-widest text-muted-foreground hover:text-white"
                >
                  {lang === 'fr' ? 'Retour au panier' : 'Back to cart'}
                </Button>
              </div>
            )}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
};
