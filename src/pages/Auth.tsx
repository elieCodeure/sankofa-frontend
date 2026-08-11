import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "@/api-services";
import { useGoogleLogin } from '@react-oauth/google';
import { DEMO_ACCOUNTS } from "@/services/mockDb";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Mail, Lock, ShieldCheck, ArrowLeft, Sparkles } from "lucide-react";
import sankofaMark from "@/assets/sankofa-mark.png";

const SankofaMark = ({ size = 160 }: { size?: number }) => (
  <img 
    src={sankofaMark} 
    alt="Sankofa" 
    style={{ 
      width: size, 
      height: "auto", 
      filter: "drop-shadow(0 0 40px rgba(201,168,76,0.25))" 
    }} 
  />
);

const KenteGrid = () => (
  <svg
    aria-hidden="true"
    style={{
      position: "absolute", inset: 0, width: "100%", height: "100%",
      opacity: 0.045, pointerEvents: "none"
    }}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <pattern id="kente" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M0 0h60v60H0z" fill="none" />
        <path d="M0 30h60M30 0v60" stroke="#C9A84C" strokeWidth="0.5" />
        <path d="M0 0h30v30H0zM30 30h30v30H30z" stroke="#C9A84C" strokeWidth="0.3" fill="none" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#kente)" />
  </svg>
);

const GoldInput = ({
  id, name, type = "text", placeholder, required, icon: Icon
}: {
  id: string; name: string; type?: string; placeholder?: string;
  required?: boolean; icon: React.ElementType;
}) => (
  <div style={{ position: "relative" }}>
    <Icon
      size={15}
      style={{
        position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
        color: "rgba(201,168,76,0.5)", pointerEvents: "none"
      }}
    />
    <input
      id={id} name={name} type={type} placeholder={placeholder} required={required}
      style={{
        width: "100%", background: "rgba(245,240,232,0.05)",
        border: "1px solid rgba(201,168,76,0.22)", borderRadius: 4,
        color: "#F5F0E8", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
        padding: "13px 14px 13px 42px", outline: "none",
        transition: "border-color .2s, background .2s",
        appearance: "none" as any
      }}
      onFocus={e => {
        e.target.style.borderColor = "rgba(201,168,76,0.6)";
        e.target.style.background = "rgba(245,240,232,0.09)";
      }}
      onBlur={e => {
        e.target.style.borderColor = "rgba(201,168,76,0.22)";
        e.target.style.background = "rgba(245,240,232,0.05)";
      }}
    />
  </div>
);

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const [hoverBtn, setHoverBtn] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleRedirect = (userRole: string) => {
    switch (userRole) {
      case "SELLER": navigate("/seller/dashboard"); break;
      case "TRANSPORTER": navigate("/logistics/dashboard"); break;
      default: navigate("/client/dashboard");
    }
  };

  const loginWithGoogle = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const response = await authService.googleLogin(tokenResponse.access_token);
        toast({ title: "Bienvenue !", description: "Connexion Google réussie." });
        handleRedirect(response.user.role);
      } catch (error: any) {
        toast({
          title: "Erreur",
          description: error.response?.data?.error || "Erreur de connexion Google.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "La connexion Google a échoué.",
        variant: "destructive",
      });
    }
  });

  const fillDemo = (email: string, password: string) => {
    requestAnimationFrame(() => {
      const emailInput = document.getElementById("email") as HTMLInputElement | null;
      const passwordInput = document.getElementById("password") as HTMLInputElement | null;
      if (emailInput) emailInput.value = email;
      if (passwordInput) passwordInput.value = password;
    });
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    try {
      const response = await authService.login(data.email as string, data.password as string);
      toast({ title: "Bienvenue !", description: "Connexion réussie." });
      handleRedirect(response.user.role);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    .sk-page { font-family: 'DM Sans', sans-serif; display: grid; grid-template-columns: 1fr; }
    @media (min-width: 1024px) { .sk-page { grid-template-columns: 1fr 1fr; } }
    .sk-form-container { padding: 32px 24px; }
    @media (min-width: 768px) { .sk-form-container { padding: 48px 40px; } }
    .sk-field input::placeholder { color: rgba(245,240,232,0.2); }
    .sk-social:hover { border-color: rgba(201,168,76,0.45); color: #F5F0E8; background: rgba(245,240,232,0.05); }
    .sk-submit:hover { background: #D4B05A; }
    .sk-submit:active { transform: scale(0.985); }
    .sk-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    @keyframes skFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    .sk-fadein { animation: skFadeUp 0.7s ease both; }
    .sk-fadein-1 { animation: skFadeUp 0.7s ease both 0.1s; }
    .sk-fadein-2 { animation: skFadeUp 0.7s ease both 0.25s; }
    .sk-fadein-3 { animation: skFadeUp 0.7s ease both 0.4s; }
    @keyframes skFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .sk-float { animation: skFloat 5s ease-in-out infinite; }
    .sk-deco-line {
      position: absolute; right: 0; top: 0; bottom: 0; width: 1px;
      background: linear-gradient(to bottom, transparent 5%, rgba(201,168,76,0.28) 30%, rgba(201,168,76,0.28) 70%, transparent 95%);
    }
  `;

  return (
    <>
      <style>{css}</style>
      <div className="sk-page" style={{ minHeight: "100vh", background: "#09090A", color: "#F5F0E8" }}>
        
        {/* PANNEAU GAUCHE */}
        <div
          style={{
            position: "relative", background: "#0F0F0D",
            display: "flex", flexDirection: "column",
            justifyContent: "space-between", padding: "52px 56px",
            overflow: "hidden",
          }}
          className="hidden lg:flex"
        >
          <KenteGrid />
          <div className="sk-deco-line" />

          <div
            className="sk-fadein"
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 12, letterSpacing: "0.6em",
              color: "#C9A84C", textTransform: "uppercase" as any, opacity: 0.85,
              position: "relative", zIndex: 1,
              textAlign: "center", width: "100%"
            }}
          >
            San · Kɔ · Fa
          </div>

          <div
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              flex: 1, position: "relative", zIndex: 1,
            }}
          >
            <div className="sk-float sk-fadein-1">
              <SankofaMark size={170} />
            </div>
          </div>

          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p
              className="sk-fadein-2"
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: "italic", fontWeight: 300,
                fontSize: "clamp(26px, 2.8vw, 38px)",
                lineHeight: 1.25, color: "#F5F0E8", marginBottom: 18,
                textAlign: "center"
              }}
            >
              « Se ti me a,<br />fa bi ma me. »
            </p>
            <p
              className="sk-fadein-3"
              style={{
                fontSize: 10, letterSpacing: "0.28em",
                textTransform: "uppercase" as any,
                color: "rgba(245,240,232,0.32)",
                textAlign: "center"
              }}
            >
              — Si tu en trouves, partage avec moi · Proverbe akan
            </p>
          </div>
        </div>

        {/* PANNEAU DROIT — FORMULAIRE */}
        <div className="sk-form-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#09090A" }}>
          <div
            className="sk-fadein-1"
            style={{ width: "100%", maxWidth: 420 }}
          >
            <div className="flex justify-between items-center mb-10">
              <button 
                onClick={() => navigate("/")}
                style={{
                  display: "flex", alignItems: "center", gap: 8,
                  background: "transparent", border: "none",
                  color: "rgba(201,168,76,0.6)", cursor: "pointer",
                  fontSize: 11, fontWeight: 500, letterSpacing: "0.1em",
                  textTransform: "uppercase" as any, padding: 0,
                  transition: "color .2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.6)"}
              >
                <ArrowLeft size={14} /> Accueil
              </button>
              <div className="lg:hidden">
                <SankofaMark size={48} />
              </div>
            </div>

            <div style={{ marginBottom: 32 }}>
              <h1
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: "clamp(32px,4vw,44px)", fontWeight: 300,
                  lineHeight: 1.1, color: "#F5F0E8", marginBottom: 6,
                }}
              >
                Bon <em style={{ color: "#D4B05A", fontStyle: "italic" }}>retour</em>
              </h1>
              <p style={{ fontSize: 13, color: "rgba(245,240,232,0.42)", lineHeight: 1.6 }}>
                Accédez à votre espace Sankofa
              </p>
            </div>

            <form onSubmit={handleAuth} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="sk-field">
                <label style={{
                  display: "block", fontSize: 10, letterSpacing: "0.22em",
                  textTransform: "uppercase" as any, color: "rgba(201,168,76,0.65)",
                  marginBottom: 7, fontWeight: 500,
                }}>Email</label>
                <GoldInput id="email" name="email" type="email"
                  placeholder="nom@exemple.com" required icon={Mail} />
              </div>

              <div className="sk-field">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                  <label style={{
                    fontSize: 10, letterSpacing: "0.22em",
                    textTransform: "uppercase" as any, color: "rgba(201,168,76,0.65)",
                    fontWeight: 500,
                  }}>Mot de passe</label>
                  <Link to="/forgot-password" style={{
                    fontSize: 10, color: "rgba(201,168,76,0.8)", textDecoration: "none",
                    transition: "color .2s"
                  }}>
                    Mot de passe oublié ?
                  </Link>
                </div>
                <GoldInput id="password" name="password" type="password"
                  placeholder="••••••••" required icon={Lock} />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="sk-submit"
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                style={{
                  width: "100%", background: "#C9A84C", border: "none", borderRadius: 4,
                  color: "#09090A", fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase" as any,
                  padding: "15px 20px", cursor: "pointer", transition: "background .2s, transform .15s",
                  marginTop: 4, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {loading ? "Chargement..." : "Se connecter"}
                <ArrowRight
                  size={15}
                  style={{ transition: "transform .2s", transform: hoverBtn ? "translateX(4px)" : "none" }}
                />
              </button>
            </form>

            <div style={{ textAlign: "center", marginTop: 20 }}>
              <p style={{ fontSize: 13, color: "rgba(245,240,232,0.6)" }}>
                Pas encore de compte ?{" "}
                <Link to="/register" style={{ color: "#C9A84C", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid rgba(201,168,76,0.4)" }}>
                  S'inscrire
                </Link>
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.18)" }} />
              <span style={{
                fontSize: 9, letterSpacing: "0.25em",
                textTransform: "uppercase" as any, color: "rgba(245,240,232,0.28)",
              }}>Ou continuer avec</span>
              <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.18)" }} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <button
                type="button"
                className="sk-social"
                onClick={() => loginWithGoogle()}
                style={{
                  border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4,
                  background: "transparent", color: "rgba(245,240,232,0.45)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  letterSpacing: "0.06em", padding: "11px",
                  cursor: "pointer", transition: "all .2s",
                }}
              >
                Google
              </button>
              <button
                type="button"
                className="sk-social"
                style={{
                  border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4,
                  background: "transparent", color: "rgba(245,240,232,0.45)",
                  fontFamily: "'DM Sans', sans-serif", fontSize: 12,
                  letterSpacing: "0.06em", padding: "11px",
                  cursor: "pointer", transition: "all .2s",
                }}
              >
                Apple
              </button>
            </div>

            <div style={{
              marginTop: 20, padding: "14px 16px", borderRadius: 5,
              border: "1px dashed rgba(201,168,76,0.28)", background: "rgba(201,168,76,0.04)",
            }}>
              <p style={{
                fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase" as any,
                color: "rgba(201,168,76,0.75)", fontWeight: 600, marginBottom: 10,
                display: "flex", alignItems: "center", gap: 6,
              }}>
                <Sparkles size={11} /> Comptes de démonstration
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => fillDemo(acc.email, acc.password)}
                    style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "transparent", border: "1px solid rgba(201,168,76,0.15)",
                      borderRadius: 4, padding: "8px 12px", cursor: "pointer",
                      color: "rgba(245,240,232,0.55)", fontSize: 11, fontFamily: "'DM Sans', sans-serif",
                      transition: "all .2s", textAlign: "left" as any,
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.5)"; e.currentTarget.style.color = "#F5F0E8"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(201,168,76,0.15)"; e.currentTarget.style.color = "rgba(245,240,232,0.55)"; }}
                  >
                    <span style={{ fontWeight: 600, color: "#C9A84C" }}>{acc.role}</span>
                    <span style={{ fontFamily: "monospace", fontSize: 10 }}>{acc.email}</span>
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 9, color: "rgba(245,240,232,0.25)", marginTop: 8 }}>
                Cliquez pour pré-remplir, mot de passe identique pour les trois : <strong>password123</strong>
              </p>
            </div>

            <p style={{
              fontSize: 10, color: "rgba(245,240,232,0.25)",
              display: "flex", alignItems: "center", gap: 6, marginTop: 18,
            }}>
              <ShieldCheck size={11} style={{ opacity: 0.5 }} />
              Plateforme certifiée · Données chiffrées · Hébergement africain
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Auth;