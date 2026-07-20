import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Truck, Ship, Plane, Globe, Package, ShieldCheck, Search, MapPin, Loader2, Sparkles, Bike } from "lucide-react";
import { logisticsService, authService } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

interface ExpeditionsProps { lang: "fr" | "en"; }

const copy = {
  fr: {
    label: "V — SANKHOFA SHIP",
    title: "Expéditions sans frontières.",
    sub: "Nous avons bâti un pont logistique entre vos ateliers et le monde. Sankhofa Ship gère la complexité de l'export pour que vous puissiez vous concentrer sur la création.",
    features: [
      { 
        icon: Globe, 
        title: "Logistique Mondiale", 
        desc: "Expédiez vos colis vers plus de 60 pays avec un suivi bout-en-bout. Air, Mer ou Route, nous choisissons le chemin le plus sûr." 
      },
      { 
        icon: ShieldCheck, 
        title: "Dédouanement Simplifié", 
        desc: "Oubliez la paperasse. Nos experts gèrent les formalités douanières et les certifications pour une exportation fluide." 
      },
      { 
        icon: Package, 
        title: "Emballage & Standardisation", 
        desc: "Conseils et solutions pour un packaging aux normes internationales, garantissant l'intégrité de vos produits." 
      },
      { 
        icon: Truck, 
        title: "Dernier Kilomètre", 
        desc: "Une livraison fiable jusqu'au domicile de votre client, que ce soit à Paris, New York ou Tokyo." 
      },
    ],
    directoryTitle: "Nos Expéditeurs Partenaires",
    directorySub: "Consultez, filtrez et sélectionnez l'un de nos transporteurs agréés pour vos livraisons.",
    searchPlaceholder: "Rechercher une zone, une ville ou un transporteur...",
    allVehicles: "Tous les véhicules",
    motorcycle: "Vélomoteur",
    van: "Camionnette",
    truck: "Camion",
    verified: "Agréé Sankhofa",
    areasServed: "Zones desservies",
    vehicleType: "Véhicule",
    ctaShip: "Faire un envoi",
    noTransporters: "Aucun transporteur ne correspond à vos critères de recherche.",
    loginRequired: "Veuillez vous connecter pour demander une expédition.",
    alreadyTransporter: "En tant que transporteur, vous gérez les expéditions depuis votre propre espace.",
    loadingTransporters: "Recherche des transporteurs agréés...",
  },
  en: {
    label: "V — SANKHOFA SHIP",
    title: "Shipping without borders.",
    sub: "We built a logical bridge between your workshops and the world. Sankhofa Ship handles the export complexity so you can focus on creation.",
    features: [
      { 
        icon: Globe, 
        title: "Global Logistics", 
        desc: "Ship your packages to 60+ countries with end-to-end tracking. Air, Sea, or Road, we choose the safest path." 
      },
      { 
        icon: ShieldCheck, 
        title: "Simplified Customs", 
        desc: "Forget the paperwork. Our experts handle customs formalities and certifications for fluid exports." 
      },
      { 
        icon: Package, 
        title: "Packaging & Standards", 
        desc: "Advice and solutions for international standard packaging, ensuring the integrity of your products." 
      },
      { 
        icon: Truck, 
        title: "Last Mile delivery", 
        desc: "Reliable delivery to your customer's doorstep, whether in Paris, New York, or Tokyo." 
      },
    ],
    directoryTitle: "Our Partner Shippers",
    directorySub: "Browse, filter and select one of our approved carriers for your deliveries.",
    searchPlaceholder: "Search for a area, a city or a carrier...",
    allVehicles: "All vehicles",
    motorcycle: "Motorcycle",
    van: "Van",
    truck: "Truck",
    verified: "Sankhofa Approved",
    areasServed: "Areas served",
    vehicleType: "Vehicle",
    ctaShip: "Ship now",
    noTransporters: "No carriers match your search criteria.",
    loginRequired: "Please log in to request a shipment.",
    alreadyTransporter: "As a carrier, you manage shipments from your own dashboard.",
    loadingTransporters: "Searching approved shippers...",
  },
};

export const Expeditions = ({ lang }: ExpeditionsProps) => {
  const t = copy[lang];
  const navigate = useNavigate();
  const [transporters, setTransporters] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [vehicleFilter, setVehicleFilter] = useState<string>("all");

  useEffect(() => {
    const fetchTransporters = async () => {
      try {
        const data = await logisticsService.getTransporters();
        setTransporters(data);
      } catch (err) {
        console.error("Error loading transporters:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransporters();
  }, []);

  const handleShipClick = (transporterId: number) => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error(t.loginRequired);
      // Store intended action to pre-select after login
      localStorage.setItem("preselected_transporter_id", transporterId.toString());
      navigate("/auth");
      return;
    }

    if (currentUser.role === "TRANSPORTER") {
      toast.info(t.alreadyTransporter);
      navigate("/logistics/dashboard");
      return;
    }

    // Save selection
    localStorage.setItem("preselected_transporter_id", transporterId.toString());
    
    // Redirect based on role
    if (currentUser.role === "SELLER") {
      navigate("/seller/dashboard/shipping");
    } else {
      navigate("/client/dashboard/shipping");
    }
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case "MOTORCYCLE": return <Bike size={16} className="text-accent" />;
      case "VAN": return <Truck size={16} className="text-accent" />;
      case "TRUCK": return <Truck size={16} className="text-accent" />;
      default: return <Truck size={16} className="text-accent" />;
    }
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case "MOTORCYCLE": return t.motorcycle;
      case "VAN": return t.van;
      case "TRUCK": return t.truck;
      default: return type;
    }
  };

  const filteredTransporters = transporters.filter(trans => {
    const nameStr = `${trans.first_name || ""} ${trans.last_name || ""} ${trans.business_name || ""}`.toLowerCase();
    const coverageStr = (trans.coverage_area || "").toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = nameStr.includes(query) || coverageStr.includes(query);
    const matchesVehicle = vehicleFilter === "all" || trans.vehicle_type === vehicleFilter;

    return matchesSearch && matchesVehicle;
  });

  return (
    <section id="expeditions" className="py-28 md:py-40 bg-secondary/30">
      <div className="container">
        {/* Marketing Hero Section */}
        <div className="grid lg:grid-cols-2 gap-16 items-center mb-32">
          <div>
            <p className="text-[10px] tracking-[0.35em] text-muted-foreground mb-6 uppercase">{t.label}</p>
            <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance mb-8">
              {t.title}
            </h2>
            <p className="text-xl text-muted-foreground leading-relaxed max-w-xl mb-10">
              {t.sub}
            </p>
            <a 
              href="#directory" 
              className="inline-flex items-center gap-2 px-8 py-4 bg-foreground text-background hover:bg-accent hover:text-accent-foreground transition-all duration-500 font-medium"
            >
              {lang === "fr" ? "Voir les expéditeurs" : "View shippers"}
            </a>
          </div>
          <div className="relative aspect-square lg:aspect-video bg-deep overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-60 group-hover:scale-105 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-deep via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <div className="flex items-center gap-4 text-white">
                <Ship size={32} strokeWidth={1} />
                <Plane size={32} strokeWidth={1} />
                <Truck size={32} strokeWidth={1} />
              </div>
              <p className="mt-4 text-xs tracking-widest text-white/60 uppercase">Réseau d'exportation global</p>
            </div>
          </div>
        </div>

        {/* Shippers Directory Section */}
        <div id="directory" className="pt-16 border-t border-border/10 space-y-12">
          <div className="max-w-2xl">
            <h3 className="font-display font-light text-3xl md:text-4xl tracking-tight text-balance mb-4">
              {t.directoryTitle}
            </h3>
            <p className="text-muted-foreground">
              {t.directorySub}
            </p>
          </div>

          {/* Search & Filters */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center bg-deep/40 p-4 border border-border/10">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" size={16} />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="pl-10 bg-deep border-white/10 text-white placeholder-white/40 focus:border-accent text-sm"
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant={vehicleFilter === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setVehicleFilter("all")}
                className="text-xs font-bold"
              >
                {t.allVehicles}
              </Button>
              <Button
                variant={vehicleFilter === "MOTORCYCLE" ? "default" : "outline"}
                size="sm"
                onClick={() => setVehicleFilter("MOTORCYCLE")}
                className="text-xs font-bold gap-1"
              >
                <Bike size={12} /> {t.motorcycle}
              </Button>
              <Button
                variant={vehicleFilter === "VAN" ? "default" : "outline"}
                size="sm"
                onClick={() => setVehicleFilter("VAN")}
                className="text-xs font-bold gap-1"
              >
                <Truck size={12} /> {t.van}
              </Button>
              <Button
                variant={vehicleFilter === "TRUCK" ? "default" : "outline"}
                size="sm"
                onClick={() => setVehicleFilter("TRUCK")}
                className="text-xs font-bold gap-1"
              >
                <Truck size={12} /> {t.truck}
              </Button>
            </div>
          </div>

          {/* Loading / Cards Grid */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
              <p className="text-muted-foreground text-xs uppercase tracking-widest">{t.loadingTransporters}</p>
            </div>
          ) : filteredTransporters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTransporters.map(trans => (
                <Card 
                  key={trans.id} 
                  className="bg-deep border-border/10 hover:border-accent/40 transition-all duration-300 group overflow-hidden relative"
                >
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-accent/10 border border-accent/20 text-accent px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest z-10">
                    <Sparkles size={8} /> {t.verified}
                  </div>
                  <div className="h-1 bg-accent/10 group-hover:bg-accent transition-colors duration-500" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg font-display text-white">
                      {trans.business_name || `${trans.first_name} ${trans.last_name}`}
                    </CardTitle>
                    <CardDescription className="text-white/60 text-xs flex items-center gap-1.5 mt-1">
                      {getVehicleIcon(trans.vehicle_type)}
                      <span>{t.vehicleType} : {getVehicleLabel(trans.vehicle_type)}</span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-1.5">
                      <span className="text-[10px] text-accent font-bold uppercase tracking-wider flex items-center gap-1">
                        <MapPin size={10} /> {t.areasServed}
                      </span>
                      <p className="text-sm text-white/80 line-clamp-2">
                        {trans.coverage_area || "Non renseigné"}
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleShipClick(trans.id)}
                      className="w-full text-xs font-bold bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300"
                    >
                      {t.ctaShip}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 border border-dashed border-border/10 rounded-lg">
              <p className="text-muted-foreground font-display text-lg">
                {t.noTransporters}
              </p>
            </div>
          )}
        </div>

        {/* Original Static Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mt-32 pt-20 border-t border-border/10">
          {copy[lang].features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="group">
                <div className="mb-6 inline-flex p-3 bg-background border border-border group-hover:border-accent group-hover:bg-accent group-hover:text-accent-foreground transition-all duration-500">
                  <Icon size={24} strokeWidth={1.5} />
                </div>
                <h3 className="font-display text-xl mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
