import { ChevronLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

export const FloatingBackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show button only if not on the main homepage and not in any dashboard
    setIsVisible(location.pathname !== "/" && !location.pathname.startsWith("/client/dashboard") && !location.pathname.includes("dashboard"));
  }, [location]);

  if (!isVisible) return null;

  return (
    <button
      onClick={() => {
        if (window.history.length > 1) {
          navigate(-1);
        } else {
          navigate("/");
        }
      }}
      className="fixed top-8 left-8 z-[100] flex items-center gap-2 px-5 py-2.5 bg-background/40 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:bg-background/60 hover:border-accent/40 hover:scale-105 transition-all duration-500 group animate-in fade-in slide-in-from-left-4"
    >
      <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 bg-accent/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <ChevronLeft size={18} className="relative z-10 group-hover:-translate-x-0.5 transition-transform duration-500 text-accent" />
      </div>
      <span className="relative z-10 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/80 group-hover:text-foreground transition-colors duration-500">
        Retour
      </span>
    </button>
  );
};
