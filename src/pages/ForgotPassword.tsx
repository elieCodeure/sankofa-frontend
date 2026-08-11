import { useState } from "react";
import { Link } from "react-router-dom";
import { authService } from "@/api-services";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Mail } from "lucide-react";
import sankofaMark from "@/assets/sankofa-mark.png";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setSuccess(true);
      toast({
        title: "E-mail envoyé",
        description: "Si cette adresse existe, un lien de réinitialisation vous a été envoyé.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error.message || "Une erreur est survenue.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#131211] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-[rgba(245,240,232,0.02)] border border-[rgba(201,168,76,0.15)] rounded-2xl p-8 backdrop-blur-md">
        <div className="text-center mb-8">
          <img src={sankofaMark} alt="Sankofa" className="w-24 h-auto mx-auto mb-6" style={{ filter: "drop-shadow(0 0 40px rgba(201,168,76,0.25))" }} />
          <h1 className="text-2xl font-semibold text-[#F5F0E8] font-['DM_Sans'] mb-2">Mot de passe oublié</h1>
          <p className="text-sm text-[rgba(245,240,232,0.6)]">Entrez votre e-mail pour recevoir un lien de réinitialisation.</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(201,168,76,0.5)]" size={16} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Votre adresse e-mail"
                required
                className="w-full bg-[rgba(245,240,232,0.05)] border border-[rgba(201,168,76,0.22)] rounded-lg text-[#F5F0E8] py-3 pl-10 pr-4 outline-none focus:border-[rgba(201,168,76,0.6)] transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] text-[#131211] font-semibold py-3 rounded-lg hover:bg-[#D4B55B] transition-colors disabled:opacity-70"
            >
              {loading ? "Envoi en cours..." : "Envoyer le lien"}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] rounded-lg mb-6">
            <p className="text-[#F5F0E8] text-sm">
              Un e-mail a été envoyé à <strong>{email}</strong> avec les instructions pour réinitialiser votre mot de passe.
            </p>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link to="/auth" className="inline-flex items-center text-[#C9A84C] hover:text-[#D4B55B] text-sm font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
