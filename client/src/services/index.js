import api from './api';

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.post('/auth/logout'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
};

export const userService = {
  getUsers: (params) => api.get('/users', { params }),
  getUserById: (id) => api.get(`/users/${id}`),
  createUser: (data) => api.post('/users', data),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  updateStatus: (id, status) => api.patch(`/users/${id}/status`, { status }),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const profileService = {
  getProfiles: (params) => api.get('/profiles', { params }),
  getProfileById: (id) => api.get(`/profiles/${id}`),
  getMyProfile: () => api.get('/profiles/me'),
  updateProfile: (id, data) => api.put(`/profiles/${id}`, data),
};

export const journeyService = {
  getJourneys: (profileId, params) => api.get(`/journeys/${profileId}/events`, { params }),
  createJourney: (profileId, data) => api.post(`/journeys/${profileId}/events`, data),
  updateJourney: (id, data) => api.put(`/journeys/events/${id}`, data),
};

export const ticketService = {
  getTickets: (params) => api.get('/tickets', { params }),
  getTicketById: (id) => api.get(`/tickets/${id}`),
  getMessages: (id) => api.get(`/tickets/${id}/messages`),
  createTicket: (data) => api.post('/tickets', data),
  reply: (id, message) => api.post(`/tickets/${id}/reply`, { message }),
  escalate: (id) => api.post(`/tickets/${id}/escalate`),
  close: (id) => api.post(`/tickets/${id}/close`),
  assign: (id, agentId) => api.post(`/tickets/${id}/assign`, { agentId }),
};

export const campaignService = {
  getCampaigns: (params) => api.get('/campaigns', { params }),
  getCampaignById: (id) => api.get(`/campaigns/${id}`),
  createCampaign: (data) => api.post('/campaigns', data),
  updateCampaign: (id, data) => api.put(`/campaigns/${id}`, data),
  publish: (id) => api.post(`/campaigns/${id}/publish`),
  deleteCampaign: (id) => api.delete(`/campaigns/${id}`),
};

export const segmentService = {
  getSegments: (params) => api.get('/segments', { params }),
  getSegmentById: (id) => api.get(`/segments/${id}`),
  createSegment: (data) => api.post('/segments', data),
  updateSegment: (id, data) => api.put(`/segments/${id}`, data),
  deleteSegment: (id) => api.delete(`/segments/${id}`),
};

export const notificationService = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read'),
};

export const reportService = {
  getJourneyReport: () => api.get('/reports/journey'),
  getCampaignReport: () => api.get('/reports/campaign'),
  getTicketReport: () => api.get('/reports/tickets'),
  getAIReport: () => api.get('/reports/ai'),
};

export const aiService = {
  classifyIntent: (data) => api.post('/ai/intent', data),
  analyzeSentiment: (data) => api.post('/ai/sentiment', data),
  summarize: (ticketId) => api.post('/ai/summarize', { ticketId }),
  nextBestAction: (profileId) => api.post('/ai/recommend', { profileId }),
  draftReply: (ticketId) => api.post('/ai/draft', { ticketId }),
  reviewRecommendation: (id, decision, reason) => api.post(`/ai/recommendations/${id}/review`, { decision, reason }),
  getRecommendations: (params) => api.get('/ai/recommendations', { params }),
  getRuns: (params) => api.get('/ai/runs', { params }),
};

export const auditService = {
  getLogs: (params) => api.get('/audit', { params }),
  getLog: (id) => api.get(`/audit/${id}`),
};

export const courseService = {
  getCourses: (params) => api.get('/courses', { params }),
  createCourse: (data) => api.post('/courses', data),
  updateCourse: (id, data) => api.put(`/courses/${id}`, data),
  deleteCourse: (id) => api.delete(`/courses/${id}`),
};

export const settingsService = {
  getSettings: (params) => api.get('/settings', { params }),
  updateSetting: (key, value) => api.put(`/settings/${key}`, { value }),
};
