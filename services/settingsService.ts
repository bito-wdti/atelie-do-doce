import { request } from './httpClient';

export const settingsApi = {
  get() {
    return request<any>('/settings');
  },

  update(data: any) {
    return request<any>('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  uploadLogo(logoData: string) {
    return request<{ logo_url: string }>('/settings/logo', {
      method: 'POST',
      body: JSON.stringify({ logo_data: logoData }),
    });
  },
};
