import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authService } from "@/api-services";
import { useGoogleLogin } from '@react-oauth/google';
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, Mail, Lock, ShieldCheck, Store, Truck, User, ArrowLeft, CheckCircle2 } from "lucide-react";
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
  id, name, type = "text", placeholder, required, icon: Icon, value, onChange
}: {
  id: string; name: string; type?: string; placeholder?: string;
  required?: boolean; icon: React.ElementType; value?: string; onChange?: (e: any) => void;
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
      value={value} onChange={onChange}
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

const roles = [
  { value: "CLIENT", label: "Client", sub: "Acheteur", icon: User },
  { value: "SELLER", label: "Vendeur", sub: "Artisan", icon: Store },
  { value: "TRANSPORTER", label: "Expéditeur", sub: "Logistique", icon: Truck },
];

const Register = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    role: "CLIENT",
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    business_name: "",
    vehicle_type: "MOTORCYCLE",
    coverage_area: "",
    id_card: null as File | null,
  });
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
        const response = await authService.googleRegister(tokenResponse.access_token, formData.role);
        toast({ 
          title: "Compte créé !", 
          description: response.message || "Un email d'activation a été envoyé." 
        });
        navigate("/auth");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target.type === 'file') {
      const file = (e.target as HTMLInputElement).files?.[0] || null;
      setFormData((prev) => ({ ...prev, [name]: file }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleNextStep = () => {
    if (step === 2 && formData.role === "CLIENT") {
      submitForm();
    } else {
      setStep(prev => prev + 1);
    }
  };

  const submitForm = async () => {
    setLoading(true);
    try {
      await authService.register({ ...formData });
      toast({
        title: "Compte créé !",
        description: formData.role === "CLIENT"
          ? "Bienvenue sur Sankofa. Un email d'activation a été envoyé."
          : "Votre dossier est en attente de validation.",
      });
      navigate("/auth");
    } catch (error: any) {
      let errorMessage = error.message || "Une erreur est survenue lors de l'inscription.";
      
      // apiClient stringifies the JSON response if it doesn't have detail/message/error properties
      try {
        const parsed = JSON.parse(errorMessage);
        if (typeof parsed === 'object' && parsed !== null) {
          const firstKey = Object.keys(parsed)[0];
          const firstError = parsed[firstKey];
          errorMessage = Array.isArray(firstError) ? firstError[0] : String(firstError);
        }
      } catch (e) {
        // Not a JSON string, keep errorMessage as is
      }

      toast({
        title: "Erreur d'inscription",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitForm();
  };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=DM+Sans:wght@300;400;500&display=swap');
    .sk-page { font-family: 'DM Sans', sans-serif; display: grid; grid-template-columns: 1fr; }
    @media (min-width: 1024px) { .sk-page { grid-template-columns: 1fr 1fr; } }
    .sk-form-container { padding: 32px 24px; }
    @media (min-width: 768px) { .sk-form-container { padding: 48px 40px; } }
    .sk-field input::placeholder { color: rgba(245,240,232,0.2); }
    .sk-pill-active { border-color: #C9A84C !important; background: rgba(201,168,76,0.12) !important; color: #E2C47A !important; }
    .sk-pill:not(.sk-pill-active):hover { border-color: rgba(201,168,76,0.4); color: #F5F0E8; }
    .sk-social:hover { border-color: rgba(201,168,76,0.45); color: #F5F0E8; background: rgba(245,240,232,0.05); }
    .sk-submit:hover { background: #D4B05A; }
    .sk-submit:active { transform: scale(0.985); }
    .sk-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    @keyframes skFadeUp { from { opacity: 0; transform: translateY(18px); } to { opacity: 1; transform: translateY(0); } }
    .sk-fadein { animation: skFadeUp 0.7s ease both; }
    .sk-fadein-1 { animation: skFadeUp 0.7s ease both 0.1s; }
    .sk-fadein-2 { animation: skFadeUp 0.7s ease both 0.25s; }
    @keyframes skFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
    .sk-float { animation: skFloat 5s ease-in-out infinite; }
    @keyframes skSlideDown { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
    .sk-slide { animation: skSlideDown 0.35s ease both; }
    input[type=file].sk-file { color: rgba(245,240,232,0.5); font-size: 13px; }
    input[type=file].sk-file::file-selector-button {
      background: rgba(201,168,76,0.12); border: 1px solid rgba(201,168,76,0.3);
      color: #C9A84C; border-radius: 3px; padding: 4px 10px; font-size: 12px;
      font-family: 'DM Sans', sans-serif; cursor: pointer; margin-right: 10px;
    }
    select.sk-select { color: #F5F0E8; }
    select.sk-select option { background: #1A1A18; }
    .sk-deco-line {
      position: absolute; right: 0; top: 0; bottom: 0; width: 1px;
      background: linear-gradient(to bottom, transparent 5%, rgba(201,168,76,0.28) 30%, rgba(201,168,76,0.28) 70%, transparent 95%);
    }
    
    .stepper-indicator {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 32px;
    }
    .step-dot {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 600;
      border: 1px solid rgba(201,168,76,0.3);
      color: rgba(245,240,232,0.5);
      transition: all 0.3s;
    }
    .step-dot.active {
      background: rgba(201,168,76,0.15);
      border-color: #C9A84C;
      color: #C9A84C;
    }
    .step-dot.completed {
      background: #C9A84C;
      border-color: #C9A84C;
      color: #09090A;
    }
    .step-line {
      flex: 1;
      height: 1px;
      background: rgba(201,168,76,0.2);
    }
    .step-line.active {
      background: #C9A84C;
    }
  `;

  const inp = {
    width: "100%", background: "rgba(245,240,232,0.05)",
    border: "1px solid rgba(201,168,76,0.22)", borderRadius: 4,
    color: "#F5F0E8", fontFamily: "'DM Sans', sans-serif", fontSize: 14,
    padding: "13px 14px 13px 42px", outline: "none",
    transition: "border-color .2s, background .2s",
  } as React.CSSProperties;

  const totalSteps = formData.role === "CLIENT" ? 2 : 3;

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
          <div className="sk-fadein" style={{
            fontFamily: "'Cormorant Garamond', serif", fontSize: 12, letterSpacing: "0.6em",
            color: "#C9A84C", textTransform: "uppercase", opacity: 0.85, position: "relative", zIndex: 1,
            textAlign: "center", width: "100%"
          }}>
            San · Kɔ · Fa
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", flex: 1, position: "relative", zIndex: 1 }}>
            <div className="sk-float sk-fadein-1">
              <SankofaMark size={170} />
            </div>
          </div>
          <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
            <p className="sk-fadein-2" style={{
              fontFamily: "'Cormorant Garamond', serif", fontStyle: "italic", fontWeight: 300,
              fontSize: "clamp(26px, 2.8vw, 38px)", lineHeight: 1.25, color: "#F5F0E8", marginBottom: 18,
            }}>
              « Se ti me a,<br />fa bi ma me. »
            </p>
            <p className="sk-fadein-3" style={{
              fontSize: 10, letterSpacing: "0.28em", textTransform: "uppercase", color: "rgba(245,240,232,0.32)",
            }}>
              — Si tu en trouves, partage avec moi · Proverbe akan
            </p>
          </div>
        </div>

        {/* PANNEAU DROIT — FORMULAIRE */}
        <div className="sk-form-container" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#09090A" }}>
          <div className="sk-fadein-1" style={{ width: "100%", maxWidth: 420 }}>
            
            <div className="flex justify-between items-center mb-8">
              <button 
                onClick={() => step > 1 ? setStep(step - 1) : navigate("/auth")}
                style={{
                  display: "flex", alignItems: "center", gap: 8, background: "transparent", border: "none",
                  color: "rgba(201,168,76,0.6)", cursor: "pointer", fontSize: 11, fontWeight: 500, 
                  letterSpacing: "0.1em", textTransform: "uppercase", padding: 0, transition: "color .2s"
                }}
                onMouseEnter={e => e.currentTarget.style.color = "#C9A84C"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(201,168,76,0.6)"}
              >
                <ArrowLeft size={14} /> {step > 1 ? "Retour" : "Se connecter"}
              </button>
              <div className="lg:hidden"><SankofaMark size={48} /></div>
            </div>

            <div style={{ marginBottom: 28 }}>
              <h1 style={{
                fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(32px,4vw,44px)", fontWeight: 300,
                lineHeight: 1.1, color: "#F5F0E8", marginBottom: 6,
              }}>
                Rejoignez <em style={{ color: "#D4B05A", fontStyle: "italic" }}>l'héritage</em>
              </h1>
              <p style={{ fontSize: 13, color: "rgba(245,240,232,0.42)", lineHeight: 1.6 }}>
                Démarrez votre aventure africaine avec nous
              </p>
            </div>

            {/* Stepper Indicator */}
            <div className="stepper-indicator">
              {[...Array(totalSteps)].map((_, index) => {
                const s = index + 1;
                const isCompleted = s < step;
                const isActive = s === step;
                
                return (
                  <React.Fragment key={s}>
                    <div className={`step-dot ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                      {isCompleted ? <CheckCircle2 size={16} /> : s}
                    </div>
                    {s < totalSteps && (
                      <div className={`step-line ${isCompleted ? 'active' : ''}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              
              {/* STEP 1: TYPE DE COMPTE */}
              {step === 1 && (
                <div className="sk-slide">
                  <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 12, fontWeight: 500 }}>
                    Choisissez votre profil
                  </label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                    {roles.map(({ value, label, sub, icon: Icon }) => (
                      <button
                        key={value} type="button"
                        className={`sk-pill ${formData.role === value ? "sk-pill-active" : ""}`}
                        onClick={() => setFormData({ ...formData, role: value })}
                        style={{
                          border: "1px solid rgba(201,168,76,0.2)", borderRadius: 8, background: "transparent",
                          color: "rgba(245,240,232,0.45)", fontFamily: "'DM Sans', sans-serif", padding: "16px",
                          cursor: "pointer", transition: "all .2s", display: "flex", alignItems: "center", gap: 16,
                          textAlign: "left"
                        }}
                      >
                        <div style={{ 
                          width: 40, height: 40, borderRadius: "50%", background: formData.role === value ? "rgba(201,168,76,0.2)" : "rgba(245,240,232,0.05)",
                          display: "flex", alignItems: "center", justifyContent: "center", color: formData.role === value ? "#C9A84C" : "rgba(201,168,76,0.6)"
                        }}>
                          <Icon size={20} />
                        </div>
                        <div>
                          <span style={{ display: "block", fontSize: 14, fontWeight: 600, color: formData.role === value ? "#C9A84C" : "#F5F0E8" }}>{label}</span>
                          <span style={{ fontSize: 11, color: "rgba(245,240,232,0.5)" }}>{sub}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: INFO PERSONNELLES */}
              {step === 2 && (
                <div className="sk-slide" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 8 }}>
                    <button type="button" className="sk-social" onClick={() => loginWithGoogle()} style={{ border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, background: "transparent", color: "rgba(245,240,232,0.45)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.06em", padding: "11px", cursor: "pointer", transition: "all .2s" }}>
                      Continuer avec Google
                    </button>
                    <button type="button" className="sk-social" style={{ border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, background: "transparent", color: "rgba(245,240,232,0.45)", fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: "0.06em", padding: "11px", cursor: "pointer", transition: "all .2s" }}>
                      Continuer avec Apple
                    </button>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "8px 0" }}>
                    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.18)" }} />
                    <span style={{ fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(245,240,232,0.28)" }}>Ou avec un email</span>
                    <div style={{ flex: 1, height: 1, background: "rgba(201,168,76,0.18)" }} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div className="sk-field">
                      <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Prénom</label>
                      <GoldInput id="first_name" name="first_name" placeholder="Prénom" value={formData.first_name} onChange={handleInputChange} required icon={User} />
                    </div>
                    <div className="sk-field">
                      <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Nom</label>
                      <GoldInput id="last_name" name="last_name" placeholder="Nom" value={formData.last_name} onChange={handleInputChange} required icon={User} />
                    </div>
                  </div>
                  <div className="sk-field">
                    <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Email</label>
                    <GoldInput id="email" name="email" type="email" placeholder="nom@exemple.com" value={formData.email} onChange={handleInputChange} required icon={Mail} />
                  </div>
                  <div className="sk-field">
                    <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Mot de passe</label>
                    <GoldInput id="password" name="password" type="password" placeholder="••••••••" value={formData.password} onChange={handleInputChange} required icon={Lock} />
                  </div>
                </div>
              )}

              {/* STEP 3: INFOS PRO */}
              {step === 3 && (
                <div className="sk-slide" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  
                  {formData.role === "SELLER" && (
                    <div className="sk-field">
                      <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Nom de la boutique</label>
                      <GoldInput id="business_name" name="business_name" value={formData.business_name} onChange={handleInputChange} placeholder="Ex: Ateliers d'Abidjan" required icon={Store} />
                    </div>
                  )}

                  {formData.role === "TRANSPORTER" && (
                    <>
                      <div className="sk-field">
                        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Type de véhicule</label>
                        <div style={{ position: "relative" }}>
                          <Truck size={15} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(201,168,76,0.5)", pointerEvents: "none" }} />
                          <select name="vehicle_type" value={formData.vehicle_type} onChange={handleInputChange} className="sk-select" style={{ ...inp, padding: "13px 14px 13px 42px" }}>
                            <option value="MOTORCYCLE">Vélomoteur</option>
                            <option value="VAN">Camionnette</option>
                            <option value="TRUCK">Camion</option>
                          </select>
                        </div>
                      </div>
                      <div className="sk-field">
                        <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Zone de couverture</label>
                        <GoldInput id="coverage_area" name="coverage_area" value={formData.coverage_area} onChange={handleInputChange} placeholder="Ex: Abidjan, Dakar, Lagos" required icon={Truck} />
                      </div>
                    </>
                  )}

                  <div className="sk-field">
                    <label style={{ display: "block", fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(201,168,76,0.65)", marginBottom: 7, fontWeight: 500 }}>Pièce d'identité (PDF / Image)</label>
                    <input id="id_card" name="id_card" type="file" onChange={handleInputChange} className="sk-file" required style={{ width: "100%", background: "rgba(245,240,232,0.04)", border: "1px solid rgba(201,168,76,0.2)", borderRadius: 4, padding: "11px 12px", outline: "none" }} />
                    <p style={{ fontSize: 10, color: "rgba(245,240,232,0.3)", marginTop: 6, display: "flex", alignItems: "center", gap: 5 }}>
                      <ShieldCheck size={11} /> Requis pour la validation du profil professionnel.
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <button
                type={step === totalSteps || (step === 2 && formData.role === "CLIENT") ? "submit" : "button"}
                onClick={step === totalSteps || (step === 2 && formData.role === "CLIENT") ? undefined : handleNextStep}
                disabled={loading}
                className="sk-submit"
                onMouseEnter={() => setHoverBtn(true)}
                onMouseLeave={() => setHoverBtn(false)}
                style={{
                  width: "100%", background: "#C9A84C", border: "none", borderRadius: 4,
                  color: "#09090A", fontFamily: "'DM Sans', sans-serif", fontSize: 11,
                  fontWeight: 600, letterSpacing: "0.2em", textTransform: "uppercase",
                  padding: "15px 20px", cursor: "pointer", transition: "background .2s, transform .15s",
                  marginTop: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                }}
              >
                {loading ? "Chargement..." : step === totalSteps || (step === 2 && formData.role === "CLIENT") ? "Terminer l'inscription" : "Étape suivante"}
                <ArrowRight size={15} style={{ transition: "transform .2s", transform: hoverBtn ? "translateX(4px)" : "none" }} />
              </button>
            </form>



            <p style={{ fontSize: 10, color: "rgba(245,240,232,0.25)", display: "flex", alignItems: "center", gap: 6, marginTop: 24, justifyContent: "center" }}>
              <ShieldCheck size={11} style={{ opacity: 0.5 }} />
              Plateforme certifiée · Données chiffrées
            </p>
            
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
