import { ArrowUpRight } from "lucide-react";

interface CTAProps { lang: "fr" | "en"; }

const copy = {
  fr: {
    label: "VI — COMMENCER",
    title: "Votre héritage. Notre infrastructure.",
    titleAccent: "Le monde entier comme client.",
    sub: "Lancez votre boutique en moins d'une heure. Sans frais initiaux. Sans renier qui vous êtes.",
    cta: "Ouvrir ma boutique",
    cta2: "Parler à un conseiller",
    trust: "Essai gratuit · Pas de carte bancaire · Support en français, anglais, swahili et arabe",
  },
  en: {
    label: "VI — BEGIN",
    title: "Your heritage. Our infrastructure.",
    titleAccent: "The whole world as a customer.",
    sub: "Launch your store in under an hour. No upfront cost. Without ever losing who you are.",
    cta: "Open my store",
    cta2: "Talk to an advisor",
    trust: "Free trial · No credit card · Support in French, English, Swahili and Arabic",
  },
};

export const CTA = ({ lang }: CTAProps) => {
  const t = copy[lang];
  return (
    <section id="cta" className="relative py-28 md:py-40 bg-deep text-deep-foreground overflow-hidden grain">
      <div className="absolute inset-0 bg-gradient-sun opacity-60" />

      <div className="container relative text-center">
        <p className="text-[10px] tracking-[0.35em] text-deep-foreground/60 mb-8">{t.label}</p>
        <h2 className="font-display font-light text-5xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight text-balance max-w-5xl mx-auto">
          {t.title}{" "}
          <span className="italic gold-line">{t.titleAccent}</span>
        </h2>
        <p className="mt-10 text-lg text-deep-foreground/75 max-w-xl mx-auto leading-relaxed">
          {t.sub}
        </p>

        <div className="mt-12 flex flex-wrap justify-center items-center gap-4">
          <a
            href="/auth"
            className="group inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-sm font-medium hover:bg-accent/90 transition-all"
          >
            {t.cta}
            <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
          <a
            href="#"
            className="inline-flex items-center gap-3 px-2 py-4 text-sm border-b border-deep-foreground/40 hover:border-accent transition-colors"
          >
            {t.cta2}
          </a>
        </div>

        <p className="mt-10 text-xs tracking-wider text-deep-foreground/50">{t.trust}</p>
      </div>
    </section>
  );
};
