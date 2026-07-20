import kenteScarf from "@/assets/marketplace/kente-scarf.jpg";
import spices from "@/assets/marketplace/spices.jpg";
import sandals from "@/assets/marketplace/sandals.jpg";
import stool from "@/assets/marketplace/stool.jpg";
import basket from "@/assets/marketplace/basket.jpg";
import shea from "@/assets/marketplace/shea.jpg";
import jewelry from "@/assets/marketplace/jewelry.jpg";
import coffee from "@/assets/marketplace/coffee.jpg";
import dress from "@/assets/marketplace/dress.jpg";
import tagine from "@/assets/marketplace/tagine.jpg";

export type Category = "mode" | "alimentaire" | "decoration" | "accessoires" | "beaute";
export type Country =
  | "Ghana"
  | "Sénégal"
  | "Maroc"
  | "Côte d'Ivoire"
  | "Kenya"
  | "Éthiopie"
  | "Nigeria"
  | "Mali";

export interface Product {
  id: string;
  name: { fr: string; en: string };
  creator: string;
  country: Country;
  category: Category;
  price: number;
  currency: string;
  image: string;
  // Pour la mosaïque éditoriale
  span: "tall" | "wide" | "square" | "large";
  tag?: { fr: string; en: string };
}

export const products: Product[] = [
  {
    id: "kente-01",
    name: { fr: "Étole Kente Royale", en: "Royal Kente Stole" },
    creator: "Atelier Akoma",
    country: "Ghana",
    category: "mode",
    price: 180,
    currency: "EUR",
    image: kenteScarf,
    span: "tall",
    tag: { fr: "Édition limitée", en: "Limited edition" },
  },
  {
    id: "spices-01",
    name: { fr: "Coffret Épices d'Atlas", en: "Atlas Spice Collection" },
    creator: "Maison Tiznit",
    country: "Maroc",
    category: "alimentaire",
    price: 42,
    currency: "EUR",
    image: spices,
    span: "square",
  },
  {
    id: "sandals-01",
    name: { fr: "Sandales Tan Cuir", en: "Tan Leather Sandals" },
    creator: "Souk Marrakech",
    country: "Maroc",
    category: "accessoires",
    price: 95,
    currency: "EUR",
    image: sandals,
    span: "tall",
  },
  {
    id: "stool-01",
    name: { fr: "Tabouret Ashanti", en: "Ashanti Carved Stool" },
    creator: "Bois & Mémoire",
    country: "Ghana",
    category: "decoration",
    price: 320,
    currency: "EUR",
    image: stool,
    span: "large",
    tag: { fr: "Pièce unique", en: "One of a kind" },
  },
  {
    id: "basket-01",
    name: { fr: "Panier Raphia Indigo", en: "Indigo Raffia Basket" },
    creator: "Tisseuses de Thiès",
    country: "Sénégal",
    category: "decoration",
    price: 68,
    currency: "EUR",
    image: basket,
    span: "square",
  },
  {
    id: "shea-01",
    name: { fr: "Beurre de Karité Brut", en: "Raw Shea Butter" },
    creator: "Coopérative Karité",
    country: "Mali",
    category: "beaute",
    price: 28,
    currency: "EUR",
    image: shea,
    span: "tall",
  },
  {
    id: "jewelry-01",
    name: { fr: "Collier Maasai", en: "Maasai Beaded Necklace" },
    creator: "Naserian Studio",
    country: "Kenya",
    category: "accessoires",
    price: 75,
    currency: "EUR",
    image: jewelry,
    span: "square",
  },
  {
    id: "coffee-01",
    name: { fr: "Café Yirgacheffe", en: "Yirgacheffe Coffee" },
    creator: "Sidamo Roasters",
    country: "Éthiopie",
    category: "alimentaire",
    price: 24,
    currency: "EUR",
    image: coffee,
    span: "tall",
    tag: { fr: "Nouveau", en: "New" },
  },
  {
    id: "dress-01",
    name: { fr: "Robe Wax Solaire", en: "Solar Wax Dress" },
    creator: "Lola Adesina",
    country: "Nigeria",
    category: "mode",
    price: 240,
    currency: "EUR",
    image: dress,
    span: "large",
  },
  {
    id: "tagine-01",
    name: { fr: "Tajine Émaillé", en: "Glazed Tagine" },
    creator: "Poteries de Safi",
    country: "Maroc",
    category: "decoration",
    price: 110,
    currency: "EUR",
    image: tagine,
    span: "wide",
  },
];

export const categories: { id: Category | "all"; fr: string; en: string }[] = [
  { id: "all", fr: "Tout", en: "All" },
  { id: "mode", fr: "Mode", en: "Fashion" },
  { id: "alimentaire", fr: "Alimentaire", en: "Food" },
  { id: "decoration", fr: "Décoration", en: "Home" },
  { id: "accessoires", fr: "Accessoires", en: "Accessories" },
  { id: "beaute", fr: "Beauté", en: "Beauty" },
];

export const countries: (Country | "all")[] = [
  "all",
  "Ghana",
  "Sénégal",
  "Maroc",
  "Côte d'Ivoire",
  "Kenya",
  "Éthiopie",
  "Nigeria",
  "Mali",
];
