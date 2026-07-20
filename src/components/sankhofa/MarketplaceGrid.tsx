import type { Product } from "@/data/products";
import { ProductCard } from "./ProductCard";

interface Props {
  products: Product[];
  lang: "fr" | "en";
}

export const MarketplaceGrid = ({ products, lang }: Props) => {
  if (products.length === 0) {
    return (
      <div className="container py-32 text-center">
        <p className="font-display text-3xl md:text-4xl mb-3">
          {lang === "fr" ? "Aucune pièce ne correspond." : "No piece matches."}
        </p>
        <p className="text-muted-foreground">
          {lang === "fr"
            ? "Modifiez vos filtres pour explorer d'autres trésors."
            : "Adjust your filters to explore other treasures."}
        </p>
      </div>
    );
  }

  return (
    <section className="container py-12 md:py-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8 md:auto-rows-[280px] lg:auto-rows-[320px]">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} lang={lang} index={i} />
        ))}
      </div>
    </section>
  );
};
