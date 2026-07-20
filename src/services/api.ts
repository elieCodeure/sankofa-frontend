/**
 * ────────────────────────────────────────────────────────────────
 * services/api.ts — VERSION MOCKÉE (sans backend)
 * ────────────────────────────────────────────────────────────────
 * Ce fichier expose exactement les mêmes services (authService,
 * orderService, productService, collaborationService,
 * logisticsService) que la version originale connectée à Django,
 * avec les mêmes signatures et les mêmes formes de réponse.
 *
 * Aucune page ni aucun composant n'a besoin d'être modifié : ils
 * importent toujours `{ authService, ... } from "@/services/api"`.
 *
 * Pour brancher le vrai backend plus tard : remplacer le contenu de
 * ce fichier par un client axios pointant vers l'API réelle, en
 * conservant les mêmes noms de fonctions et formes de retour
 * documentées ici et dans mockDb.ts. L'ancienne version axios est
 * conservée dans api.ts.original-axios-backup pour référence.
 * ────────────────────────────────────────────────────────────────
 */

import {
  delay,
  apiError,
  fileToDataUrl,
  getUsers,
  setUsers,
  getProducts as dbGetProducts,
  setProducts as dbSetProducts,
  getOrders as dbGetOrders,
  setOrders as dbSetOrders,
  getShipments as dbGetShipments,
  setShipments as dbSetShipments,
  getRoutes as dbGetRoutes,
  setRoutes as dbSetRoutes,
  getRequests as dbGetRequests,
  setRequests as dbSetRequests,
  findUser,
  userPublicShape,
  CATEGORY_TABLE,
  COUNTRY_TABLE,
  type MockProduct,
  type MockRoute,
} from "./mockDb";

// ── Session courante ────────────────────────────────────────────────

function getCurrentUserRaw(): any {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

function requireCurrentUser(): any {
  const user = getCurrentUserRaw();
  if (!user) apiError({ detail: "Authentification requise." }, 401);
  return user;
}

function persistSession(user: any) {
  const access = `mock-access.${user.id}.${Date.now()}`;
  const refresh = `mock-refresh.${user.id}.${Date.now()}`;
  localStorage.setItem("access_token", access);
  localStorage.setItem("refresh_token", refresh);
  localStorage.setItem("user", JSON.stringify(user));
  return { access, refresh };
}

function nextIntId(list: { id: number }[], base: number) {
  return list.length ? Math.max(...list.map((x) => x.id)) + 1 : base;
}

// ── authService ─────────────────────────────────────────────────────

export const authService = {
  login: async (email: string, password: string) => {
    const match = getUsers().find(
      (u) => u.email.toLowerCase() === (email || "").toLowerCase() && u.password === password
    );
    if (!match) {
      await delay(null, 500);
      apiError({ email: ["Email ou mot de passe incorrect."] });
    }
    const user = userPublicShape(match!);
    const tokens = persistSession(user);
    return delay({ user, tokens });
  },

  register: async (userData: any) => {
    const users = getUsers();
    const email = (userData.email || "").toLowerCase();
    if (users.some((u) => u.email.toLowerCase() === email)) {
      await delay(null, 400);
      apiError({ email: ["Cet email est déjà utilisé."] });
    }

    const role = (userData.role || "CLIENT") as "CLIENT" | "SELLER" | "TRANSPORTER";
    const id = nextIntId(users, 100);

    const profile: any = {
      phone_number: userData.phone_number || "",
      address: userData.address || "",
      country: userData.country || "",
    };
    if (role === "SELLER") profile.business_name = userData.business_name || "";
    if (role === "TRANSPORTER") {
      profile.vehicle_type = userData.vehicle_type || "MOTORCYCLE";
      profile.coverage_area = userData.coverage_area || "";
    }

    const newUser = {
      id,
      email: userData.email,
      password: userData.password || "changeme",
      first_name: userData.first_name || "",
      last_name: userData.last_name || "",
      role,
      status: role === "CLIENT" ? ("ACTIVE" as const) : ("PENDING_VERIFICATION" as const),
      profile,
      created_at: new Date().toISOString(),
    };

    setUsers([...users, newUser]);
    const publicUser = userPublicShape(newUser);
    const tokens = persistSession(publicUser);
    return delay({ user: publicUser, tokens }, 600);
  },

  getCurrentUser: () => getCurrentUserRaw(),

  logout: () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    window.location.href = "/auth";
  },

  updateProfile: async (data: any) => {
    const current = requireCurrentUser();
    const users = getUsers();
    const updated = users.map((u) =>
      u.id === current.id
        ? {
            ...u,
            first_name: data.first_name ?? u.first_name,
            last_name: data.last_name ?? u.last_name,
            email: data.email ?? u.email,
            profile: { ...u.profile, ...(data.profile || {}) },
          }
        : u
    );
    setUsers(updated);
    const fresh = updated.find((u) => u.id === current.id)!;
    const publicUser = userPublicShape(fresh);
    localStorage.setItem("user", JSON.stringify(publicUser));
    return delay(publicUser);
  },

  changePassword: async (data: any) => {
    const current = requireCurrentUser();
    const users = getUsers();
    const real = users.find((u) => u.id === current.id)!;
    if (real.password !== data.old_password) {
      await delay(null, 400);
      apiError({ old_password: ["Ancien mot de passe incorrect."] });
    }
    setUsers(users.map((u) => (u.id === current.id ? { ...u, password: data.new_password } : u)));
    return delay({ detail: "Mot de passe modifié." });
  },
};

// ── productService ──────────────────────────────────────────────────

export const productService = {
  getProducts: async (params: Record<string, any> = {}) => {
    const current = getCurrentUserRaw();
    let list = dbGetProducts();

    if (params.my_products === "true" || params.my_products === true) {
      if (!current) apiError({ detail: "Authentification requise." }, 401);
      list = list.filter((p) => p.seller === current.id);
    } else {
      list = list.filter((p) => p.is_active);
      if (params.category) list = list.filter((p) => p.category === params.category);
      if (params.country) list = list.filter((p) => p.country === params.country);
      if (params.currency) list = list.filter((p) => p.currency === params.currency);
      if (params.min_price !== undefined) list = list.filter((p) => p.price >= Number(params.min_price));
      if (params.max_price !== undefined) list = list.filter((p) => p.price <= Number(params.max_price));
      if (params.search) {
        const q = String(params.search).toLowerCase();
        list = list.filter(
          (p) =>
            p.name_fr.toLowerCase().includes(q) ||
            p.name_en.toLowerCase().includes(q) ||
            p.seller_name.toLowerCase().includes(q)
        );
      }
    }

    const withComputed = list.map((p) => ({ ...p, is_low_stock: p.stock_quantity <= p.stock_threshold }));
    return delay(withComputed);
  },

  createProduct: async (data: any) => {
    const current = requireCurrentUser();
    const products = dbGetProducts();
    const payload = data instanceof FormData ? Object.fromEntries(data.entries()) : data;

    let image = "https://images.unsplash.com/photo-1544648151-5079751bfccd?auto=format&fit=crop&q=80&w=600";
    if (payload.image instanceof File) image = await fileToDataUrl(payload.image);

    const categoryEntry = CATEGORY_TABLE.find((c) => c.id === payload.category);
    const countryEntry = COUNTRY_TABLE.find((c) => c.id === payload.country);

    const newProduct: MockProduct = {
      id: nextIntId(products, 200),
      seller: current.id,
      seller_name: current.profile?.business_name || `${current.first_name} ${current.last_name}`,
      name_fr: payload.name_fr || "",
      name_en: payload.name_en || payload.name_fr || "",
      description_fr: payload.description_fr || "",
      description_en: payload.description_en || payload.description_fr || "",
      price: parseFloat(payload.price) || 0,
      currency: payload.currency || "EUR",
      stock_quantity: parseInt(payload.stock_quantity, 10) || 0,
      stock_threshold: parseInt(payload.stock_threshold, 10) || 5,
      category: payload.category,
      category_name: categoryEntry?.name || payload.category,
      country: payload.country,
      country_name: countryEntry?.name || payload.country,
      image,
      span: payload.span || "square",
      tag_fr: payload.tag_fr || undefined,
      tag_en: payload.tag_en || undefined,
      is_active: payload.is_active === false || payload.is_active === "false" ? false : true,
      created_at: new Date().toISOString(),
    };

    dbSetProducts([...products, newProduct]);
    return delay(newProduct, 500);
  },

  updateProduct: async (id: number, data: any) => {
    const current = requireCurrentUser();
    const products = dbGetProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing || existing.seller !== current.id) apiError({ detail: "Produit introuvable." }, 404);

    const payload = data instanceof FormData ? Object.fromEntries(data.entries()) : data;
    let image = existing!.image;
    if (payload.image instanceof File) image = await fileToDataUrl(payload.image);

    const categoryEntry = CATEGORY_TABLE.find((c) => c.id === payload.category);
    const countryEntry = COUNTRY_TABLE.find((c) => c.id === payload.country);

    const updated: MockProduct = {
      ...existing!,
      name_fr: payload.name_fr ?? existing!.name_fr,
      name_en: payload.name_en ?? existing!.name_en,
      description_fr: payload.description_fr ?? existing!.description_fr,
      description_en: payload.description_en ?? existing!.description_en,
      price: payload.price !== undefined ? parseFloat(payload.price) : existing!.price,
      currency: payload.currency ?? existing!.currency,
      stock_quantity: payload.stock_quantity !== undefined ? parseInt(payload.stock_quantity, 10) : existing!.stock_quantity,
      stock_threshold: payload.stock_threshold !== undefined ? parseInt(payload.stock_threshold, 10) : existing!.stock_threshold,
      category: payload.category ?? existing!.category,
      category_name: categoryEntry?.name || existing!.category_name,
      country: payload.country ?? existing!.country,
      country_name: countryEntry?.name || existing!.country_name,
      image,
      span: payload.span ?? existing!.span,
      tag_fr: payload.tag_fr ?? existing!.tag_fr,
      tag_en: payload.tag_en ?? existing!.tag_en,
      is_active:
        payload.is_active === undefined
          ? existing!.is_active
          : !(payload.is_active === false || payload.is_active === "false"),
    };

    dbSetProducts(products.map((p) => (p.id === id ? updated : p)));
    return delay(updated, 450);
  },

  deleteProduct: async (id: number) => {
    const current = requireCurrentUser();
    const products = dbGetProducts();
    const existing = products.find((p) => p.id === id);
    if (!existing || existing.seller !== current.id) apiError({ detail: "Produit introuvable." }, 404);
    dbSetProducts(products.filter((p) => p.id !== id));
    return delay(undefined, 350);
  },

  getCategories: async () => delay(CATEGORY_TABLE, 200),
  getCountries: async () => delay(COUNTRY_TABLE, 200),
};

// ── orderService ────────────────────────────────────────────────────

export const orderService = {
  getOrders: async () => {
    const current = requireCurrentUser();
    const orders = dbGetOrders().filter((o) => o.buyer === current.id);
    return delay(orders.slice().sort((a, b) => b.id - a.id));
  },

  createOrder: async (orderData: any) => {
    const current = requireCurrentUser();
    const orders = dbGetOrders();
    const items = (orderData.items || []).map((it: any, i: number) => ({
      id: i + 1,
      product_id: it.product_id,
      product_name: it.product_name,
      quantity: it.quantity,
      price: it.price,
    }));
    const total = items.reduce((s: number, it: any) => s + it.price * it.quantity, 0);

    const newOrder = {
      id: nextIntId(orders, 2000),
      buyer: current.id,
      buyer_name: `${current.first_name} ${current.last_name}`.trim() || current.email,
      items,
      total_price: total,
      status: "PAID" as const,
      shipping_delegated: Boolean(orderData.shipping_delegated),
      shipping_address: orderData.shipping_address,
      phone_number: orderData.phone_number,
      created_at: new Date().toISOString(),
    };

    dbSetOrders([...orders, newOrder]);
    return delay(newOrder, 700);
  },

  getSellerOrders: async () => {
    const current = requireCurrentUser();
    const myProductIds = new Set(dbGetProducts().filter((p) => p.seller === current.id).map((p) => String(p.id)));
    const orders = dbGetOrders().filter((o) => o.items.some((it) => myProductIds.has(String(it.product_id))));
    return delay(orders.slice().sort((a, b) => b.id - a.id));
  },

  /**
   * Le client confie la prise en charge de l'expédition au vendeur : la
   * commande disparaît de "à expédier" côté acheteur et apparaît comme
   * prioritaire côté vendeur, dans son propre onglet Sankhofa Ship.
   */
  delegateShipping: async (orderId: number) => {
    const current = requireCurrentUser();
    const orders = dbGetOrders();
    const target = orders.find((o) => o.id === orderId && o.buyer === current.id);
    if (!target) apiError({ detail: "Commande introuvable." }, 404);
    if (target!.status !== "PAID") {
      apiError({ detail: "Seule une commande payée et non encore expédiée peut être confiée au vendeur." });
    }
    const updated = orders.map((o) => (o.id === orderId ? { ...o, shipping_delegated: true } : o));
    dbSetOrders(updated);
    return delay(updated.find((o) => o.id === orderId), 400);
  },
};

// ── collaborationService ─────────────────────────────────────────────

function withSellerDetails(req: ReturnType<typeof dbGetRequests>[number]) {
  const sender = findUser(req.sender);
  const receiver = findUser(req.receiver);
  return {
    ...req,
    sender_details: sender ? userPublicShape(sender) : null,
    receiver_details: receiver ? userPublicShape(receiver) : null,
  };
}

export const collaborationService = {
  getSellers: async () => {
    const current = requireCurrentUser();
    const sellers = getUsers()
      .filter((u) => u.role === "SELLER" && u.id !== current.id)
      .map(userPublicShape);
    return delay(sellers);
  },

  getRequests: async () => {
    const current = requireCurrentUser();
    const requests = dbGetRequests()
      .filter((r) => r.sender === current.id || r.receiver === current.id)
      .map(withSellerDetails);
    return delay(requests);
  },

  sendRequest: async (receiverId: number) => {
    const current = requireCurrentUser();
    const requests = dbGetRequests();
    const already = requests.find(
      (r) =>
        (r.sender === current.id && r.receiver === receiverId) ||
        (r.sender === receiverId && r.receiver === current.id)
    );
    if (already) apiError({ detail: "Une demande existe déjà avec ce vendeur." });

    const newRequest = {
      id: nextIntId(requests, 100),
      sender: current.id,
      receiver: receiverId,
      status: "PENDING" as const,
      created_at: new Date().toISOString(),
    };
    dbSetRequests([...requests, newRequest]);
    return delay(withSellerDetails(newRequest), 400);
  },

  acceptRequest: async (requestId: number) => {
    const current = requireCurrentUser();
    const requests = dbGetRequests();
    const target = requests.find((r) => r.id === requestId && r.receiver === current.id);
    if (!target) apiError({ detail: "Demande introuvable." }, 404);
    const updated = requests.map((r) => (r.id === requestId ? { ...r, status: "ACCEPTED" as const } : r));
    dbSetRequests(updated);
    return delay(withSellerDetails(updated.find((r) => r.id === requestId)!));
  },

  rejectRequest: async (requestId: number) => {
    const current = requireCurrentUser();
    const requests = dbGetRequests();
    const target = requests.find((r) => r.id === requestId && r.receiver === current.id);
    if (!target) apiError({ detail: "Demande introuvable." }, 404);
    const updated = requests.map((r) => (r.id === requestId ? { ...r, status: "REJECTED" as const } : r));
    dbSetRequests(updated);
    return delay(withSellerDetails(updated.find((r) => r.id === requestId)!));
  },
};

// ── logisticsService ──────────────────────────────────────────────────

export const logisticsService = {
  getTransporters: async () => {
    const transporters = getUsers()
      .filter((u) => u.role === "TRANSPORTER")
      .map((u) => ({
        id: u.id,
        first_name: u.first_name,
        last_name: u.last_name,
        business_name: u.profile.business_name,
        vehicle_type: u.profile.vehicle_type,
        coverage_area: u.profile.coverage_area,
      }));
    return delay(transporters, 300);
  },

  getShipments: async () => {
    const current = requireCurrentUser();
    const all = dbGetShipments();
    const mine =
      current.role === "TRANSPORTER"
        ? all.filter((s) => s.transporter === current.id)
        : all.filter((s) => s.requester === current.id);
    return delay(mine.slice().sort((a, b) => b.id - a.id));
  },

  requestShipment: async (data: any) => {
    const current = requireCurrentUser();
    const shipments = dbGetShipments();
    const newShipment = {
      id: nextIntId(shipments, 600),
      order: data.order ?? null,
      shipment_type: data.shipment_type || "PERSONAL",
      requester: current.id,
      client_name: `${current.first_name} ${current.last_name}`.trim() || current.email,
      client_email: current.email,
      transporter: data.transporter,
      description: data.description,
      origin: data.origin,
      destination: data.destination,
      weight: parseFloat(data.weight) || 0,
      status: "REQUESTED" as const,
      verification_code: Math.random().toString(36).slice(2, 8).toUpperCase(),
      created_at: new Date().toISOString(),
    };
    dbSetShipments([...shipments, newShipment]);
    return delay(newShipment, 600);
  },

  updateShipmentStatus: async (id: number, status: string, verification_code: string | null = null) => {
    const current = requireCurrentUser();
    const shipments = dbGetShipments();
    const target = shipments.find((s) => s.id === id && s.transporter === current.id);
    if (!target) apiError({ error: "Expédition introuvable." }, 404);

    if (status === "DELIVERED") {
      if (!verification_code || verification_code.toUpperCase() !== target!.verification_code.toUpperCase()) {
        await delay(null, 400);
        apiError({ error: "Code de vérification invalide." });
      }
    }

    const updatedShipments = shipments.map((s) => (s.id === id ? { ...s, status: status as any } : s));
    dbSetShipments(updatedShipments);

    // Répercute le changement de statut sur la commande liée, si applicable
    if (target!.order) {
      const orders = dbGetOrders();
      const linkedOrder = orders.find((o) => o.id === target!.order);
      if (linkedOrder) {
        let nextOrderStatus = linkedOrder.status;
        if (status === "DELIVERED") nextOrderStatus = "DELIVERED";
        else if (["ACCEPTED", "PICKED_UP", "IN_TRANSIT"].includes(status) && linkedOrder.status === "PAID") {
          nextOrderStatus = "SHIPPED";
        }
        dbSetOrders(orders.map((o) => (o.id === linkedOrder.id ? { ...o, status: nextOrderStatus } : o)));
      }
    }

    return delay(updatedShipments.find((s) => s.id === id), 400);
  },

  getRoutes: async () => {
    const current = requireCurrentUser();
    const routes = dbGetRoutes().filter((r) => r.transporter === current.id);
    return delay(routes.slice().sort((a, b) => b.id - a.id));
  },

  createRoute: async (data: any) => {
    const current = requireCurrentUser();
    const routes = dbGetRoutes();
    const pricing_mode = data.pricing_mode === "per_category" ? "per_category" : "flat";

    const category_prices = Array.isArray(data.category_prices)
      ? data.category_prices
          .filter((c: any) => c.category && c.price_per_kg !== "" && c.price_per_kg !== undefined)
          .map((c: any) => ({ category: c.category, price_per_kg: parseFloat(c.price_per_kg) || 0 }))
      : [];

    const product_exceptions = Array.isArray(data.product_exceptions)
      ? data.product_exceptions
          .filter((p: any) => p.product_id && p.price_per_kg !== "" && p.price_per_kg !== undefined)
          .map((p: any) => ({
            product_id: Number(p.product_id),
            product_name: p.product_name || "",
            price_per_kg: parseFloat(p.price_per_kg) || 0,
          }))
      : [];

    // En mode "par catégorie", le prix par défaut sert de secours pour une
    // catégorie non explicitement tarifée : on prend la moyenne des prix
    // renseignés si le transporteur n'a pas fourni de valeur par défaut.
    const fallbackPrice =
      data.price_per_kg !== undefined && data.price_per_kg !== ""
        ? parseFloat(data.price_per_kg) || 0
        : category_prices.length
        ? Math.round((category_prices.reduce((s: number, c: any) => s + c.price_per_kg, 0) / category_prices.length) * 100) / 100
        : 0;

    const newRoute: MockRoute = {
      id: nextIntId(routes, 300),
      transporter: current.id,
      origin: data.origin,
      destination: data.destination,
      frequency: data.frequency || "Quotidien",
      pricing_mode,
      price_per_kg: fallbackPrice,
      category_prices: pricing_mode === "per_category" ? category_prices : [],
      product_exceptions,
      created_at: new Date().toISOString(),
    };
    dbSetRoutes([...routes, newRoute]);
    return delay(newRoute, 400);
  },

  deleteRoute: async (id: number) => {
    const current = requireCurrentUser();
    const routes = dbGetRoutes();
    const existing = routes.find((r) => r.id === id);
    if (!existing || existing.transporter !== current.id) apiError({ detail: "Itinéraire introuvable." }, 404);
    dbSetRoutes(routes.filter((r) => r.id !== id));
    return delay(undefined, 300);
  },
};

// Compat : plus aucun composant n'utilise l'export par défaut,
// mais on le conserve pour compatibilité ascendante avec un futur
// vrai client axios.
export default {
  authService,
  orderService,
  productService,
  collaborationService,
  logisticsService,
};
