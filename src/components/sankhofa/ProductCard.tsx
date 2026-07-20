import type { Product } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { ShoppingCart } from "lucide-react";

interface Props {
  product: Product;
  lang: "fr" | "en";
  index: number;
}

const spanClasses: Record<Product["span"], string> = {
  tall: "md:row-span-2",
  wide: "md:col-span-2",
  square: "",
  large: "md:col-span-2 md:row-span-2",
};

const aspectClasses: Record<Product["span"], string> = {
  tall: "aspect-[3/4]",
  wide: "aspect-[2/1]",
  square: "aspect-square",
  large: "aspect-square",
};

export const ProductCard = ({ product, lang, index }: Props) => {
  const { addToCart } = useCart();
  return (
    <article
      className={`group relative ${spanClasses[product.span]} animate-float-in`}
      style={{ animationDelay: `${Math.min(index * 60, 480)}ms` }}
    >
      <div
        className={`relative ${aspectClasses[product.span]} overflow-hidden bg-secondary`}
      >
        <img
          src={product.image}
          alt={product.name[lang]}
          loading="lazy"
          width={800}
          height={1000}
          className="w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
        />

        {/* Voile au hover */}
        <div className="absolute inset-0 bg-gradient-veil opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

        {/* Tag */}
        {product.tag && (
          <span className="absolute top-4 left-4 text-[10px] tracking-[0.2em] uppercase bg-background/90 backdrop-blur px-2.5 py-1 text-foreground">
            {product.tag[lang]}
          </span>
        )}

        {/* Pays — coin haut droit */}
        <span className="absolute top-4 right-4 text-[10px] tracking-[0.2em] uppercase text-background/0 group-hover:text-background transition-all duration-500 translate-y-1 group-hover:translate-y-0">
          {product.country}
        </span>

        {/* Détails au hover */}
        <div className="absolute inset-x-0 bottom-0 p-5 md:p-6 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700">
          <p className="text-[10px] tracking-[0.25em] uppercase text-background/70 mb-1">
            {product.creator}
          </p>
          <div className="flex items-end justify-between gap-3">
            <h3 className="font-display text-xl md:text-2xl text-background leading-tight">
              {product.name[lang]}
            </h3>
            <span className="font-display text-lg text-accent shrink-0">
              {product.price} {product.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Légende toujours visible (sobre) */}
      <div className="pt-4 flex items-start justify-between gap-4">
        <div className="min-w-0 group-hover:opacity-0 transition-opacity duration-500">
          <p className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground mb-1">
            {product.country}
          </p>
          <h3 className="font-display text-lg md:text-xl leading-tight truncate">
            {product.name[lang]}
          </h3>
        </div>
        <div className="flex items-center justify-between gap-4 shrink-0">
          <span className="font-display text-base shrink-0 group-hover:opacity-0 transition-opacity duration-500">
            {product.price} {product.currency}
          </span>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              addToCart(product);
            }}
            aria-label={lang === "fr" ? `Ajouter ${product.name.fr} au panier` : `Add ${product.name.en} to cart`}
            className="p-2 hover:text-accent transition-colors relative z-10"
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </article>
  );
};
