import { Logo } from "./Logo";

interface FooterProps { lang: "fr" | "en"; }

const currentYear = new Date().getFullYear();

const copy = {
  fr: {
    tag: "« Se ti me a, fa bi ma me. »",
    tagSub: "Si tu en trouves, partage avec moi. — Proverbe akan",
    cols: [
      { title: "Plateforme", links: ["Boutique", "Paiements", "Logistique", "IA & Récit", "Marketplace"] },
      { title: "Communauté", links: ["Expéditions", "Coopératives", "Académie", "Évènements", "Blog"] },
      { title: "Maison", links: ["Manifeste", "Équipe", "Carrières", "Presse", "Contact"] },
    ],
    legal: `© ${currentYear} Sankhofa. Produit par <a href="https://digiscia.com" target="_blank" rel="noopener noreferrer">DigiScia</a>`,
  },
  en: {
    tag: "“Se ti me a, fa bi ma me.”",
    tagSub: "If you find some, share with me. — Akan proverb",
    cols: [
      { title: "Platform", links: ["Storefront", "Payments", "Logistics", "AI & Story", "Marketplace"] },
      { title: "Community", links: ["Shipments", "Cooperatives", "Academy", "Events", "Blog"] },
      { title: "House", links: ["Manifesto", "Team", "Careers", "Press", "Contact"] },
    ],
    legal: `© ${currentYear} Sankhofa. Produced by <a href="https://digiscia.com" target="_blank" rel="noopener noreferrer">DigiScia</a>`,
  },
};

export const Footer = ({ lang }: FooterProps) => {
  const t = copy[lang];
  return (
    <footer className="bg-deep text-deep-foreground border-t border-deep-foreground/10">
      <div className="container py-20">
        <div className="grid lg:grid-cols-12 gap-12 mb-16">
          <div className="lg:col-span-5">
            <Logo variant="light" />
            <p className="font-display italic text-2xl md:text-3xl mt-8 leading-tight max-w-md">
              {t.tag}
            </p>
            <p className="text-xs tracking-wider text-deep-foreground/50 mt-3">{t.tagSub}</p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-3 gap-6">
            {t.cols.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs tracking-[0.2em] uppercase text-deep-foreground/50 mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="text-sm text-deep-foreground/85 hover:text-accent transition-colors">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-8 border-t border-deep-foreground/10 flex flex-wrap items-center justify-between gap-4">
          <p 
            className="text-xs text-deep-foreground/50 [&>a]:underline [&>a]:hover:text-accent [&>a]:transition-colors"
            dangerouslySetInnerHTML={{ __html: t.legal }}
          />
          <p className="text-[10px] tracking-[0.3em] text-deep-foreground/40">SAN · KƆ · FA</p>
        </div>
      </div>
    </footer>
  );
};
