import api from '../api/axios';

const billingService = {
  getInvoices: (params = {}) => api.get('/invoices', { params }),

  getInvoiceById: (id) => api.get(`/invoices/${id}`),

  createInvoice: (data) => api.post('/invoices', data),

  generateFromTrip: (tripId) => api.post(`/invoices/generate/${tripId}`),

  updateStatus: (id, status) => api.patch(`/invoices/${id}/status`, { status }),

  downloadPdf: (id) => api.get(`/invoices/${id}/pdf`, { responseType: 'blob' }),

  deleteInvoice: (id) => api.delete(`/invoices/${id}`),

  getBillableTrips: (params = {}) => api.get('/trips', { params }),

  getExpenseSummary: (params = {}) => api.get('/expenses/summary', { params }),
};

export default billingService;
