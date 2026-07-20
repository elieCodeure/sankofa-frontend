interface MarqueeProps { lang: "fr" | "en"; }

const items = {
  fr: ["Mode", "Épices", "Décoration", "Ameublement", "Beauté", "Alimentaire", "Bijoux", "Maroquinerie", "Textile", "Café & Cacao"],
  en: ["Fashion", "Spices", "Decor", "Furniture", "Beauty", "Food", "Jewelry", "Leather", "Textile", "Coffee & Cocoa"],
};

export const Marquee = ({ lang }: MarqueeProps) => {
  const list = [...items[lang], ...items[lang]];
  return (
    <section className="border-y border-border bg-secondary py-6 overflow-hidden">
      <div className="flex marquee whitespace-nowrap">
        {list.map((item, i) => (
          <div key={i} className="flex items-center gap-12 px-6 shrink-0">
            <span className="font-display italic text-2xl md:text-3xl text-foreground/80">{item}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
          </div>
        ))}
      </div>
    </section>
  );
};
