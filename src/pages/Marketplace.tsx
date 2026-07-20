import { useEffect, useState } from "react";
import { Navbar } from "@/components/sankhofa/Navbar";
import { Footer } from "@/components/sankhofa/Footer";
import { MarketplaceHero } from "@/components/sankhofa/MarketplaceHero";
import { MarketplaceFilters, type UICategory } from "@/components/sankhofa/MarketplaceFilters";
import { MarketplaceGrid } from "@/components/sankhofa/MarketplaceGrid";
import { CartDrawer } from "@/components/sankhofa/CartDrawer";
import { productService } from "@/services/api";
import { type Country, type Product as UIProduct } from "@/data/products";
import { Loader2 } from "lucide-react";

/**
 * Mappe un produit backend vers l'interface du UI
 */
const mapBackendToUI = (p: any): UIProduct => ({
  id: p.id.toString(),
  name: { 
    fr: p.name_fr || p.name_en || "Produit sans nom", 
    en: p.name_en || p.name_fr || "Unnamed product" 
  },
  creator: p.seller_name || "Artisan Sankhofa",
  country: p.country_name as Country,
  category: p.category_name?.toLowerCase() as any, 
  price: parseFloat(p.price),
  currency: p.currency || "EUR",
  image: p.image || "/placeholder.jpg",
  span: p.span as any || "square",
  tag: p.tag_fr ? { fr: p.tag_fr, en: p.tag_en || p.tag_fr } : undefined
});

const Marketplace = () => {
  const [lang, setLang] = useState<"fr" | "en">("fr");
  const [category, setCategory] = useState<string>("all");
  const [country, setCountry] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [currency, setCurrency] = useState<string>("all");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000000]); // Max large par défaut
  const [products, setProducts] = useState<UIProduct[]>([]);
  const [categories, setCategories] = useState<UICategory[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = lang === "fr"
      ? "Marketplace — Sankhofa"
      : "Marketplace — Sankhofa";

    const desc = lang === "fr"
      ? "Découvrez une sélection éditoriale de produits made in Africa : mode, décoration, alimentaire, accessoires et beauté, par des créateurs du continent."
      : "Discover an editorial selection of made-in-Africa products: fashion, home, food, accessories and beauty, by creators from across the continent.";
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', desc);
    document.documentElement.lang = lang;
  }, [lang]);

  // Ajuster la fourchette de prix par défaut selon la devise
  useEffect(() => {
    if (currency === "XOF") setPriceRange([0, 500000]);
    else if (currency === "GHS") setPriceRange([0, 10000]);
    else if (currency === "USD" || currency === "EUR") setPriceRange([0, 2000]);
    else setPriceRange([0, 1000000]); // Toutes
  }, [currency]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsData, countriesData] = await Promise.all([
          productService.getCategories(),
          productService.getCountries()
        ]);
        
        const mappedCats: UICategory[] = [
          { id: "all", fr: "Tout", en: "All" },
          ...catsData.map((c: any) => ({
            id: c.slug,
            fr: c.name,
            en: c.name
          }))
        ];
        setCategories(mappedCats);

        const mappedCountries: string[] = [
          "all",
          ...countriesData.map((c: any) => c.name)
        ];
        setCountries(mappedCountries);

      } catch (error) {
        console.error("Erreur chargement filtres:", error);
      }
    };
    fetchData();
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const data = await productService.getProducts({
          category: category !== "all" ? category : undefined,
          country: country !== "all" ? country : undefined,
          search: search || undefined,
          currency: currency !== "all" ? currency : undefined,
          min_price: priceRange[0] > 0 ? priceRange[0] : undefined,
          max_price: priceRange[1] < 1000000 ? priceRange[1] : undefined,
        });
        setProducts(data.map(mapBackendToUI));
      } catch (error) {
        console.error("Erreur produits:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, country, search, currency, priceRange]);

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar lang={lang} setLang={setLang} />
      <MarketplaceHero lang={lang} />
      <MarketplaceFilters
        lang={lang}
        category={category}
        categories={categories}
        country={country}
        countries={countries}
        search={search}
        onSearchChange={setSearch}
        currency={currency}
        onCurrencyChange={setCurrency}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        onCategoryChange={setCategory}
        onCountryChange={setCountry}
        count={products.length}
      />
      
      <CartDrawer lang={lang} />
      
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-accent" />
          <p className="text-muted-foreground tracking-widest uppercase text-xs">
            {lang === "fr" ? "Chargement du trésor..." : "Loading treasures..."}
          </p>
        </div>
      ) : products.length > 0 ? (
        <MarketplaceGrid products={products} lang={lang} />
      ) : (
        <div className="text-center py-32">
          <p className="text-muted-foreground font-display text-2xl">
            {lang === "fr" ? "Aucun produit trouvé." : "No products found."}
          </p>
        </div>
      )}
      
      <Footer lang={lang} />
    </main>
  );
};

export default Marketplace;
