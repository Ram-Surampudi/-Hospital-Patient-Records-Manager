import api from './api';

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};

export const patientService = {
  getAll: (params?: any) => api.get('/patients', { params }),
  getById: (id: string) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: string, data: any) => api.put(`/patients/${id}`, data),
  delete: (id: string) => api.delete(`/patients/${id}`),
  discharge: (id: string) => api.patch(`/patients/${id}/discharge`),
  assignDoctor: (patientId: string, doctorId: string) =>
    api.post('/patients/assign-doctor', { patientId, doctorId }),
  addMedicalRecord: (patientId: string, recordData: any) =>
    api.post('/patients/medical-record', { patientId, ...recordData }),
};

export const userService = {
  getAll: (params?: any) => api.get('/users', { params }),
  getById: (id: string) => api.get(`/users/${id}`),
  create: (data: any) => api.post('/users', data),
  update: (id: string, data: any) => api.put(`/users/${id}`, data),
  delete: (id: string) => api.delete(`/users/${id}`),
  toggleStatus: (id: string) => api.patch(`/users/${id}/toggle`),
  getDoctors: () => api.get('/users/doctors'),
};

export const chatService = {
  getConversations: () => api.get('/chat/conversations'),
  getMessages: (userId: string, patientId?: string) =>
    api.get('/chat/messages', { params: { userId, patientId } }),
  sendMessage: (data: any) => api.post('/chat/messages', data),
};
