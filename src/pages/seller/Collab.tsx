import { useState, useEffect } from "react";
import { authService, collaborationService, logisticsService } from "@/api-services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, User, MessageCircle, Mail, Store, ShieldCheck, X } from "lucide-react";
import { toast } from "sonner";

export function Collab() {
  const [sellers, setSellers] = useState<any[]>([]);
  const [transporters, setTransporters] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [user, setUser] = useState<any>(authService.getCurrentUser());

  const fetchData = async () => {
    try {
      const [sellerData, reqData, transpData] = await Promise.all([
        collaborationService.getSellers(),
        collaborationService.getRequests(),
        logisticsService.getTransporters()
      ]);
      setSellers(sellerData);
      setRequests(reqData);
      setTransporters(transpData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSendRequest = async (id: number) => {
    try {
      await collaborationService.sendRequest(id);
      toast.success("Demande de connexion envoyée !");
      fetchData();
    } catch (err) {
      toast.error("Demande déjà envoyée ou erreur.");
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
           <h3 className="text-xs uppercase tracking-widest font-bold text-accent px-1">Réception d'invitations</h3>
           <div className="space-y-3">
           {requests.filter(r => r.status === 'PENDING' && r.receiver === user.id).length === 0 ? (
             <div className="p-12 border border-white/5 bg-white/[0.02] rounded-xl text-center border-dashed">
               <Users className="mx-auto mb-3 opacity-10" size={32} />
               <p className="text-xs text-white/20 italic">Aucune nouvelle invitation de confrère.</p>
             </div>
           ) : (
             requests.filter(r => r.status === 'PENDING' && r.receiver === user.id).map(req => (
               <Card key={req.id} className="bg-white/5 border-white/10 group animate-in slide-in-from-left-4">
                  <CardContent className="p-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center font-bold text-accent shadow-inner">
                          {req.sender_details?.first_name?.[0] || "?"}
                        </div>
                        <div>
                          <p className="text-sm font-bold">{req.sender_details?.business_name || req.sender_details?.first_name}</p>
                          <p className="text-[10px] text-accent uppercase tracking-tighter">Artisan Certifié</p>
                        </div>
                     </div>
                     <div className="flex gap-2">
                       <Button size="sm" className="bg-accent text-accent-foreground h-8 px-4" onClick={() => collaborationService.acceptRequest(req.id).then(fetchData)}>
                         Accepter
                       </Button>
                       <Button size="sm" variant="ghost" className="h-8 text-white/40 hover:text-red-400" onClick={() => collaborationService.rejectRequest(req.id).then(fetchData)}>
                         <X size={16} />
                       </Button>
                     </div>
                  </CardContent>
               </Card>
             ))
           )}
           </div>

           <h3 className="text-xs uppercase tracking-widest font-bold text-accent px-1 pt-6 flex items-center gap-2">
              <ShieldCheck size={14} /> Réseau de Confiance
           </h3>
           <div className="grid grid-cols-1 gap-3">
             {requests.filter(r => r.status === 'ACCEPTED').length === 0 ? (
                <p className="text-xs text-white/20 italic px-1 pt-4">Votre réseau de collaboration est encore vide.</p>
             ) : (
               requests.filter(r => r.status === 'ACCEPTED').map(req => {
                 const partner = req.sender === user.id ? req.receiver_details : req.sender_details;
                 return (
                   <div key={req.id} className="p-5 rounded-xl bg-deep border border-accent/10 flex items-center justify-between group hover:border-accent transition-all">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover:text-accent group-hover:scale-110 transition-all">
                            <User size={18} />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-white group-hover:text-accent transition-colors">{partner?.business_name}</p>
                           <p className="text-[10px] text-white/40">{partner?.first_name} {partner?.last_name}</p>
                         </div>
                      </div>
                      <div className="flex gap-2">
                         {partner?.phone_number && (
                           <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground shadow-lg shadow-accent/5" asChild title="WhatsApp">
                              <a href={`https://wa.me/${partner.phone_number}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /></a>
                           </Button>
                         )}
                         {partner?.email && (
                           <Button size="sm" variant="outline" className="h-9 w-9 p-0 border-white/10 text-white/40 hover:bg-white hover:text-black" asChild title="Email">
                              <a href={`mailto:${partner.email}`}><Mail size={16} /></a>
                           </Button>
                         )}
                      </div>
                   </div>
                 );
               })
             )}
           </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xs uppercase tracking-widest font-bold text-white/40 px-1">Comptoirs & Ateliers Sankhofa</h3>
          <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
            {sellers.length === 0 ? (
              <p className="text-sm text-white/20 italic">Aucun autre vendeur listé.</p>
            ) : (
              sellers.map(s => (
                <Card key={`seller-${s.id}`} className="bg-deep border-white/5 hover:border-accent/40 transition-all group overflow-hidden">
                  <CardContent className="p-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all">
                           <Store size={22} className="text-white/10 group-hover:text-accent group-hover:scale-110 transition-all" />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-balance">{s.business_name || `${s.first_name} ${s.last_name}`}</p>
                           <p className="text-[10px] text-white/40 flex items-center gap-1">
                              <ShieldCheck size={10} className="text-accent" /> Profil Certifié
                           </p>
                        </div>
                     </div>
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="text-[11px] font-bold h-9 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground shadow-xl transition-all"
                       onClick={() => handleSendRequest(s.id)}
                       disabled={requests.some(r => (r.sender === user.id && r.receiver === s.id) || (r.sender === s.id && r.receiver === user.id))}
                     >
                       {requests.some(r => (r.sender === user.id && r.receiver === s.id) || (r.sender === s.id && r.receiver === user.id)) ? "En relation" : "Collaborer"}
                     </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <h3 className="text-xs uppercase tracking-widest font-bold text-white/40 px-1 pt-4">Transporteurs Agréés</h3>
          <div className="grid grid-cols-1 gap-4 max-h-[300px] overflow-y-auto no-scrollbar pr-2">
            {transporters.length === 0 ? (
              <p className="text-sm text-white/20 italic">Aucun transporteur listé.</p>
            ) : (
              transporters.map(t => (
                <Card key={`transp-${t.id}`} className="bg-deep border-white/5 hover:border-accent/40 transition-all group overflow-hidden">
                  <CardContent className="p-5 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-lg bg-white/[0.03] flex items-center justify-center border border-white/5 group-hover:bg-accent/5 group-hover:border-accent/20 transition-all">
                           <ShieldCheck size={22} className="text-white/10 group-hover:text-accent group-hover:scale-110 transition-all" />
                        </div>
                        <div>
                           <p className="font-bold text-sm text-balance">{t.profile?.business_name || t.business_name || `${t.first_name} ${t.last_name}`}</p>
                           <p className="text-[10px] text-white/40 flex items-center gap-1">
                              Transport Logistique
                           </p>
                        </div>
                     </div>
                     <Button 
                       size="sm" 
                       variant="outline" 
                       className="text-[11px] font-bold h-9 border-accent/20 text-accent hover:bg-accent hover:text-accent-foreground shadow-xl transition-all"
                       onClick={() => handleSendRequest(t.id)}
                       disabled={requests.some(r => (r.sender === user.id && r.receiver === t.id) || (r.sender === t.id && r.receiver === user.id))}
                     >
                       {requests.some(r => (r.sender === user.id && r.receiver === t.id) || (r.sender === t.id && r.receiver === user.id)) ? "En relation" : "Collaborer"}
                     </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
