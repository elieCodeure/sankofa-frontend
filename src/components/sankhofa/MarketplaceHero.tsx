interface Props {
  lang: "fr" | "en";
}

export const MarketplaceHero = ({ lang }: Props) => {
  return (
    <section className="relative pt-32 md:pt-40 pb-12 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-sun pointer-events-none" />
      <div className="container relative">
        <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-muted-foreground mb-8">
          <span className="h-px w-10 bg-accent" />
          <span>{lang === "fr" ? "Marketplace" : "Marketplace"}</span>
        </div>

        <div className="grid md:grid-cols-12 gap-8 items-end">
          <h1 className="md:col-span-8 font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-balance">
            {lang === "fr" ? (
              <>
                L'Afrique, <em className="not-italic gold-line">à portée</em>
                <br />de regard.
              </>
            ) : (
              <>
                Africa, <em className="not-italic gold-line">within</em>
                <br />reach.
              </>
            )}
          </h1>
          <p className="md:col-span-4 text-base md:text-lg text-muted-foreground text-pretty md:pb-4">
            {lang === "fr"
              ? "Une sélection vivante de pièces signées par des créateurs, artisans et coopératives à travers le continent."
              : "A living selection of pieces by creators, artisans and cooperatives across the continent."}
          </p>
        </div>
      </div>
    </section>
  );
};
