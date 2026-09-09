const API_BASE = "/api";

export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem("freedomain_token");
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || data.message || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Auth
  register: (body) => apiRequest("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => apiRequest("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  getMe: () => apiRequest("/auth/me"),
  logout: () => apiRequest("/auth/logout", { method: "POST" }),

  // Domains
  searchDomain: (query, tld = "com") => apiRequest(`/domains/search?query=${encodeURIComponent(query)}&tld=${encodeURIComponent(tld)}`),

  // Subsidy
  getPublicPool: () => apiRequest("/subsidy/pool"),
  applySubsidy: (body) => apiRequest("/subsidy/apply", { method: "POST", body: JSON.stringify(body) }),
  getMyRequests: () => apiRequest("/subsidy/my-requests"),

  // User Domains
  getMyDomains: () => apiRequest("/user/domains/my-domains"),
  getDomainDetails: (id) => apiRequest(`/user/domains/${id}`),
  getDnsRecords: (id) => apiRequest(`/user/domains/${id}/dns`),
  addDnsRecord: (id, body) => apiRequest(`/user/domains/${id}/dns`, { method: "POST", body: JSON.stringify(body) }),
  deleteDnsRecord: (domainId, recordId) => apiRequest(`/user/domains/${domainId}/dns/${recordId}`, { method: "DELETE" }),
  updateNameservers: (id, body) => apiRequest(`/user/domains/${id}/nameservers`, { method: "PUT", body: JSON.stringify(body) }),

  // Admin
  getAdminOverview: () => apiRequest("/admin/overview"),
  getAdminRequests: (status = "all") => apiRequest(`/admin/requests?status=${status}`),
  approveRequest: (id, body = {}) => apiRequest(`/admin/requests/${id}/approve`, { method: "POST", body: JSON.stringify(body) }),
  rejectRequest: (id, body = {}) => apiRequest(`/admin/requests/${id}/reject`, { method: "POST", body: JSON.stringify(body) }),
  getAdminDomains: () => apiRequest("/admin/domains"),
  topUpBudget: (additionalGrantInr) => apiRequest("/admin/budget", { method: "POST", body: JSON.stringify({ additionalGrantInr }) }),
};
