/**
 * ────────────────────────────────────────────────────────────────
 * MOCK BACKEND — Sankhofa
 * ────────────────────────────────────────────────────────────────
 * Ce module simule entièrement l'API backend (normalement Django,
 * cf. baseURL 'http://127.0.0.1:8000/api' dans l'ancien services/api.ts)
 * en mémoire + localStorage, avec les MÊMES formes de données que le
 * vrai backend est censé renvoyer.
 *
 * Quand le vrai backend sera prêt : seul ce fichier (et le fichier
 * services/api.ts qui l'utilise) doit être retiré / remplacé. Aucune
 * page ni aucun composant n'a besoin de changer, car la forme des
 * réponses est identique à ce qu'attendent les composants existants.
 * ────────────────────────────────────────────────────────────────
 */

import { products as staticProducts } from "@/data/products";

// ── Petites aides ────────────────────────────────────────────────

const STORAGE_PREFIX = "sankhofa_mock_";

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
}

export function delay<T>(value: T, ms = 380): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function apiError(payload: any, status = 400): never {
  const err: any = new Error("Mock API Error");
  err.response = { status, data: payload };
  throw err;
}

let idCounters = load("id_counters", {
  user: 100,
  product: 100,
  order: 1000,
  shipment: 500,
  route: 200,
  request: 50,
});

function nextId(kind: keyof typeof idCounters): number {
  idCounters = { ...idCounters, [kind]: idCounters[kind] + 1 };
  save("id_counters", idCounters);
  return idCounters[kind];
}

function randomCode(len = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Types ─────────────────────────────────────────────────────────

export interface MockUser {
  id: number;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: "CLIENT" | "SELLER" | "TRANSPORTER";
  status: "ACTIVE" | "PENDING_VERIFICATION";
  profile: {
    phone_number?: string;
    address?: string;
    country?: string;
    business_name?: string;
    vehicle_type?: "MOTORCYCLE" | "VAN" | "TRUCK";
    coverage_area?: string;
  };
  created_at: string;
}

export interface MockProduct {
  id: number;
  seller: number;
  seller_name: string;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  price: number;
  currency: string;
  stock_quantity: number;
  stock_threshold: number;
  category: string;
  category_name: string;
  country: string;
  country_name: string;
  image: string;
  span: "tall" | "wide" | "square" | "large";
  tag_fr?: string;
  tag_en?: string;
  is_active: boolean;
  created_at: string;
}

export interface MockOrderItem {
  id: number;
  product_id: string | number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface MockOrder {
  id: number;
  buyer: number;
  buyer_name: string;
  items: MockOrderItem[];
  total_price: number;
  status: "PAID" | "SHIPPED" | "DELIVERED";
  /** Le client peut confier la prise en charge de l'expédition au vendeur. */
  shipping_delegated: boolean;
  shipping_address: string;
  phone_number: string;
  created_at: string;
}

export interface MockShipment {
  id: number;
  order: number | null;
  shipment_type: "MARKETPLACE" | "PERSONAL";
  requester: number;
  client_name: string;
  client_email: string;
  transporter: number;
  description: string;
  origin: string;
  destination: string;
  weight: number;
  status: "REQUESTED" | "ACCEPTED" | "PICKED_UP" | "IN_TRANSIT" | "DELIVERED" | "CANCELLED";
  verification_code: string;
  created_at: string;
}

export interface CategoryPrice {
  category: string;
  price_per_kg: number;
}

export interface ProductPriceException {
  product_id: number;
  product_name: string;
  price_per_kg: number;
}

export interface MockRoute {
  id: number;
  transporter: number;
  origin: string;
  destination: string;
  frequency: string;
  /** "flat" = même prix pour tous les produits ; "per_category" = prix différent par type de produit */
  pricing_mode: "flat" | "per_category";
  /** Prix utilisé si pricing_mode === "flat", et prix de secours pour une catégorie non renseignée en mode "per_category" */
  price_per_kg: number;
  /** Uniquement utilisé en mode "per_category" */
  category_prices: CategoryPrice[];
  /** Exceptions ponctuelles sur un produit précis, prioritaires sur tout le reste */
  product_exceptions: ProductPriceException[];
  created_at: string;
}

/**
 * Calcule le prix/kg réellement applicable pour un produit donné sur un
 * itinéraire, en respectant l'ordre de priorité :
 * 1. Exception spécifique au produit
 * 2. Prix de la catégorie du produit (si pricing_mode === "per_category")
 * 3. Prix par défaut de l'itinéraire (mode "flat", ou secours)
 */
export function resolveRoutePrice(
  route: Pick<MockRoute, "pricing_mode" | "price_per_kg" | "category_prices" | "product_exceptions">,
  product: { id: number; category: string }
): number {
  const exception = route.product_exceptions?.find((e) => e.product_id === product.id);
  if (exception) return exception.price_per_kg;

  if (route.pricing_mode === "per_category") {
    const catPrice = route.category_prices?.find((c) => c.category === product.category);
    if (catPrice) return catPrice.price_per_kg;
  }

  return route.price_per_kg;
}

export interface MockCollabRequest {
  id: number;
  sender: number;
  receiver: number;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  created_at: string;
}

// ── Catégories & pays (référence) ──────────────────────────────────

export const CATEGORY_TABLE = [
  { id: "mode", slug: "mode", name: "Mode" },
  { id: "alimentaire", slug: "alimentaire", name: "Alimentaire" },
  { id: "decoration", slug: "decoration", name: "Décoration" },
  { id: "accessoires", slug: "accessoires", name: "Accessoires" },
  { id: "beaute", slug: "beaute", name: "Beauté" },
];

export const COUNTRY_TABLE = [
  { id: "Ghana", name: "Ghana" },
  { id: "Sénégal", name: "Sénégal" },
  { id: "Maroc", name: "Maroc" },
  { id: "Côte d'Ivoire", name: "Côte d'Ivoire" },
  { id: "Kenya", name: "Kenya" },
  { id: "Éthiopie", name: "Éthiopie" },
  { id: "Nigeria", name: "Nigeria" },
  { id: "Mali", name: "Mali" },
];

// ── Seed ────────────────────────────────────────────────────────────

const SEED_USERS: MockUser[] = [
  // Comptes de démonstration (identifiants communiqués dans le README)
  {
    id: 1, email: "client@sankhofa.africa", password: "password123",
    first_name: "Claire", last_name: "Moreau", role: "CLIENT", status: "ACTIVE",
    profile: { phone_number: "+33 6 12 34 56 78", address: "14 rue des Lilas, Paris", country: "France" },
    created_at: "2025-11-02T10:00:00Z",
  },
  {
    id: 2, email: "vendeur@sankhofa.africa", password: "password123",
    first_name: "Akosua", last_name: "Mensah", role: "SELLER", status: "ACTIVE",
    profile: { phone_number: "+233 20 111 2222", address: "Osu, Accra", country: "Ghana", business_name: "Atelier Akoma" },
    created_at: "2024-03-14T10:00:00Z",
  },
  {
    id: 3, email: "transporteur@sankhofa.africa", password: "password123",
    first_name: "Moussa", last_name: "Diop", role: "TRANSPORTER", status: "ACTIVE",
    profile: { phone_number: "+221 77 123 45 67", address: "Plateau, Dakar", country: "Sénégal", business_name: "Baobab Logistics", vehicle_type: "VAN", coverage_area: "Dakar, Abidjan, Accra, Casablanca" },
    created_at: "2024-08-19T10:00:00Z",
  },
  // Autres vendeurs (pour peupler le réseau de collaboration)
  {
    id: 4, email: "contact@maisontiznit.ma", password: "password123",
    first_name: "Yassine", last_name: "Tiznit", role: "SELLER", status: "ACTIVE",
    profile: { phone_number: "+212 6 00 00 00 01", address: "Médina, Marrakech", country: "Maroc", business_name: "Maison Tiznit" },
    created_at: "2023-09-01T10:00:00Z",
  },
  {
    id: 5, email: "hello@tisseusesdethies.sn", password: "password123",
    first_name: "Fatou", last_name: "Ndiaye", role: "SELLER", status: "ACTIVE",
    profile: { phone_number: "+221 78 000 00 02", address: "Thiès", country: "Sénégal", business_name: "Tisseuses de Thiès" },
    created_at: "2024-05-11T10:00:00Z",
  },
  {
    id: 6, email: "roasters@sidamo.et", password: "password123",
    first_name: "Abebe", last_name: "Kassa", role: "SELLER", status: "ACTIVE",
    profile: { phone_number: "+251 91 000 00 03", address: "Yirgacheffe", country: "Éthiopie", business_name: "Sidamo Roasters" },
    created_at: "2025-01-20T10:00:00Z",
  },
  // Autres transporteurs (pour peupler l'annuaire public)
  {
    id: 7, email: "contact@accrafreight.gh", password: "password123",
    first_name: "Kwame", last_name: "Owusu", role: "TRANSPORTER", status: "ACTIVE",
    profile: { phone_number: "+233 24 000 00 04", address: "Tema, Accra", country: "Ghana", business_name: "Accra Freight Co.", vehicle_type: "TRUCK", coverage_area: "Accra, Kumasi, Lomé, Abidjan" },
    created_at: "2025-02-03T10:00:00Z",
  },
  {
    id: 8, email: "contact@sankhofaexpress.sn", password: "password123",
    first_name: "Aminata", last_name: "Traoré", role: "TRANSPORTER", status: "ACTIVE",
    profile: { phone_number: "+221 76 000 00 05", address: "Thiès", country: "Sénégal", business_name: "Sankhofa Express", vehicle_type: "MOTORCYCLE", coverage_area: "Dakar, Thiès, Saint-Louis" },
    created_at: "2024-11-27T10:00:00Z",
  },
];

// seller_name conservé identique au "creator" original des données statiques ;
// seule la propriété (id vendeur) est répartie sur les 4 comptes vendeurs ci-dessus.
const OWNER_BY_PRODUCT_ID: Record<string, number> = {
  "kente-01": 2, "stool-01": 2, "jewelry-01": 2,
  "spices-01": 4, "sandals-01": 4, "tagine-01": 4,
  "basket-01": 5, "shea-01": 5,
  "coffee-01": 6, "dress-01": 6,
};

const CATEGORY_NAME_BY_SLUG: Record<string, string> = Object.fromEntries(
  CATEGORY_TABLE.map((c) => [c.slug, c.name])
);

function buildSeedProducts(): MockProduct[] {
  return staticProducts.map((p, i) => {
    const owner = SEED_USERS.find((u) => u.id === OWNER_BY_PRODUCT_ID[p.id]);
    return {
      id: 100 + i + 1,
      seller: owner?.id ?? 2,
      seller_name: p.creator,
      name_fr: p.name.fr,
      name_en: p.name.en,
      description_fr: `${p.name.fr} — pièce authentique façonnée par ${p.creator}, ${p.country}. Un savoir-faire transmis de génération en génération.`,
      description_en: `${p.name.en} — an authentic piece crafted by ${p.creator}, ${p.country}. Know-how passed down through generations.`,
      price: p.price,
      currency: p.currency,
      stock_quantity: [3, 14, 22, 6, 40, 9][i % 6],
      stock_threshold: 5,
      category: p.category,
      category_name: CATEGORY_NAME_BY_SLUG[p.category] || p.category,
      country: p.country,
      country_name: p.country,
      image: p.image,
      span: p.span,
      tag_fr: p.tag?.fr,
      tag_en: p.tag?.en,
      is_active: true,
      created_at: "2025-06-01T10:00:00Z",
    };
  });
}

const SEED_ORDERS: MockOrder[] = [
  {
    id: 1001, buyer: 1, buyer_name: "Claire Moreau",
    items: [
      { id: 1, product_id: "101", product_name: "Étole Kente Royale", quantity: 1, price: 180 },
      { id: 2, product_id: "107", product_name: "Collier Maasai", quantity: 1, price: 75 },
    ],
    total_price: 255, status: "DELIVERED", shipping_delegated: false,
    shipping_address: "14 rue des Lilas, 75020 Paris, France", phone_number: "+33 6 12 34 56 78",
    created_at: "2026-06-20T09:00:00Z",
  },
  {
    id: 1002, buyer: 1, buyer_name: "Claire Moreau",
    items: [{ id: 3, product_id: "109", product_name: "Robe Wax Solaire", quantity: 1, price: 240 }],
    total_price: 240, status: "SHIPPED", shipping_delegated: false,
    shipping_address: "14 rue des Lilas, 75020 Paris, France", phone_number: "+33 6 12 34 56 78",
    created_at: "2026-07-09T09:00:00Z",
  },
  {
    id: 1003, buyer: 1, buyer_name: "Claire Moreau",
    items: [
      { id: 4, product_id: "102", product_name: "Coffret Épices d'Atlas", quantity: 2, price: 42 },
      { id: 5, product_id: "110", product_name: "Tajine Émaillé", quantity: 1, price: 110 },
    ],
    total_price: 194, status: "PAID", shipping_delegated: false,
    shipping_address: "14 rue des Lilas, 75020 Paris, France", phone_number: "+33 6 12 34 56 78",
    created_at: "2026-07-14T09:00:00Z",
  },
  {
    id: 1004, buyer: 1, buyer_name: "Claire Moreau",
    items: [{ id: 6, product_id: "104", product_name: "Tabouret Ashanti", quantity: 1, price: 320 }],
    total_price: 320, status: "PAID", shipping_delegated: true,
    shipping_address: "14 rue des Lilas, 75020 Paris, France", phone_number: "+33 6 12 34 56 78",
    created_at: "2026-07-15T09:00:00Z",
  },
];

const SEED_SHIPMENTS: MockShipment[] = [
  {
    id: 501, order: 1002, shipment_type: "MARKETPLACE",
    requester: 1, client_name: "Claire Moreau", client_email: "client@sankhofa.africa",
    transporter: 3, description: "Robe Wax Solaire", origin: "Lagos, Nigeria", destination: "14 rue des Lilas, Paris",
    weight: 1.5, status: "IN_TRANSIT", verification_code: "7K2X9P",
    created_at: "2026-07-10T09:00:00Z",
  },
  {
    id: 502, order: null, shipment_type: "PERSONAL",
    requester: 1, client_name: "Claire Moreau", client_email: "client@sankhofa.africa",
    transporter: 3, description: "Colis personnel — tissus & documents", origin: "Dakar, Sénégal", destination: "Paris, France",
    weight: 3, status: "REQUESTED", verification_code: randomCode(),
    created_at: "2026-07-15T09:00:00Z",
  },
];

const SEED_ROUTES: MockRoute[] = [
  {
    id: 201, transporter: 3, origin: "Dakar", destination: "Abidjan", frequency: "Quotidien",
    pricing_mode: "flat", price_per_kg: 3.5, category_prices: [], product_exceptions: [],
    created_at: "2025-01-01T09:00:00Z",
  },
  {
    id: 202, transporter: 3, origin: "Abidjan", destination: "Casablanca", frequency: "Hebdomadaire",
    pricing_mode: "per_category", price_per_kg: 5, // secours, si une catégorie future n'est pas listée
    category_prices: [
      { category: "mode", price_per_kg: 6 },
      { category: "alimentaire", price_per_kg: 4 },
      { category: "decoration", price_per_kg: 7 },
      { category: "accessoires", price_per_kg: 5 },
      { category: "beaute", price_per_kg: 5.5 },
    ],
    product_exceptions: [
      { product_id: 104, product_name: "Tabouret Ashanti", price_per_kg: 9 },
    ],
    created_at: "2025-02-01T09:00:00Z",
  },
];

const SEED_REQUESTS: MockCollabRequest[] = [
  { id: 1, sender: 4, receiver: 2, status: "PENDING", created_at: "2026-07-12T09:00:00Z" },
  { id: 2, sender: 2, receiver: 5, status: "ACCEPTED", created_at: "2026-05-02T09:00:00Z" },
];

// ── Accès aux "tables" (persistées, seedées une seule fois) ────────

export function getUsers(): MockUser[] {
  return load("users", SEED_USERS);
}
export function setUsers(users: MockUser[]) {
  save("users", users);
}

export function getProducts(): MockProduct[] {
  return load("products", buildSeedProducts());
}
export function setProducts(products: MockProduct[]) {
  save("products", products);
}

export function getOrders(): MockOrder[] {
  return load("orders", SEED_ORDERS);
}
export function setOrders(orders: MockOrder[]) {
  save("orders", orders);
}

export function getShipments(): MockShipment[] {
  return load("shipments", SEED_SHIPMENTS);
}
export function setShipments(shipments: MockShipment[]) {
  save("shipments", shipments);
}

export function getRoutes(): MockRoute[] {
  return load("routes", SEED_ROUTES);
}
export function setRoutes(routes: MockRoute[]) {
  save("routes", routes);
}

export function getRequests(): MockCollabRequest[] {
  return load("requests", SEED_REQUESTS);
}
export function setRequests(requests: MockCollabRequest[]) {
  save("requests", requests);
}

export function findUser(id: number): MockUser | undefined {
  return getUsers().find((u) => u.id === id);
}

export function userPublicShape(u: MockUser) {
  const { password, ...rest } = u;
  return rest;
}

/** Réinitialise complètement les données de démonstration. */
export function resetMockData() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(STORAGE_PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}

export const DEMO_ACCOUNTS = [
  { role: "Acheteur", email: "client@sankhofa.africa", password: "password123" },
  { role: "Vendeur", email: "vendeur@sankhofa.africa", password: "password123" },
  { role: "Transporteur", email: "transporteur@sankhofa.africa", password: "password123" },
];
