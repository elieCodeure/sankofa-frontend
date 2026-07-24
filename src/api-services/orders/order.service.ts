import apiClient from '@/api-services/apiClient';

const BASE = '/orders';

export interface OrderItem {
  id: number;
  product_id?: number;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: string;
  total_price: number;
  shipping_address: string;
  phone_number: string;
  created_at: string;
  items: OrderItem[];
  shipping_delegated: boolean;
}

export const orderService = {
  /** GET /api/orders/list-create/ — Récupère les commandes de l'utilisateur courant */
  getOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>(`${BASE}/list-create/`);
  },

  /** POST /api/orders/list-create/ — Crée une nouvelle commande */
  createOrder(orderData: any): Promise<Order> {
    return apiClient.post<Order>(`${BASE}/list-create/`, orderData);
  },

  /** GET /api/orders/seller-orders/ — Récupère les commandes des clients pour les produits de ce vendeur */
  getSellerOrders(): Promise<Order[]> {
    return apiClient.get<Order[]>(`${BASE}/seller-orders/`);
  },

  /** PATCH /api/orders/list-create/:id/ — Confier l'expédition au vendeur */
  delegateShipping(orderId: number): Promise<Order> {
    return apiClient.patch<Order>(`${BASE}/list-create/${orderId}/`, { shipping_delegated: true });
  }
};
