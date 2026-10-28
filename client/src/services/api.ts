// client/src/services/api.ts

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('saveplate_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    ...getAuthHeader(),
    ...(options.headers as Record<string, string> || {})
  };

  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }
    return data;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed with status ${response.status}`);
  }

  return (await response.text()) as unknown as T;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request<any>('/auth/me'),
  updateProfile: (profileData: any) => request<any>('/auth/profile', { method: 'PUT', body: JSON.stringify(profileData) }),

  // Listings
  getListings: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/listings${query ? `?${query}` : ''}`);
  },
  getListingById: (id: number | string) => request<any>(`/listings/${id}`),
  createListing: (data: FormData | any) => {
    const isFormData = data instanceof FormData;
    return request<any>('/listings', {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data)
    });
  },
  updateListing: (id: number | string, data: any) => request<any>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteListing: (id: number | string) => request<any>(`/listings/${id}`, { method: 'DELETE' }),
  getMyListings: () => request<any>('/listings/user/mine'),

  // Requests
  createRequest: (data: { listing_id: number; requested_quantity: number; recipient_notes?: string }) =>
    request<any>('/requests', { method: 'POST', body: JSON.stringify(data) }),
  getMyRequests: () => request<any>('/requests/mine'),
  getDonorRequests: (listingId?: number) =>
    request<any>(`/requests/donor${listingId ? `?listing_id=${listingId}` : ''}`),
  updateRequestStatus: (id: number | string, data: { status: string; donor_notes?: string }) =>
    request<any>(`/requests/${id}/status`, { method: 'PUT', body: JSON.stringify(data) }),

  // Public Content & Stats
  getStats: () => request<any>('/content/stats'),
  getFaqs: () => request<any>('/content/faqs'),
  getArticles: () => request<any>('/content/articles'),
  getAnnouncements: () => request<any>('/content/announcements'),
  submitContact: (data: { name: string; email: string; subject: string; message: string }) =>
    request<any>('/content/contact', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: () => request<any>('/content/notifications'),
  markNotificationRead: (id: number | string) => request<any>(`/content/notifications/${id}/read`, { method: 'PUT' }),

  // Admin Endpoints
  getAdminMetrics: () => request<any>('/admin/metrics'),
  getAdminUsers: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/admin/users${query ? `?${query}` : ''}`);
  },
  updateAdminUser: (id: number | string, data: any) => request<any>(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminListings: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/admin/listings${query ? `?${query}` : ''}`);
  },
  moderateListing: (id: number | string, data: { moderation_status?: string; moderation_notes?: string; status?: string }) =>
    request<any>(`/admin/listings/${id}/moderate`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminDonations: (params: Record<string, string> = {}) => {
    const query = new URLSearchParams(params).toString();
    return request<any>(`/admin/donations${query ? `?${query}` : ''}`);
  },
  getAdminOrganizations: () => request<any>('/admin/organizations'),
  verifyOrganization: (id: number | string, data: { verification_status: string; notes?: string }) =>
    request<any>(`/admin/organizations/${id}/verify`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminCategories: () => request<any>('/admin/categories'),
  createCategory: (data: any) => request<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: number | string, data: any) => request<any>(`/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  getAdminAnalytics: () => request<any>('/admin/analytics'),
  getAdminAuditLogs: () => request<any>('/admin/audit-logs'),
  getAdminContactMessages: () => request<any>('/admin/contact-messages'),
  updateAdminContactMessage: (id: number | string, data: any) => request<any>(`/admin/contact-messages/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  downloadCsvReport: () => {
    const token = localStorage.getItem('saveplate_token');
    window.open(`/api/admin/export/csv?token=${token}`, '_blank');
  }
};

