/**
 * Configuration for Backend API Base URL
 * Supports web browsers, development servers, and native Capacitor iOS/Android environments.
 */

// Production API Base URL
export const API_BASE = 'https://api.noor-al-islam.app';

export function getApiBaseUrl(): string {
  // In development / Cloud Run preview environment, use relative path (same origin)
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname.includes('run.app') || (window.location.hostname === 'localhost' && window.location.port))
  ) {
    return '';
  }

  // If a custom API URL is provided via environment variables, prioritize it
  if (import.meta.env.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, '');
  }

  // Production API Base URL
  return API_BASE;
}

export function getApiEndpoint(path: string): string {
  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

