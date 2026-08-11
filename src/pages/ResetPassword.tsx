import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authService } from "@/api-services";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, Lock } from "lucide-react";
import sankofaMark from "@/assets/sankofa-mark.png";

const ResetPassword = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Les mots de passe ne correspondent pas.",
      });
      return;
    }

    if (!uid || !token) {
      toast({
        variant: "destructive",
        title: "Lien invalide",
        description: "Le lien de réinitialisation est incomplet.",
      });
      return;
    }

    setLoading(true);
    try {
      await authService.confirmPasswordReset({
        uidb64: uid,
        token: token,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setSuccess(true);
      toast({
        title: "Succès",
        description: "Votre mot de passe a été réinitialisé.",
      });
      setTimeout(() => navigate("/auth"), 3000);
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
          <h1 className="text-2xl font-semibold text-[#F5F0E8] font-['DM_Sans'] mb-2">Nouveau mot de passe</h1>
          <p className="text-sm text-[rgba(245,240,232,0.6)]">Veuillez entrer votre nouveau mot de passe.</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(201,168,76,0.5)]" size={16} />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Nouveau mot de passe"
                required
                className="w-full bg-[rgba(245,240,232,0.05)] border border-[rgba(201,168,76,0.22)] rounded-lg text-[#F5F0E8] py-3 pl-10 pr-4 outline-none focus:border-[rgba(201,168,76,0.6)] transition-colors"
              />
            </div>
            
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[rgba(201,168,76,0.5)]" size={16} />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirmer le mot de passe"
                required
                className="w-full bg-[rgba(245,240,232,0.05)] border border-[rgba(201,168,76,0.22)] rounded-lg text-[#F5F0E8] py-3 pl-10 pr-4 outline-none focus:border-[rgba(201,168,76,0.6)] transition-colors"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] text-[#131211] font-semibold py-3 rounded-lg hover:bg-[#D4B55B] transition-colors disabled:opacity-70 mt-2"
            >
              {loading ? "Réinitialisation..." : "Réinitialiser"}
            </button>
          </form>
        ) : (
          <div className="text-center p-4 bg-[rgba(201,168,76,0.1)] border border-[rgba(201,168,76,0.3)] rounded-lg mb-6">
            <p className="text-[#F5F0E8] text-sm font-medium">
              Mot de passe modifié avec succès !
            </p>
            <p className="text-[rgba(245,240,232,0.6)] text-xs mt-2">
              Redirection vers la page de connexion...
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

export default ResetPassword;
