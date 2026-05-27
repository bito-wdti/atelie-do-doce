import { queryString, request } from './httpClient';

export const productsApi = {
  list(params: { category?: string; search?: string; status?: string } = {}) {
    return request<any[]>(`/products${queryString(params)}`);
  },

  async categories() {
    const categories = await request<string[]>('/products/categories');
    return categories.map((name, index) => ({
      id: index + 1,
      name,
      slug: name,
      order_index: index + 1,
    }));
  },

  create(data: any) {
    return request<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update(id: string | number, data: any) {
    return request<any>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  delete(id: string | number) {
    return request<{ message: string }>(`/products/${id}`, { method: 'DELETE' });
  },

  reorder(orderedIds: Array<string | number>) {
    return request<{ message: string }>('/products/reorder', {
      method: 'PATCH',
      body: JSON.stringify({ orderedIds }),
    });
  },
};
