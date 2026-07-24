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
  }
};
