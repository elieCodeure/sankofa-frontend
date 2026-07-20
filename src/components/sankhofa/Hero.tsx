import heroImg from "@/assets/hero-sankofa.jpg";
import { ArrowUpRight } from "lucide-react";

interface HeroProps { lang: "fr" | "en"; }

const copy = {
  fr: {
    eyebrow: "SAVOIR-FAIRE · MADE IN AFRICA · HÉRITAGE",
    titleA: "Vendre",
    titleB: "l'héritage",
    titleC: "africain",
    titleD: "au monde.",
    sub: "Sankhofa est la plateforme tout-en-un qui permet aux créateurs, artisans et exportateurs africains de bâtir leur marque et d'atteindre leurs clients à l'échelle mondiale — sans rien renier de leurs racines.",
    cta1: "Ouvrir ma boutique",
    cta2: "Découvrir le manifeste",
    scroll: "Faire défiler",
  },
  en: {
    eyebrow: "KNOW-HOW · MADE IN AFRICA · HERITAGE",
    titleA: "Selling",
    titleB: "African",
    titleC: "heritage",
    titleD: "to the world.",
    sub: "Sankhofa is the all-in-one platform empowering African creators, artisans and exporters to build their brand and reach global customers — without ever losing their roots.",
    cta1: "Open my store",
    cta2: "Read the manifesto",
    scroll: "Scroll",
  },
};

export const Hero = ({ lang }: HeroProps) => {
  const t = copy[lang];
  return (
    <section id="top" className="relative min-h-screen flex items-end overflow-hidden bg-deep text-deep-foreground grain">
      {/* Image background */}
      <div className="absolute inset-0">
        <img
          src={heroImg}
          alt="Artisane africaine en habit traditionnel — incarnation de la philosophie Sankofa"
          className="w-full h-full object-cover object-[70%_center] md:object-center opacity-90"
          width={1080}
          height={1920}
        />
        <div className="absolute inset-0 bg-gradient-veil" />
        <div className="absolute inset-0 bg-gradient-sun" />
      </div>

      {/* Top eyebrow */}
      <div className="absolute top-24 md:top-28 inset-x-0 z-10">
        <div className="container">
          <p className="text-[10px] md:text-xs tracking-[0.35em] text-deep-foreground/70 animate-shimmer">
            {t.eyebrow}
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 container pb-20 md:pb-28 pt-40">
        <div className="max-w-5xl">
          <h1 className="font-display font-light text-[14vw] md:text-[9vw] lg:text-[8.5rem] leading-[0.92] tracking-tight text-balance animate-float-in">
            <span className="block">{t.titleA}</span>
            <span className="block italic gold-line">{t.titleB}</span>
            <span className="block">{t.titleC}</span>
            <span className="block opacity-70">{t.titleD}</span>
          </h1>

          <div className="mt-10 md:mt-14 max-w-2xl">
            <p className="text-base md:text-lg text-deep-foreground/80 leading-relaxed text-pretty mb-10">
              {t.sub}
            </p>
            <div className="flex flex-wrap items-center gap-6">
              <a
                href="/auth"
                className="group inline-flex items-center gap-3 bg-accent text-accent-foreground px-8 py-4 text-sm font-medium hover:bg-accent/90 transition-all duration-500"
              >
                {t.cta1}
                <ArrowUpRight size={18} className="transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </a>
              <a
                href="#manifeste"
                className="inline-flex items-center gap-3 px-2 py-4 text-sm border-b border-deep-foreground/40 hover:border-deep-foreground transition-colors"
              >
                {t.cta2}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 right-6 hidden lg:flex items-center gap-3 text-[10px] tracking-[0.3em] text-deep-foreground/60 z-10">
        <span>{t.scroll}</span>
        <span className="block h-px w-10 bg-deep-foreground/40" />
      </div>

      {/* Twi etymology */}
      <div className="absolute bottom-6 left-6 hidden lg:block z-10">
        <p className="text-[10px] tracking-[0.3em] text-deep-foreground/60">
          SAN · KƆ · FA
        </p>
        <p className="text-[10px] text-deep-foreground/40 mt-1 max-w-[200px]">
          {lang === "fr" ? "« Retourner chercher ce qu'on a oublié »" : "“Go back and fetch what was forgotten.”"}
        </p>
      </div>
    </section>
  );
};
