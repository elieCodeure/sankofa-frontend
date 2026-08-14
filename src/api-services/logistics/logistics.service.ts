import apiClient from '@/api-services/apiClient';

const BASE = '/logistics';

export interface Transporter {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
  business_name?: string;
  vehicle_type?: string;
  coverage_area?: string;
  profile?: {
    business_name: string;
    vehicle_type: string;
    coverage_area: string;
    phone_number: string;
  }
}

export interface Shipment {
  id: number;
  status: string;
  verification_code?: string;
  order?: number;
  transporter: number;
  shipment_type: string;
  description: string;
  origin: string;
  destination: string;
  weight: number;
}

export interface Route {
  id: number;
  transporter: number;
  origin: string;
  destination: string;
  frequency?: string;
  price_per_kg: number;
  pricing_mode: string;
  category_prices: any[];
  product_exceptions: any[];
}

export const logisticsService = {
  /** GET /api/logistics/transporters/ — Récupère les transporteurs vérifiés */
  getTransporters(): Promise<Transporter[]> {
    return apiClient.get<Transporter[]>(`${BASE}/transporters/`);
  },

  /** POST /api/logistics/shipments/ — Fait une demande d'expédition */
  requestShipment(data: Partial<Shipment>): Promise<Shipment> {
    return apiClient.post<Shipment>(`${BASE}/shipments/`, data);
  },

  /** GET /api/logistics/shipments/ — Récupère les expéditions de l'utilisateur */
  getShipments(): Promise<Shipment[]> {
    return apiClient.get<Shipment[]>(`${BASE}/shipments/`);
  },

  /** POST /api/logistics/shipments/:id/update-status/ — Met à jour le statut d'une expédition */
  updateShipmentStatus(id: number, status: string, verification_code?: string): Promise<Shipment> {
    return apiClient.post<Shipment>(`${BASE}/shipments/${id}/update-status/`, { status, verification_code });
  },

  /** GET /api/logistics/routes/ — Récupère les itinéraires du transporteur */
  getRoutes(): Promise<Route[]> {
    return apiClient.get<Route[]>(`${BASE}/routes/`);
  },

  /** POST /api/logistics/routes/ — Crée un nouvel itinéraire */
  createRoute(data: any): Promise<Route> {
    return apiClient.post<Route>(`${BASE}/routes/`, data);
  },

  /** DELETE /api/logistics/routes/:id/ — Supprime un itinéraire */
  deleteRoute(id: number): Promise<void> {
    return apiClient.delete<void>(`${BASE}/routes/${id}/`);
  }
};
