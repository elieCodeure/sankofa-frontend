import { motion } from "framer-motion";
import africaMap from "@/assets/africa-map.png";

interface CartographyProps { lang: "fr" | "en"; }

// Coordonnées optimisées pour le rendu visuel
const cities = [
  { name: "Dakar", x: 14, y: 38 },
  { name: "Marrakech", x: 22, y: 14 },
  { name: "Lagos", x: 36, y: 52 },
  { name: "Addis Ababa", x: 64, y: 46 },
  { name: "Le Cap", x: 48, y: 92 },
  { name: "Nairobi", x: 64, y: 58 },
];

const copy = {
  fr: {
    label: "IV — TERRITOIRE",
    title: "Un continent. Une infrastructure. Mille marchés.",
    sub: "Sankhofa connecte les ateliers et coopératives des 54 pays africains à plus de 60 marchés à l'export.",
    stats: [
      { v: "54", l: "Pays sources" },
      { v: "60+", l: "Marchés export" },
      { v: "12", l: "Devises" },
      { v: "24/7", l: "Support" },
    ]
  },
  en: {
    label: "IV — TERRITORY",
    title: "One continent. One infrastructure. A thousand markets.",
    sub: "Sankhofa connects workshops and cooperatives across 54 African countries to 60+ export markets.",
    stats: [
      { v: "54", l: "Source countries" },
      { v: "60+", l: "Export markets" },
      { v: "12", l: "Currencies" },
      { v: "24/7", l: "Support" },
    ]
  },
};

export const Cartography = ({ lang }: CartographyProps) => {
  const t = copy[lang];
  // Point central pour les connexions (ex: Hub logistique)
  const center = { x: 40, y: 50 };

  return (
    <section className="py-24 md:py-44 bg-[#080808] text-white relative overflow-hidden">
      {/* Effet de grain et lueur d'arrière-plan */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none grain" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="container relative z-10">
        <div className="grid lg:grid-cols-12 gap-16 items-center">
          
          {/* Section Texte : Minimalisme Corporate */}
          <div className="lg:col-span-5 space-y-12">
            <div>
              <motion.p 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-[10px] tracking-[0.5em] text-amber-500/80 font-medium mb-8"
              >
                {t.label}
              </motion.p>
              
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="font-display text-4xl md:text-6xl font-light leading-[1.1] tracking-tight mb-8"
              >
                {t.title}
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/40 text-lg leading-relaxed max-w-sm font-light"
              >
                {t.sub}
              </motion.p>
            </div>

            {/* Stats : Design "Grid Border" moderne */}
            <div className="grid grid-cols-2 gap-px bg-white/10 border border-white/10">
              {t.stats.map((stat, i) => (
                <motion.div 
                  key={i}
                  whileHover={{ backgroundColor: "rgba(255,255,255,0.03)" }}
                  className="bg-[#080808] p-8 transition-colors group"
                >
                  <p className="text-4xl md:text-5xl font-display text-amber-500 mb-2">{stat.v}</p>
                  <p className="text-[9px] tracking-[0.2em] uppercase text-white/30 group-hover:text-white/60 transition-colors">
                    {stat.l}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Section Carte : L'expérience visuelle */}
          <div className="lg:col-span-7 relative">
            <div className="relative aspect-square w-full scale-110 lg:scale-125 transition-transform duration-1000">
              
              {/* Image de fond traitée en "Ghost Map" */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 0.2, scale: 1 }}
                transition={{ duration: 1.5 }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <img 
                  src={africaMap} 
                  alt="" 
                  className="w-full h-full object-contain filter invert grayscale brightness-150 contrast-125"
                />
              </motion.div>

              {/* Couche SVG pour les flux et points */}
              <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="transparent" />
                    <stop offset="50%" stopColor="rgba(245, 158, 11, 0.5)" />
                    <stop offset="100%" stopColor="#f59e0b" />
                  </linearGradient>
                </defs>

                {cities.map((city, i) => (
                  <g key={i}>
                    {/* Courbe de flux animée */}
                    <motion.path
                      d={`M ${center.x} ${center.y} Q ${(center.x + city.x)/2 + 5} ${(center.y + city.y)/2 - 5} ${city.x} ${city.y}`}
                      stroke="url(#lineGrad)"
                      strokeWidth="0.2"
                      fill="none"
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.6 }}
                      transition={{ duration: 2, delay: i * 0.15, ease: "easeInOut" }}
                    />
                    
                    {/* Point d'impact avec halo */}
                    <motion.circle
                      cx={city.x}
                      cy={city.y}
                      r="0.8"
                      fill="#f59e0b"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      transition={{ delay: 1.5 + i * 0.1 }}
                    />
                    <circle cx={city.x} cy={city.y} r="2" fill="#f59e0b" className="animate-ping opacity-[0.15]" />
                  </g>
                ))}
              </svg>

              {/* Labels de villes en Glassmorphism */}
              {cities.map((city, i) => (
                <motion.div
                  key={city.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: 2 }}
                  style={{ left: `${city.x}%`, top: `${city.y}%` }}
                  className="absolute pointer-events-none"
                >
                  <div className="ml-4 -mt-2 bg-white/5 backdrop-blur-md border border-white/10 px-2 py-1 rounded-[2px]">
                    <span className="text-[8px] tracking-[0.2em] text-white/80 uppercase font-medium">
                      {city.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};