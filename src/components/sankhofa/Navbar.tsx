import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./Logo";
import { authService } from "@/services/api";
import { Menu, X, ShoppingCart, LogOut } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface NavbarProps {
  lang: "fr" | "en";
  setLang: (l: "fr" | "en") => void;
  showCart?: boolean;
}

export const Navbar = ({ lang, setLang, showCart = true }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { setIsOpen, totalItems } = useCart();

  // Le user vient du localStorage : on le lit après montage pour éviter
  // tout décalage entre un premier rendu et l'état réel du navigateur.
  useEffect(() => {
    setUser(authService.getCurrentUser());
  }, []);

  const dashboardHref =
    user?.role === "SELLER" ? "/seller/dashboard" : user?.role === "TRANSPORTER" ? "/logistics/dashboard" : "/client/dashboard";

  const links = {
    fr: [
      { href: "/", label: "Accueil" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/shipping", label: "Expéditions" },
      ...(user ? [{ href: dashboardHref, label: "Mon espace" }] : []),
    ],
    en: [
      { href: "/", label: "Home" },
      { href: "/marketplace", label: "Marketplace" },
      { href: "/shipping", label: "Shipments" },
      ...(user ? [{ href: dashboardHref, label: "My space" }] : []),
    ],
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/85 backdrop-blur-xl border-b border-border" : "bg-transparent"
      }`}
    >
      <nav className="container flex items-center justify-between h-16 md:h-20">
        <Logo />

        <ul className="hidden md:flex items-center gap-10 text-sm">
          {links[lang].map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="text-foreground/75 hover:text-foreground transition-colors duration-300 relative group"
              >
                {l.label}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-accent transition-all duration-500 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-6">
          <button
            onClick={() => setLang(lang === "fr" ? "en" : "fr")}
            className="text-xs tracking-[0.2em] uppercase text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Changer de langue"
          >
            <span className={lang === "fr" ? "text-foreground" : ""}>FR</span>
            <span className="mx-1.5 opacity-40">/</span>
            <span className={lang === "en" ? "text-foreground" : ""}>EN</span>
          </button>
          {showCart && (
            <button 
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-foreground/75 hover:text-accent transition-colors"
            >
              <ShoppingCart size={20} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 flex items-center justify-center w-4 h-4 bg-accent text-[8px] font-bold text-accent-foreground rounded-full">
                  {totalItems}
                </span>
              )}
            </button>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {lang === "fr" ? "Bonjour" : "Hi"}, {user.first_name}
              </span>
              <button
                onClick={() => authService.logout()}
                aria-label={lang === "fr" ? "Se déconnecter" : "Log out"}
                className="p-2 text-foreground/60 hover:text-accent transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <a
              href="/auth"
              className="text-sm px-5 py-2.5 bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-all duration-500"
            >
              {lang === "fr" ? "Commencer" : "Get started"}
            </a>
          )}
        </div>

        <button
          className="md:hidden p-2 -mr-2"
          onClick={() => setOpen(!open)}
          aria-label="Menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <ul className="container py-6 space-y-4">
            {links[lang].map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block py-2 font-display text-2xl"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li className="pt-4 flex items-center justify-between border-t border-border">
              <button
                onClick={() => setLang(lang === "fr" ? "en" : "fr")}
                className="text-xs tracking-[0.2em] uppercase"
              >
                {lang === "fr" ? "EN" : "FR"}
              </button>
              {user ? (
                <button
                  onClick={() => authService.logout()}
                  className="text-sm px-5 py-2.5 bg-foreground text-background flex items-center gap-2"
                >
                  <LogOut size={16} /> {lang === "fr" ? "Déconnexion" : "Log out"}
                </button>
              ) : (
                <a
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="text-sm px-5 py-2.5 bg-foreground text-background"
                >
                  {lang === "fr" ? "Commencer" : "Get started"}
                </a>
              )}
            </li>
          </ul>
        </div>
      )}
    </header>
  );
};
