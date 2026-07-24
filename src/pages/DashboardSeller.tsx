import { authService } from "@/api-services";
import { DashboardLayout } from "@/components/sankhofa/DashboardLayout";
import { Store } from "lucide-react";
import { Overview, Stock, Orders, Shipping, Collab, Profile, ProductDetail } from "./seller";

type Tab = "overview" | "stock" | "orders" | "collab" | "profile" | "shipping" | "productDetail";

interface DashboardSellerProps {
  view?: Tab;
}

export default function DashboardSeller({ view = "overview" }: DashboardSellerProps) {
  const user = authService.getCurrentUser();

  const getPageTitle = () => {
    switch(view) {
      case 'stock': return "Gestion du Stock";
      case 'orders': return "Ventes & Commandes";
      case 'collab': return "Réseau des Artisans";
      case 'profile': return "Mon Profil Artisan";
      case 'shipping': return "Sankhofa Ship";
      case 'productDetail': return "";
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
      case 'productDetail': return "";
      default: return `Bienvenue, ${user?.profile?.business_name || user?.first_name}. Voici l'état de votre activité.`;
    }
  };

  const renderView = () => {
    switch(view) {
      case 'overview': return <Overview />;
      case 'stock': return <Stock />;
      case 'orders': return <Orders />;
      case 'shipping': return <Shipping />;
      case 'collab': return <Collab />;
      case 'profile': return <Profile />;
      case 'productDetail': return <ProductDetail />;
      default: return <Overview />;
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
        {renderView()}
      </div>
    </DashboardLayout>
  );
}
