import { useState } from "react";
import { authService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Store, User, ShieldCheck, Truck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export function Profile() {
  const [user, setUser] = useState<any>(authService.getCurrentUser());
  const navigate = useNavigate();

  const [profileData, setProfileData] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    email: user?.email || "",
    profile: {
      business_name: user?.profile?.business_name || "",
      phone_number: user?.profile?.phone_number || "",
      address: user?.profile?.address || "",
    }
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      toast.success("Profil boutique mis à jour !");
      const updatedUser = await authService.getCurrentUser();
      setUser(updatedUser);
    } catch (err) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    try {
      await authService.changePassword(passwordData);
      toast.success("Mot de passe modifié !");
      setPasswordData({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err: any) {
      const msg = err.response?.data?.old_password?.[0] || "Erreur lors du changement.";
      toast.error(msg);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
       <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-8">
             <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Store className="text-accent" size={20} />
                      <CardTitle className="text-lg">Vitrine de l'Artisan</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                   <form onSubmit={handleUpdateProfile} className="space-y-8">
                      <div className="space-y-4">
                         <Label className="text-xs uppercase tracking-widest text-accent font-bold">Identité du Business</Label>
                         <Input 
                           value={profileData.profile.business_name}
                           onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, business_name: e.target.value }})}
                           className="bg-deep border-white/10 text-xl font-display focus:ring-accent"
                           placeholder="Nom de votre enseigne"
                         />
                      </div>
                      <div className="space-y-4">
                         <Label className="text-xs uppercase tracking-widest text-accent font-bold">Responsable</Label>
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <Input 
                             value={profileData.first_name}
                             onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                             className="bg-deep border-white/10 focus:ring-accent"
                             placeholder="Prénom"
                           />
                           <Input 
                             value={profileData.last_name}
                             onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                             className="bg-deep border-white/10 focus:ring-accent"
                             placeholder="Nom"
                           />
                         </div>
                      </div>
                      <div className="space-y-4">
                         <Label className="text-xs uppercase tracking-widest text-accent font-bold">Contact Officiel</Label>
                         <Input 
                           value={profileData.profile.phone_number}
                           onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, phone_number: e.target.value }})}
                           className="bg-deep border-white/10 focus:ring-accent placeholder:text-white/10"
                           placeholder="Numéro WhatsApp (avec code pays)"
                         />
                      </div>
                      <div className="space-y-4">
                         <Label className="text-xs uppercase tracking-widest text-accent font-bold">Atelier / Point de retrait</Label>
                         <textarea 
                           value={profileData.profile.address}
                           onChange={(e) => setProfileData({...profileData, profile: { ...profileData.profile, address: e.target.value }})}
                           className="w-full bg-deep border border-white/10 rounded-md p-4 text-sm focus:outline-none focus:ring-1 focus:ring-accent transition-all"
                           rows={4}
                           placeholder="Adresse où le transporteur doit récupérer vos colis..."
                         />
                      </div>
                      <Button type="submit" className="bg-accent text-accent-foreground w-full h-12 text-sm font-bold uppercase tracking-widest shadow-xl shadow-accent/10">Valider mon identité boutique</Button>
                   </form>
                </CardContent>
             </Card>

             {/* Sécurité */}
             <Card className="bg-white/5 border-white/10 overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 bg-white/[0.02]">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="text-accent" size={20} />
                    <CardTitle className="text-lg">Sécurité & Mot de passe</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-8">
                   <form onSubmit={handleChangePassword} className="space-y-6">
                      <div className="space-y-2">
                        <Label className="text-xs uppercase tracking-widest text-white/60">Ancien mot de passe</Label>
                        <Input 
                          type="password"
                          value={passwordData.old_password}
                          onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                          className="bg-deep border-white/10 focus:border-accent/50"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-white/60">Nouveau mot de passe</Label>
                          <Input 
                            type="password"
                            value={passwordData.new_password}
                            onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                            className="bg-deep border-white/10 focus:border-accent/50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs uppercase tracking-widest text-white/60">Confirmer le mot de passe</Label>
                          <Input 
                            type="password"
                            value={passwordData.confirm_password}
                            onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                            className="bg-deep border-white/10 focus:border-accent/50"
                          />
                        </div>
                      </div>
                      <Button type="submit" variant="outline" className="border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground">
                        Mettre à jour le mot de passe
                      </Button>
                   </form>
                </CardContent>
             </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
             <Card className="bg-deep border-white/5 p-8 flex flex-col items-center text-center shadow-xl">
                <div className="w-24 h-24 rounded-full bg-accent/5 border border-accent/20 flex items-center justify-center text-accent mb-6 shadow-inner">
                   <User size={48} />
                </div>
                <h3 className="text-xl font-display mb-1">{user?.profile?.business_name || "Vendeur Sankhofa"}</h3>
                <p className="text-xs text-white/30 font-mono mb-6">{user?.email}</p>
                <div className="w-full space-y-2">
                   <div className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">
                      <span>Statut Compte</span>
                      <span className="text-green-400">Certifié</span>
                   </div>
                   <div className="flex justify-between items-center p-3 rounded bg-white/5 border border-white/5 text-[10px] uppercase font-bold text-white/40">
                      <span>Vérification ID</span>
                      <ShieldCheck size={14} className="text-accent" />
                   </div>
                </div>
             </Card>

             <div className="p-8 rounded-2xl border border-accent/20 bg-accent/5 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                   <Truck size={64} />
                </div>
                <h4 className="font-display text-lg mb-3 relative z-10 text-accent underline">Prêt pour l'envoi ?</h4>
                <p className="text-xs text-white/60 mb-6 leading-relaxed relative z-10">
                  Votre adresse d'atelier est prête. Dès qu'une vente est validée, utilisez <strong>Sankhofa Ship</strong> pour commander un transporteur et acheminer votre trésor.
                </p>
                <Button variant="outline" className="w-full text-[10px] uppercase font-bold tracking-widest border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-500 relative z-10" onClick={() => navigate('/seller/dashboard/shipping')}>
                  Module Logistique <ArrowRight size={14} className="ml-2" />
                </Button>
             </div>
          </div>
       </div>
    </div>
  );
}
