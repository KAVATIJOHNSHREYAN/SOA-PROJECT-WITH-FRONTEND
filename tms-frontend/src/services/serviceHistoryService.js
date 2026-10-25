import api from '../api/axios';

const serviceHistoryService = {
  getServiceRecords: (params = {}) =>
    api.get('/expenses', {
      params: {
        category: 'MAINTENANCE',
        ...params,
      },
    }),

  createServiceRecord: (data) =>
    api.post('/expenses', {
      ...data,
      category: 'MAINTENANCE',
    }),

  updateServiceRecord: (id, data) =>
    api.put(`/expenses/${id}`, {
      ...data,
      category: 'MAINTENANCE',
    }),

  deleteServiceRecord: (id) => api.delete(`/expenses/${id}`),

  getSummary: (from, to) =>
    api.get('/expenses/summary', { params: { from, to } }),
};

export default serviceHistoryService;
