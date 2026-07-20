interface ManifestoProps { lang: "fr" | "en"; }

const copy = {
  fr: {
    label: "I — MANIFESTE",
    title: "Regarder en arrière, pour bâtir l'avant.",
    p1: "Sankofa, en langue twi du Ghana, est l'oiseau dont la tête se retourne pour saisir l'œuf qu'il a oublié. Il enseigne qu'il n'y a aucune honte à revenir chercher ce qui nous fonde.",
    p2: "Ce continent est la réserve mondiale du goût, du tissu, du geste, du parfum. Pourtant, ses créateurs restent invisibles dans les vitrines du commerce global.",
    p3: "Nous bâtissons l'infrastructure manquante — boutique, paiement, logistique, audience — pour que chaque artisan, chaque maison, chaque marque puisse parler au monde, depuis sa terre, dans sa langue, à sa juste valeur.",
    sig: "— Le collectif Sankhofa",
  },
  en: {
    label: "I — MANIFESTO",
    title: "Look back to build forward.",
    p1: "Sankofa, in the Twi language of Ghana, is the bird turning its head back to retrieve the egg it left behind. It teaches that there is no shame in returning for what made us.",
    p2: "This continent is the world's reserve of taste, fabric, gesture, fragrance. Yet its creators remain invisible in the windows of global commerce.",
    p3: "We are building the missing infrastructure — storefront, payments, logistics, audience — so every artisan, every house, every brand can speak to the world, from their land, in their voice, at their true worth.",
    sig: "— The Sankhofa collective",
  },
};

export const Manifesto = ({ lang }: ManifestoProps) => {
  const t = copy[lang];
  return (
    <section id="manifeste" className="relative py-28 md:py-40 bg-background overflow-hidden">
      {/* Decorative giant initial */}
      <div aria-hidden className="absolute -top-10 right-0 font-display text-[40vw] md:text-[28vw] leading-none text-accent/[0.06] pointer-events-none select-none">
        S
      </div>

      <div className="container relative">
        <p className="text-[10px] tracking-[0.35em] text-muted-foreground mb-8">{t.label}</p>

        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-7">
            <h2 className="font-display font-light text-4xl md:text-6xl lg:text-7xl leading-[1.02] tracking-tight text-balance">
              {t.title}
            </h2>
          </div>
          <div className="lg:col-span-5 space-y-6 text-foreground/75 leading-relaxed text-pretty pt-2">
            <p className="first-letter:font-display first-letter:text-5xl first-letter:float-left first-letter:mr-2 first-letter:leading-[0.85] first-letter:text-accent">
              {t.p1}
            </p>
            <p>{t.p2}</p>
            <p className="text-foreground">{t.p3}</p>
            <p className="text-xs tracking-[0.2em] text-muted-foreground pt-4">{t.sig}</p>
          </div>
        </div>
      </div>
    </section>
  );
};
