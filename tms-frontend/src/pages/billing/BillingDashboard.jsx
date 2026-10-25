import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiCreditCard,
  FiDollarSign,
  FiDownload,
  FiPlus,
  FiZap,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiFileText,
  FiTruck,
  FiArrowRight,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import billingService from '../../services/billingService';
import tripService from '../../services/tripService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import StatCard from '../../components/stats/StatCard';
import InvoiceForm from '../invoices/InvoiceForm';
import '../../styles/dashboard.css';
import '../../styles/forms.css';
import '../../styles/components.css';

function BillingDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('invoices'); // 'invoices' | 'trips'
  const [invoices, setInvoices] = useState([]);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [generateModalOpen, setGenerateModalOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [invRes, tripRes] = await Promise.all([
        billingService.getInvoices({ page: 0, size: 50, status: statusFilter || undefined }),
        tripService.getAll({ page: 0, size: 50 }),
      ]);
      setInvoices(invRes.data?.content || (Array.isArray(invRes.data) ? invRes.data : []));
      setTrips(tripRes.data?.content || (Array.isArray(tripRes.data) ? tripRes.data : []));
    } catch {
      toast.error('Failed to load billing details');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Aggregate metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'PAID')
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const outstanding = invoices
    .filter((inv) => inv.status === 'SENT' || inv.status === 'DRAFT')
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const paidCount = invoices.filter((inv) => inv.status === 'PAID').length;

  const handleStatusChange = async (invoice, newStatus) => {
    try {
      await billingService.updateStatus(invoice.id, newStatus);
      toast.success(`Invoice marked as ${newStatus}`);
      loadData();
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleDownloadPdf = async (invoice) => {
    try {
      const res = await billingService.downloadPdf(invoice.id);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${invoice.invoiceNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('PDF download failed');
    }
  };

  const handleGenerateInvoice = async (tripId) => {
    try {
      await billingService.generateFromTrip(tripId);
      toast.success('Invoice generated from trip expenses!');
      setGenerateModalOpen(false);
      setSelectedTripId('');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invoice generation failed');
    }
  };

  const handleCreateInvoice = async (formData) => {
    try {
      await billingService.createInvoice(formData);
      toast.success('Invoice created successfully');
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Creation failed');
    }
  };

  const invoiceColumns = [
    { key: 'invoiceNumber', label: 'Invoice #' },
    { key: 'clientName', label: 'Client' },
    { key: 'tripVehicleNumber', label: 'Vehicle', render: (v) => v || '—' },
    {
      key: 'issuedDate',
      label: 'Issued',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      key: 'dueDate',
      label: 'Due Date',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (v) => `₹${Number(v || 0).toLocaleString()}`,
    },
    { key: 'status', label: 'Status', render: (v) => <StatusBadge status={v} /> },
  ];

  const tripColumns = [
    { key: 'vehicleNumber', label: 'Vehicle' },
    { key: 'driverName', label: 'Driver' },
    {
      key: 'routeOrigin',
      label: 'Route',
      render: (_, r) => (r.routeOrigin ? `${r.routeOrigin} → ${r.routeDestination}` : '—'),
    },
    {
      key: 'startTime',
      label: 'Start Date',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    { key: 'status', label: 'Trip Status', render: (v) => <StatusBadge status={v} /> },
  ];

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          <FiCreditCard style={{ marginRight: 8, color: 'var(--primary)' }} /> Billing & Invoicing Management
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline" onClick={() => setGenerateModalOpen(true)}>
            <FiZap /> Quick Bill Trip
          </button>
          <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
            <FiPlus /> Create Invoice
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard
          icon={<FiDollarSign />}
          label="Total Invoiced"
          value={`₹${totalInvoiced.toLocaleString()}`}
          color="#1a237e"
        />
        <StatCard
          icon={<FiCheckCircle />}
          label="Total Collected (Paid)"
          value={`₹${totalPaid.toLocaleString()}`}
          color="#2e7d32"
        />
        <StatCard
          icon={<FiClock />}
          label="Outstanding Receivables"
          value={`₹${outstanding.toLocaleString()}`}
          color="#e65100"
        />
        <StatCard
          icon={<FiFileText />}
          label="Paid Invoices"
          value={`${paidCount} of ${invoices.length}`}
          color="#0288d1"
        />
      </div>

      {/* Navigation tabs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, borderBottom: '1px solid var(--gray-200)', paddingBottom: 8 }}>
        <button
          className={`btn ${activeTab === 'invoices' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FiFileText /> Client Invoices ({invoices.length})
        </button>
        <button
          className={`btn ${activeTab === 'trips' ? 'btn-primary' : 'btn-outline'}`}
          onClick={() => setActiveTab('trips')}
        >
          <FiTruck /> Billable Trips ({trips.length})
        </button>
        <button
          className="btn btn-outline"
          style={{ marginLeft: 'auto' }}
          onClick={() => navigate('/invoices')}
        >
          Detailed Invoices View <FiArrowRight />
        </button>
      </div>

      {activeTab === 'invoices' ? (
        <div>
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Filter by Status:</label>
            <select
              className="form-input"
              style={{ width: 160 }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="DRAFT">DRAFT</option>
              <option value="SENT">SENT</option>
              <option value="PAID">PAID</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <DataTable
            columns={invoiceColumns}
            data={invoices}
            actions={(inv) => (
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  className="btn-icon"
                  onClick={() => handleDownloadPdf(inv)}
                  title="Download PDF"
                >
                  <FiDownload />
                </button>
                {inv.status === 'DRAFT' && (
                  <button
                    className="btn btn-sm btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    onClick={() => handleStatusChange(inv, 'SENT')}
                  >
                    Send
                  </button>
                )}
                {inv.status === 'SENT' && (
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                    onClick={() => handleStatusChange(inv, 'PAID')}
                  >
                    Mark Paid
                  </button>
                )}
              </div>
            )}
          />
        </div>
      ) : (
        <div>
          <p style={{ color: 'var(--gray-600)', marginBottom: 12, fontSize: '0.9rem' }}>
            Trips ready for customer billing. Click <strong>Generate Invoice</strong> to aggregate trip expenses into an official customer invoice.
          </p>
          <DataTable
            columns={tripColumns}
            data={trips}
            actions={(t) => (
              <button
                className="btn btn-sm btn-primary"
                style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                onClick={() => handleGenerateInvoice(t.id)}
              >
                <FiZap /> Generate Invoice
              </button>
            )}
          />
        </div>
      )}

      {/* Manual invoice modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Create Customer Invoice"
      >
        <InvoiceForm onSubmit={handleCreateInvoice} onCancel={() => setModalOpen(false)} />
      </Modal>

      {/* Quick bill from trip modal */}
      <Modal
        isOpen={generateModalOpen}
        onClose={() => setGenerateModalOpen(false)}
        title="Quick Bill Trip"
      >
        <div style={{ padding: '8px 0' }}>
          <p style={{ marginBottom: 16 }}>Select a trip to automatically aggregate all its expenses into a finalized invoice:</p>
          <select
            className="form-input"
            style={{ width: '100%', marginBottom: 20 }}
            value={selectedTripId}
            onChange={(e) => setSelectedTripId(e.target.value)}
          >
            <option value="">Select trip...</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.vehicleNumber} ({t.routeOrigin || 'Origin'} → {t.routeDestination || 'Destination'})
              </option>
            ))}
          </select>
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => setGenerateModalOpen(false)}>
              Cancel
            </button>
            <button
              className="btn btn-primary"
              disabled={!selectedTripId}
              onClick={() => handleGenerateInvoice(selectedTripId)}
            >
              Generate Invoice
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default BillingDashboard;
