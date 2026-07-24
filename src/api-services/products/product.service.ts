import apiClient from '@/api-services/apiClient';

const BASE = '/products';

export interface Product {
  id: number;
  name_fr: string;
  name_en: string;
  description_fr: string;
  description_en: string;
  price: number;
  currency: string;
  stock: number;
  status: string;
  is_active: boolean;
  category: number;
  category_name?: string;
  country: number;
  country_name?: string;
  seller: number;
  image1?: string;
  image2?: string;
  image3?: string;
}

export const productService = {
  /** GET /api/products/ — Récupère tous les produits avec filtres optionnels */
  getProducts(params?: Record<string, string>): Promise<Product[]> {
    const qs = params ? new URLSearchParams(params).toString() : '';
    return apiClient.get<Product[]>(`${BASE}/${qs ? `?${qs}` : ''}`);
  },

  /** GET /api/products/{id}/ — Récupère un produit spécifique */
  getProduct(id: number | string): Promise<Product> {
    return apiClient.get<Product>(`${BASE}/${id}/`);
  },

  /** GET /api/products/?my_products=true — Récupère les produits du vendeur connecté */
  getSellerProducts(): Promise<Product[]> {
    return apiClient.get<Product[]>(`${BASE}/?my_products=true`);
  },

  /** POST /api/products/ — Création d'un produit (multipart/form-data) */
  createProduct(data: FormData | Partial<Product>): Promise<Product> {
    return apiClient.post<Product>(`${BASE}/`, data);
  },

  /** PATCH /api/products/{id}/ — Mise à jour partielle d'un produit */
  updateProduct(id: number, data: FormData | Partial<Product>): Promise<Product> {
    return apiClient.patch<Product>(`${BASE}/${id}/`, data);
  },

  /** DELETE /api/products/{id}/ — Suppression logique d'un produit */
  deleteProduct(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE}/${id}/`);
  },

  /** GET /api/products/categories/ — Récupère les catégories */
  getCategories(): Promise<any[]> {
    return apiClient.get<any[]>(`${BASE}/categories/`);
  },

  /** GET /api/products/countries/ — Récupère les pays */
  getCountries(): Promise<any[]> {
    return apiClient.get<any[]>(`${BASE}/countries/`);
  }
};
