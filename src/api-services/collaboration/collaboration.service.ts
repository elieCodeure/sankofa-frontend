import apiClient from '@/api-services/apiClient';

const BASE = '/collaboration';

export interface Seller {
  id: number;
  first_name: string;
  last_name: string;
  business_name?: string;
  email: string;
  phone_number?: string;
}

export interface ConnectionRequest {
  id: number;
  sender: number;
  receiver: number;
  status: string;
  sender_details?: Seller;
  receiver_details?: Seller;
}

export const collaborationService = {
  /** GET /api/collaboration/sellers/ — Récupère les autres vendeurs de la plateforme */
  getSellers(): Promise<Seller[]> {
    return apiClient.get<Seller[]>(`${BASE}/sellers/`);
  },

  /** GET /api/collaboration/requests/ — Récupère les requêtes de collaboration */
  getRequests(): Promise<ConnectionRequest[]> {
    return apiClient.get<ConnectionRequest[]>(`${BASE}/requests/`);
  },

  /** POST /api/collaboration/requests/ — Envoie une invitation */
  sendRequest(receiverId: number): Promise<ConnectionRequest> {
    return apiClient.post<ConnectionRequest>(`${BASE}/requests/`, { receiver: receiverId });
  },

  /** POST /api/collaboration/requests/{id}/accept/ — Accepte une invitation */
  acceptRequest(requestId: number): Promise<{status: string}> {
    return apiClient.post<{status: string}>(`${BASE}/requests/${requestId}/accept/`);
  },

  /** POST /api/collaboration/requests/{id}/reject/ — Rejette une invitation */
  rejectRequest(requestId: number): Promise<{status: string}> {
    return apiClient.post<{status: string}>(`${BASE}/requests/${requestId}/reject/`);
  }
};
