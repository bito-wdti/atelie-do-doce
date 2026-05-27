import { queryString, request } from './httpClient';

export const ordersApi = {
  create(payload: any) {
    return request<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  get(id: string | number, token?: string | null) {
    return request<any>(`/orders/${id}`, {
      headers: token ? { 'X-Order-Token': token } : {},
    });
  },

  list(params: { status?: string; search?: string; startDate?: string; endDate?: string; limit?: number } = {}) {
    return request<any[]>(`/orders${queryString(params)}`);
  },

  metrics(params: { startDate?: string; endDate?: string } = {}) {
    return request<any>(`/orders/metrics/summary${queryString(params)}`);
  },

  updateStatus(id: string | number, status: string) {
    return request<any>(`/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  delete(id: string | number) {
    return request<{ message: string }>(`/orders/${id}`, { method: 'DELETE' });
  },
};
