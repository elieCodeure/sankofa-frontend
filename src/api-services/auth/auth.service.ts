// src/api-services/auth/auth.service.ts

import apiClient from '@/api-services/apiClient';
import type { LoginRequest, AuthenticationResponse } from '@/models/auth';
import Cookies from 'js-cookie';

const BASE = '/accounts';
const COOKIE_OPTIONS = { secure: true, sameSite: 'strict' as const };

export const authService = {
  /** POST /api/accounts/login/ — Authentifie email + password */
  async login(email: string, password: string): Promise<AuthenticationResponse> {
    const response = await apiClient.post<AuthenticationResponse>(`${BASE}/login/`, { email, password });
    if (response.tokens) {
      apiClient.setTokens(response.tokens.access, response.tokens.refresh);
      Cookies.set('user', JSON.stringify(response.user), COOKIE_OPTIONS);
    }
    return response;
  },

  /** POST /api/accounts/register/ — Inscription */
  async register(userData: any): Promise<AuthenticationResponse> {
    // Si id_card est fourni comme File, on utilise FormData
    let body: any = userData;
    if (userData.id_card instanceof File) {
      body = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== undefined && userData[key] !== null) {
          body.append(key, userData[key]);
        }
      });
    }

    const response = await apiClient.post<AuthenticationResponse>(`${BASE}/register/`, body);
    if (response.tokens) {
      apiClient.setTokens(response.tokens.access, response.tokens.refresh);
      Cookies.set('user', JSON.stringify(response.user), COOKIE_OPTIONS);
    }
    return response;
  },

  /** GET user depuis les cookies */
  getCurrentUser() {
    const user = Cookies.get('user');
    return user ? JSON.parse(user) : null;
  },

  /** Déconnexion */
  logout() {
    apiClient.removeTokens();
    window.location.href = '/auth';
  },

  /** PATCH /api/accounts/current-user/ — Mise à jour profil */
  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.patch<any>(`${BASE}/current-user/`, data);
    if (response) {
      Cookies.set('user', JSON.stringify(response), COOKIE_OPTIONS);
    }
    return response;
  },

  /** PUT /api/accounts/change-password/ */
  changePassword(data: any): Promise<any> {
    return apiClient.put<any>(`${BASE}/change-password/`, data);
  }
};
