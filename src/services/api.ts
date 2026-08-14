/**
 * ────────────────────────────────────────────────────────────────
 * services/api.ts — VERSION CONNECTÉE (Django Backend)
 * ────────────────────────────────────────────────────────────────
 * Redirige les appels API vers le dossier api-services qui
 * implémente les requêtes HTTP réelles (Axios) vers le backend.
 * ────────────────────────────────────────────────────────────────
 */

export * from "@/api-services";
export { default as default } from "@/api-services/apiClient";
