import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { authService } from "@/api-services";
import { useToast } from "@/components/ui/use-toast";
import { ArrowLeft, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import sankofaMark from "@/assets/sankofa-mark.png";

const ActivateAccount = () => {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<"success" | "error" | "loading">("loading");
  const [message, setMessage] = useState("Activation en cours...");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!uid || !token) {
      setStatus("error");
      setMessage("Le lien d'activation est incomplet.");
      setLoading(false);
      return;
    }

    const activate = async () => {
      try {
        const res = await authService.activateAccount(uid, token);
        setStatus("success");
        setMessage(res.message || "Votre compte a été activé avec succès !");
        toast({
          title: "Compte activé",
          description: "Vous pouvez maintenant vous connecter.",
        });
        setTimeout(() => navigate("/auth"), 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.message || "Le lien d'activation est invalide ou a expiré.");
        toast({
          variant: "destructive",
          title: "Erreur d'activation",
          description: error.message || "Une erreur est survenue.",
        });
      } finally {
        setLoading(false);
      }
    };

    activate();
  }, [uid, token, navigate, toast]);

  return (
    <div className="min-h-screen bg-[#131211] flex items-center justify-center p-4 relative overflow-hidden">
      <div className="relative z-10 w-full max-w-md bg-[rgba(245,240,232,0.02)] border border-[rgba(201,168,76,0.15)] rounded-2xl p-8 backdrop-blur-md">
        <div className="text-center mb-8">
          <img src={sankofaMark} alt="Sankofa" className="w-24 h-auto mx-auto mb-6" style={{ filter: "drop-shadow(0 0 40px rgba(201,168,76,0.25))" }} />
          <h1 className="text-2xl font-semibold text-[#F5F0E8] font-['DM_Sans'] mb-2">Activation du compte</h1>
        </div>

        <div className="text-center p-6 bg-[rgba(245,240,232,0.02)] border border-[rgba(201,168,76,0.1)] rounded-xl mb-6">
          {loading && (
            <div className="flex flex-col items-center">
              <Loader2 className="animate-spin text-[#C9A84C] mb-4" size={32} />
              <p className="text-[#F5F0E8] text-sm font-medium">{message}</p>
            </div>
          )}

          {!loading && status === "success" && (
            <div className="flex flex-col items-center">
              <CheckCircle2 className="text-green-500 mb-4" size={48} />
              <p className="text-[#F5F0E8] text-sm font-medium">{message}</p>
              <p className="text-[rgba(245,240,232,0.6)] text-xs mt-2">
                Redirection vers la page de connexion...
              </p>
            </div>
          )}

          {!loading && status === "error" && (
            <div className="flex flex-col items-center">
              <XCircle className="text-red-500 mb-4" size={48} />
              <p className="text-[#F5F0E8] text-sm font-medium">{message}</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <Link to="/auth" className="inline-flex items-center text-[#C9A84C] hover:text-[#D4B55B] text-sm font-medium transition-colors">
            <ArrowLeft size={16} className="mr-2" />
            Aller à la connexion
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ActivateAccount;
