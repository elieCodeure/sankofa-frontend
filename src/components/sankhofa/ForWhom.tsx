import productsImg from "@/assets/products-flatlay.jpg";

interface ForWhomProps { lang: "fr" | "en"; }

const copy = {
  fr: {
    label: "II — POUR QUI",
    title: "Une plateforme façonnée pour ceux qui font.",
    audiences: [
      { num: "01", name: "Créateurs de mode", desc: "Stylistes, maisons textiles, artisans du wax et du bogolan." },
      { num: "02", name: "Producteurs alimentaires", desc: "Épices, café, cacao, miel, huiles — la gastronomie continentale." },
      { num: "03", name: "Artisans & décoration", desc: "Mobilier, céramique, vannerie, sculpture, art du quotidien." },
      { num: "04", name: "Exportateurs", desc: "Agrégateurs, coopératives, marques exportant à l'échelle." },
    ],
  },
  en: {
    label: "II — FOR WHOM",
    title: "A platform shaped for those who make.",
    audiences: [
      { num: "01", name: "Fashion creators", desc: "Designers, textile houses, wax and bogolan artisans." },
      { num: "02", name: "Food producers", desc: "Spices, coffee, cocoa, honey, oils — continental gastronomy." },
      { num: "03", name: "Artisans & decor", desc: "Furniture, ceramics, basketry, sculpture, everyday art." },
      { num: "04", name: "Exporters", desc: "Aggregators, cooperatives, brands shipping at scale." },
    ],
  },
};

export const ForWhom = ({ lang }: ForWhomProps) => {
  const t = copy[lang];
  return (
    <section id="pour-qui" className="py-28 md:py-40 bg-secondary">
      <div className="container">
        <div className="grid lg:grid-cols-12 gap-12 mb-16 md:mb-24">
          <div className="lg:col-span-6">
            <p className="text-[10px] tracking-[0.35em] text-muted-foreground mb-6">{t.label}</p>
            <h2 className="font-display font-light text-4xl md:text-5xl lg:text-6xl leading-[1.05] tracking-tight text-balance">
              {t.title}
            </h2>
          </div>
          <div className="lg:col-span-6">
            <div className="aspect-[4/3] overflow-hidden">
              <img
                src={productsImg}
                alt={lang === "fr" ? "Sélection de produits artisanaux africains" : "Selection of African artisanal products"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-[2000ms]"
                loading="lazy"
                width={1920}
                height={1080}
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
          {t.audiences.map((a) => (
            <article
              key={a.num}
              className="bg-secondary p-8 md:p-10 group hover:bg-background transition-colors duration-500 cursor-default"
            >
              <p className="font-display text-accent text-2xl mb-12">{a.num}</p>
              <h3 className="font-display text-xl md:text-2xl mb-3 leading-tight">{a.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              <div className="h-px w-8 bg-foreground mt-8 group-hover:w-full transition-all duration-700" />
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
