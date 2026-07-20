import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { useState, useEffect } from "react";

export type UICategory = { id: string | "all"; fr: string; en: string };

interface Props {
  lang: "fr" | "en";
  category: string;
  categories: UICategory[];
  country: string;
  countries: string[];
  search: string;
  onSearchChange: (s: string) => void;
  currency: string;
  onCurrencyChange: (c: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  onCategoryChange: (c: string) => void;
  onCountryChange: (c: string) => void;
  count: number;
}

export const MarketplaceFilters = ({
  lang,
  category,
  categories,
  country,
  countries,
  search,
  onSearchChange,
  currency,
  onCurrencyChange,
  priceRange,
  onPriceRangeChange,
  onCategoryChange,
  onCountryChange,
  count,
}: Props) => {
  const [openCountry, setOpenCountry] = useState(false);
  const [openPrice, setOpenPrice] = useState(false);
  const [openCurrency, setOpenCurrency] = useState(false);
  const [localSearch, setLocalSearch] = useState(search);

  const currencies = ["all", "EUR", "XOF", "GHS", "USD"];

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearch);
    }, 500);
    return () => clearTimeout(timer);
  }, [localSearch]);

  return (
    <div className="sticky top-16 md:top-20 z-30 bg-background/85 backdrop-blur-xl border-y border-border">
      <div className="container py-4 flex flex-col gap-4">
        {/* Ligne 1: Recherche & Stats */}
        <div className="flex items-center justify-between gap-4">
           <div className="relative flex-1 max-w-md group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input 
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder={lang === "fr" ? "Rechercher un trésor..." : "Search for a treasure..."}
                className="w-full bg-secondary/50 border-none rounded-none py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-accent transition-all duration-500 placeholder:text-muted-foreground/50"
              />
           </div>
           
           <span className="hidden md:block text-[10px] tracking-[0.25em] uppercase text-muted-foreground whitespace-nowrap">
            {count} {lang === "fr" ? "pièces trouvées" : "items found"}
          </span>
        </div>

        {/* Ligne 2: Catégories & Filtres Spécifiques */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8">
          {/* Catégories */}
          <div className="flex items-center gap-2 overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0 md:flex-1 scrollbar-none">
            {categories.map((c) => {
              const active = category === c.id;
              return (
                <button
                  key={c.id}
                  onClick={() => onCategoryChange(c.id)}
                  className={`shrink-0 px-4 py-2 text-[10px] tracking-[0.2em] uppercase transition-all duration-500 border ${
                    active
                      ? "bg-foreground text-background border-foreground"
                      : "border-border text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {c[lang]}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-6 md:border-l md:border-border md:pl-8">
            {/* Prix */}
            <div className="relative">
              <button
                onClick={() => setOpenPrice(!openPrice)}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-foreground hover:text-accent transition-colors"
                disabled={currency === "all"}
              >
                <span className="text-muted-foreground">{lang === "fr" ? "Prix" : "Price"}</span>
                <span>·</span>
                <span>
                  {currency === "all" 
                    ? (lang === "fr" ? "Choisir une devise" : "Choose currency")
                    : `${priceRange[0]} - ${priceRange[1]}${currency === 'EUR' ? '€' : ' ' + currency}`
                  }
                </span>
                <ChevronDown size={12} className={`transition-transform ${openPrice ? "rotate-180" : ""}`} />
              </button>
              
              {openPrice && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenPrice(false)} />
                  <div className="absolute right-0 mt-3 w-64 bg-background border border-border shadow-2xl z-50 p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                     <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-4">Budget ({currency === 'all' ? 'EUR' : currency})</p>
                     <div className="flex items-center gap-3">
                        <input 
                          type="number" 
                          value={priceRange[0]}
                          onChange={(e) => onPriceRangeChange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="w-full bg-secondary border-none py-2 px-3 text-xs focus:ring-1 focus:ring-accent"
                          placeholder="Min"
                        />
                        <span className="text-muted-foreground">—</span>
                        <input 
                          type="number" 
                          value={priceRange[1]}
                          onChange={(e) => onPriceRangeChange([priceRange[0], parseInt(e.target.value) || 2000])}
                          className="w-full bg-secondary border-none py-2 px-3 text-xs focus:ring-1 focus:ring-accent"
                          placeholder="Max"
                        />
                     </div>
                  </div>
                </>
              )}
            </div>

            {/* Monnaie */}
            <div className="relative">
              <button
                onClick={() => setOpenCurrency(!openCurrency)}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-foreground hover:text-accent transition-colors"
              >
                <span className="text-muted-foreground">{lang === "fr" ? "Devise" : "Currency"}</span>
                <span>·</span>
                <span>{currency === "all" ? (lang === "fr" ? "Toutes" : "All") : currency}</span>
                <ChevronDown size={12} className={`transition-transform ${openCurrency ? "rotate-180" : ""}`} />
              </button>
              {openCurrency && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenCurrency(false)} />
                  <ul className="absolute right-0 mt-3 w-40 bg-background border border-border shadow-2xl z-50 py-2 animate-in fade-in zoom-in-95 duration-200">
                    {currencies.map((curr) => {
                      const active = currency === curr;
                      return (
                        <li key={curr}>
                          <button
                            onClick={() => {
                              onCurrencyChange(curr);
                              setOpenCurrency(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-xs tracking-wider transition-colors ${
                              active
                                ? "bg-accent/10 text-accent font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }`}
                          >
                            {curr === "all" ? (lang === "fr" ? "Toutes" : "All") : curr}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            {/* Pays */}
            <div className="relative">
              <button
                onClick={() => setOpenCountry(!openCountry)}
                className="flex items-center gap-1.5 text-[10px] tracking-[0.2em] uppercase text-foreground hover:text-accent transition-colors"
              >
                <span className="text-muted-foreground">{lang === "fr" ? "Pays" : "Country"}</span>
                <span>·</span>
                <span>{country === "all" ? (lang === "fr" ? "Tous" : "All") : country}</span>
                <ChevronDown size={12} className={`transition-transform ${openCountry ? "rotate-180" : ""}`} />
              </button>
              {openCountry && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setOpenCountry(false)} />
                  <ul className="absolute right-0 mt-3 w-56 bg-background border border-border shadow-2xl z-50 py-2 max-h-80 overflow-auto scrollbar-thin">
                    {countries.map((c) => {
                      const active = country === c;
                      return (
                        <li key={c}>
                          <button
                            onClick={() => {
                              onCountryChange(c);
                              setOpenCountry(false);
                            }}
                            className={`w-full text-left px-5 py-2.5 text-xs tracking-wider transition-colors ${
                              active
                                ? "bg-accent/10 text-accent font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                            }`}
                          >
                            {c === "all" ? (lang === "fr" ? "Tous les pays" : "All countries") : c}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
