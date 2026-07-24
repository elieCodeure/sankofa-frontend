import { useState, useEffect } from "react";
import { authService } from "@/api-services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Lock } from "lucide-react";
import { toast } from "sonner";

export function Profile() {
  const [user, setUser] = useState<any>(authService.getCurrentUser());
  const [profileData, setProfileData] = useState({
    email: user?.email || "",
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    profile: {
      phone_number: user?.profile?.phone_number || "",
      address: user?.profile?.address || "",
      country: user?.profile?.country || "",
    }
  });

  const [passwordData, setPasswordData] = useState({
    old_password: "",
    new_password: "",
    confirm_password: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setProfileData({
        email: currentUser?.email || "",
        first_name: currentUser?.first_name || "",
        last_name: currentUser?.last_name || "",
        profile: {
          phone_number: currentUser?.profile?.phone_number || "",
          address: currentUser?.profile?.address || "",
          country: currentUser?.profile?.country || "",
        }
      });
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await authService.updateProfile(profileData);
      toast.success("Profil mis à jour avec succès !");
      fetchData();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Erreur lors de la mise à jour.");
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
    <div className="space-y-8 pb-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-light">Mon Profil</h1>
        <p className="text-muted-foreground">Gérez vos informations personnelles et votre sécurité.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Infos Personnelles */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <User className="text-accent" size={18} />
                <CardTitle className="text-lg">Informations Personnelles</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="first_name" className="text-white/60">Prénom</Label>
                    <Input 
                      id="first_name"
                      value={profileData.first_name}
                      onChange={(e) => setProfileData({...profileData, first_name: e.target.value})}
                      className="bg-deep border-white/10 focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last_name" className="text-white/60">Nom</Label>
                    <Input 
                      id="last_name"
                      value={profileData.last_name}
                      onChange={(e) => setProfileData({...profileData, last_name: e.target.value})}
                      className="bg-deep border-white/10 focus:border-accent/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white/60">Adresse Email</Label>
                  <Input 
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="bg-deep border-white/10 focus:border-accent/50"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white/60">Téléphone</Label>
                    <Input 
                      id="phone"
                      value={profileData.profile.phone_number}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        profile: { ...profileData.profile, phone_number: e.target.value }
                      })}
                      className="bg-deep border-white/10 focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-white/60">Pays de résidence</Label>
                    <Input 
                      id="country"
                      value={profileData.profile.country}
                      onChange={(e) => setProfileData({
                        ...profileData, 
                        profile: { ...profileData.profile, country: e.target.value }
                      })}
                      placeholder="Ex: Sénégal, France, Côte d'Ivoire..."
                      className="bg-deep border-white/10 focus:border-accent/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-white/60">Adresse complète</Label>
                  <textarea 
                    id="address"
                    value={profileData.profile.address}
                    onChange={(e) => setProfileData({
                      ...profileData, 
                      profile: { ...profileData.profile, address: e.target.value }
                    })}
                    rows={3}
                    className="w-full bg-deep border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-transparent transition-all"
                    placeholder="Rue, Quartier, Ville..."
                  />
                </div>

                <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">
                  Enregistrer les modifications
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Sécurité */}
          <Card className="bg-white/5 border-white/10 overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Lock className="text-accent" size={18} />
                <CardTitle className="text-lg">Sécurité & Mot de passe</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleChangePassword} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="old_p" className="text-white/60">Ancien mot de passe</Label>
                  <Input 
                    id="old_p"
                    type="password"
                    value={passwordData.old_password}
                    onChange={(e) => setPasswordData({...passwordData, old_password: e.target.value})}
                    className="bg-deep border-white/10 focus:border-accent/50"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="new_p" className="text-white/60">Nouveau mot de passe</Label>
                    <Input 
                      id="new_p"
                      type="password"
                      value={passwordData.new_password}
                      onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                      className="bg-deep border-white/10 focus:border-accent/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conf_p" className="text-white/60">Confirmer le mot de passe</Label>
                    <Input 
                      id="conf_p"
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
      </div>
    </div>
  );
}
