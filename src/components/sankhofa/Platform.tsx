import { Store, CreditCard, Truck, BarChart3, Globe2, Sparkles } from "lucide-react";

interface PlatformProps { lang: "fr" | "en"; }

const copy = {
  fr: {
    label: "III — PLATEFORME",
    title: "Tout ce qu'il faut. Rien de moins.",
    sub: "Une suite intégrée qui remplace dix outils — pensée pour vendre depuis Lagos, Dakar, Nairobi ou Marrakech vers Paris, Tokyo ou New York.",
    features: [
      { icon: Store, title: "Boutique sur-mesure", desc: "Vitrine élégante, sans code, multi-devise, pensée pour le mobile-first africain." },
      { icon: CreditCard, title: "Paiements universels", desc: "Mobile Money, carte, virement, crypto. Encaissez depuis n'importe quel marché." },
      { icon: Truck, title: "Logistique intégrée", desc: "Expédition mondiale, dédouanement, suivi — connectée aux meilleurs partenaires." },
      { icon: Globe2, title: "Audience mondiale", desc: "SEO multilingue, marketplace Sankhofa, distribution dans 60+ pays." },
      { icon: BarChart3, title: "Pilotage temps réel", desc: "Tableaux de bord clairs : ventes, marges, stock, audience — où que vous soyez." },
      { icon: Sparkles, title: "IA au service du récit", desc: "Photos, descriptions, traductions générées dans la voix de votre marque." },
    ],
  },
  en: {
    label: "III — PLATFORM",
    title: "Everything you need. Nothing less.",
    sub: "An integrated suite replacing ten tools — built to sell from Lagos, Dakar, Nairobi or Marrakech to Paris, Tokyo or New York.",
    features: [
      { icon: Store, title: "Tailored storefront", desc: "Elegant, no-code, multi-currency, designed for African mobile-first commerce." },
      { icon: CreditCard, title: "Universal payments", desc: "Mobile Money, card, transfer, crypto. Get paid from any market." },
      { icon: Truck, title: "Integrated logistics", desc: "Global shipping, customs, tracking — wired to the best partners." },
      { icon: Globe2, title: "Global audience", desc: "Multilingual SEO, Sankhofa marketplace, distribution to 60+ countries." },
      { icon: BarChart3, title: "Real-time control", desc: "Clear dashboards: sales, margins, stock, audience — wherever you are." },
      { icon: Sparkles, title: "AI for storytelling", desc: "Photos, descriptions, translations crafted in your brand's voice." },
    ],
  },
};

export const Platform = ({ lang }: PlatformProps) => {
  const t = copy[lang];
  return (
    <section id="plateforme" className="py-28 md:py-40 bg-background">
      <div className="container">
        <div className="max-w-3xl mb-16 md:mb-24">
          <p className="text-[10px] tracking-[0.35em] text-muted-foreground mb-6">{t.label}</p>
          <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance mb-6">
            {t.title}
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">{t.sub}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border border-border">
          {t.features.map((f, i) => {
            const Icon = f.icon;
            return (
              <article
                key={i}
                className="bg-background p-10 group hover:bg-secondary transition-colors duration-500"
              >
                <div className="flex items-start justify-between mb-12">
                  <Icon size={28} className="text-foreground group-hover:text-accent transition-colors duration-500" strokeWidth={1.25} />
                  <span className="font-display text-xs text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="font-display text-2xl mb-3 leading-tight">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
};
