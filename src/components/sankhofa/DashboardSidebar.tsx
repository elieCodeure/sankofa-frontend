import { Link, useLocation } from "react-router-dom";
import { Store, Package, Truck, User, LogOut, LayoutDashboard, ChevronRight, X, Users, MapPin } from "lucide-react";
import { authService } from "@/services/api";
import { cn } from "@/lib/utils";

export const DashboardSidebar = ({ isOpen, onClose }: DashboardSidebarProps) => {
  const location = useLocation();
  const user = authService.getCurrentUser();
  const role = user?.role || "CLIENT";

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: "Vue d'ensemble", 
      path: role === "SELLER" ? "/seller/dashboard" : role === "TRANSPORTER" ? "/logistics/dashboard" : "/client/dashboard",
      role: "all" 
    },
    { 
      icon: Store, 
      label: "Boutique", 
      path: "/marketplace", 
      role: "CLIENT" 
    },
    { 
      icon: Store, 
      label: "Ma Boutique", 
      path: "/seller/dashboard/stock", 
      role: "SELLER" 
    },
    { icon: Package, label: "Mes Commandes", path: "/client/dashboard/orders", role: "CLIENT" },
    { icon: Truck, label: "Sankhofa Ship", path: "/client/dashboard/shipping", role: "CLIENT" },
    { icon: Package, label: "Ventes & Commandes", path: "/seller/dashboard/orders", role: "SELLER" },
    { icon: Truck, label: "Sankhofa Ship", path: "/seller/dashboard/shipping", role: "SELLER" },
    { icon: Users, label: "Réseau & Collab", path: "/seller/dashboard/collab", role: "SELLER" },
    { icon: MapPin, label: "Mes Itinéraires", path: "/logistics/dashboard/routes", role: "TRANSPORTER" },
    { icon: Package, label: "Mes Livraisons", path: "/logistics/dashboard/shipments", role: "TRANSPORTER" },
    { icon: User, label: "Mon Profil", path: role === "SELLER" ? "/seller/dashboard/profile" : role === "TRANSPORTER" ? "/logistics/dashboard/profile" : "/client/dashboard/profile", role: "all" },
  ];

  const filteredItems = menuItems.filter(item => item.role === "all" || item.role === role);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div className={cn(
        "fixed left-0 top-0 h-screen bg-deep border-r border-border/10 flex flex-col z-[70] transition-transform duration-300 ease-in-out w-64",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="p-8 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display tracking-widest text-accent">SAN · KƆ · FA</h2>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/40 mt-1">
              {role === "SELLER" ? "Espace Artisan" : role === "TRANSPORTER" ? "Logistique" : "Espace Acheteur"}
            </p>
          </div>
          <button onClick={onClose} className="lg:hidden text-white/40 hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => { if (window.innerWidth < 1024) onClose(); }}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-300 group",
                  isActive 
                    ? "bg-accent/10 text-accent font-medium" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon size={18} className={cn("transition-transform group-hover:scale-110", isActive && "text-accent")} />
                  <span className="text-sm tracking-wide">{item.label}</span>
                </div>
                {isActive && <ChevronRight size={14} />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-border/10">
          <div className="flex items-center gap-3 px-4 py-4 mb-2">
            <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center border border-accent/30 text-accent">
              <User size={20} />
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-medium text-white truncate">{user?.first_name || 'Utilisateur'}</span>
              <span className="text-xs text-white/40 truncate">{user?.email}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-white/40 hover:text-red-400 hover:bg-red-400/5 rounded-lg transition-all duration-300"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Déconnexion</span>
          </button>
        </div>
      </div>
    </>
  );
};
