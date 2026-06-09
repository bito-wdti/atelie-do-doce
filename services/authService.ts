import { request } from './httpClient';

export const authApi = {
  async login(password: string) {
    const data = await request<{ token: string; message: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    });
    localStorage.setItem('adminToken', data.token);
    localStorage.setItem('isAdminAuthenticated', 'true');
    return data;
  },

  verify() {
    return request<{ valid: boolean; role: string }>('/auth/verify', { method: 'POST' });
  },

  logout() {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('isAdminAuthenticated');
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem('adminToken'));
  },
};
