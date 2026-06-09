const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const REQUEST_TIMEOUT_MS = 15000;

export type QueryValue = string | number | boolean | null | undefined;

export function queryString(params: Record<string, QueryValue> = {}) {
  const qs = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      qs.set(key, String(value));
    }
  });
  const value = qs.toString();
  return value ? `?${value}` : '';
}

export async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('userToken') || localStorage.getItem('adminToken');
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers, signal: controller.signal });
  } catch (error) {
    if ((error as Error).name === 'AbortError') {
      throw new Error('O servidor demorou para responder. Tente novamente.');
    }
    throw new Error('Nao foi possivel conectar ao servidor. Verifique se o backend esta rodando.');
  } finally {
    window.clearTimeout(timeout);
  }

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('isAdminAuthenticated');
      if (path !== '/auth/login') localStorage.removeItem('adminToken');
    }
    const body = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(body.error || `Erro ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
