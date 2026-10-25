import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  FiTool,
  FiPlus,
  FiFilter,
  FiChevronLeft,
  FiChevronRight,
  FiDollarSign,
  FiCheckCircle,
  FiClock,
  FiTruck,
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import serviceHistoryService from '../../services/serviceHistoryService';
import vehicleService from '../../services/vehicleService';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import FormField from '../../components/common/FormField';
import StatCard from '../../components/stats/StatCard';
import StatusBadge from '../../components/common/StatusBadge';
import '../../styles/dashboard.css';
import '../../styles/forms.css';
import '../../styles/components.css';

const SERVICE_TYPES = [
  'Routine Maintenance',
  'Oil & Filter Change',
  'Brake & Suspension Inspection',
  'Tire Replacement & Alignment',
  'Engine & Powertrain Tune-up',
  'Battery & Electrical Check',
  'Annual Safety Inspection',
  'Air Conditioning & Cooling',
  'Emergency Roadside Repair',
];

function ServiceRecordForm({ record, onSubmit, onCancel, defaultVehicleId }) {
  const [form, setForm] = useState({
    vehicleId: record?.vehicleId || defaultVehicleId || '',
    serviceType: record?.serviceType || 'Routine Maintenance',
    amount: record?.amount || '',
    expenseDate: record?.expenseDate || new Date().toISOString().slice(0, 10),
    serviceProvider: record?.serviceProvider || '',
    odometer: record?.odometer || '',
    notes: record?.description || '',
    status: record?.status || 'COMPLETED',
  });
  const [vehicles, setVehicles] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    vehicleService
      .getAll({ size: 100 })
      .then((res) => {
        setVehicles(res.data?.content || (Array.isArray(res.data) ? res.data : []));
      })
      .catch(() => {});
  }, []);

  const validate = () => {
    const errs = {};
    if (!form.vehicleId) errs.vehicleId = 'Please select a vehicle';
    if (!form.amount || Number(form.amount) <= 0) errs.amount = 'Valid amount is required';
    if (!form.expenseDate) errs.expenseDate = 'Service date is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const fullDescription = [
      form.serviceType,
      form.serviceProvider ? `Provider: ${form.serviceProvider}` : null,
      form.odometer ? `Odometer: ${form.odometer} km` : null,
      form.notes ? `Notes: ${form.notes}` : null,
      `[Status: ${form.status}]`,
    ]
      .filter(Boolean)
      .join(' | ');

    onSubmit({
      vehicleId: form.vehicleId,
      amount: parseFloat(form.amount),
      expenseDate: form.expenseDate,
      description: fullDescription,
    });
  };

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-grid">
        <FormField label="Vehicle *" error={errors.vehicleId}>
          <select
            className="form-input"
            value={form.vehicleId}
            onChange={handleChange('vehicleId')}
          >
            <option value="">Select vehicle</option>
            {vehicles.map((v) => (
              <option key={v.id} value={v.id}>
                {v.vehicleNumber} ({v.type})
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Service Type *">
          <select
            className="form-input"
            value={form.serviceType}
            onChange={handleChange('serviceType')}
          >
            {SERVICE_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label="Service Cost (₹) *" error={errors.amount}>
          <input
            className="form-input"
            type="number"
            step="0.01"
            min="0.01"
            placeholder="0.00"
            value={form.amount}
            onChange={handleChange('amount')}
          />
        </FormField>

        <FormField label="Service Date *" error={errors.expenseDate}>
          <input
            className="form-input"
            type="date"
            value={form.expenseDate}
            onChange={handleChange('expenseDate')}
          />
        </FormField>

        <FormField label="Service Center / Provider">
          <input
            className="form-input"
            placeholder="e.g. Metro Fleet Service Center"
            value={form.serviceProvider}
            onChange={handleChange('serviceProvider')}
          />
        </FormField>

        <FormField label="Odometer Reading (km)">
          <input
            className="form-input"
            type="number"
            placeholder="e.g. 45200"
            value={form.odometer}
            onChange={handleChange('odometer')}
          />
        </FormField>

        <FormField label="Service Status">
          <select
            className="form-input"
            value={form.status}
            onChange={handleChange('status')}
          >
            <option value="COMPLETED">Completed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="SCHEDULED">Scheduled</option>
          </select>
        </FormField>

        <FormField label="Technician Notes / Work Details">
          <textarea
            className="form-input form-textarea"
            rows="2"
            placeholder="Replaced brake pads, synthetic oil 5W-40, air filter..."
            value={form.notes}
            onChange={handleChange('notes')}
          />
        </FormField>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn btn-primary">
          {record ? 'Update Service Record' : 'Log Service Record'}
        </button>
      </div>
    </form>
  );
}

function ServiceHistoryList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlVehicleNumber = searchParams.get('vehicleNumber') || '';
  const urlVehicleId = searchParams.get('vehicleId') || '';

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const [vehicles, setVehicles] = useState([]);
  const [filters, setFilters] = useState({
    vehicleId: urlVehicleId,
    from: '',
    to: '',
    searchTerm: urlVehicleNumber,
  });
  const [showFilters, setShowFilters] = useState(Boolean(urlVehicleId || urlVehicleNumber));

  useEffect(() => {
    vehicleService
      .getAll({ size: 100 })
      .then((res) => setVehicles(res.data?.content || (Array.isArray(res.data) ? res.data : [])))
      .catch(() => {});
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, size: pageSize };
      if (filters.from) params.from = filters.from;
      if (filters.to) params.to = filters.to;

      const res = await serviceHistoryService.getServiceRecords(params);
      let items = res.data?.content || (Array.isArray(res.data) ? res.data : []);

      if (filters.vehicleId) {
        items = items.filter((r) => r.vehicleId === filters.vehicleId);
      }
      if (filters.searchTerm.trim()) {
        const term = filters.searchTerm.trim().toLowerCase();
        items = items.filter(
          (r) =>
            (r.vehicleNumber && r.vehicleNumber.toLowerCase().includes(term)) ||
            (r.description && r.description.toLowerCase().includes(term))
        );
      }

      setRecords(items);
      setTotalPages(res.data?.totalPages || 1);
      setTotalElements(res.data?.totalElements || items.length);
    } catch {
      toast.error('Failed to load vehicle service history');
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = () => {
    setEditRecord(null);
    setModalOpen(true);
  };

  const handleEdit = (record) => {
    setEditRecord(record);
    setModalOpen(true);
  };

  const handleSubmit = async (data) => {
    try {
      if (editRecord) {
        await serviceHistoryService.updateServiceRecord(editRecord.id, data);
        toast.success('Service record updated');
      } else {
        await serviceHistoryService.createServiceRecord(data);
        toast.success('Service record logged successfully');
      }
      setModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async () => {
    try {
      await serviceHistoryService.deleteServiceRecord(deleteTarget.id);
      toast.success('Service record deleted');
      setDeleteTarget(null);
      loadData();
    } catch {
      toast.error('Failed to delete service record');
    }
  };

  const parseServiceStatus = (desc) => {
    if (!desc) return 'COMPLETED';
    if (desc.includes('[Status: SCHEDULED]')) return 'SCHEDULED';
    if (desc.includes('[Status: IN_PROGRESS]')) return 'IN_PROGRESS';
    return 'COMPLETED';
  };

  const cleanDescription = (desc) => {
    if (!desc) return 'Maintenance Service';
    return desc.replace(/\[Status: [^\]]+\]/g, '').trim();
  };

  const totalCost = records.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const completedCount = records.filter((r) => parseServiceStatus(r.description) === 'COMPLETED').length;
  const inProgressCount = records.length - completedCount;

  const columns = [
    {
      key: 'expenseDate',
      label: 'Service Date',
      render: (v) => (v ? new Date(v).toLocaleDateString() : '—'),
    },
    {
      key: 'vehicleNumber',
      label: 'Vehicle Number',
      render: (v) => <strong>{v || 'Unassigned'}</strong>,
    },
    {
      key: 'description',
      label: 'Service Details',
      render: (v) => cleanDescription(v),
    },
    {
      key: 'amount',
      label: 'Cost',
      render: (v) => `₹${Number(v || 0).toLocaleString()}`,
    },
    {
      key: 'status',
      label: 'Status',
      render: (_, row) => {
        const st = parseServiceStatus(row.description);
        return <StatusBadge status={st} />;
      },
    },
  ];

  const clearFilters = () => {
    setFilters({ vehicleId: '', from: '', to: '', searchTerm: '' });
    setSearchParams({});
    setPage(0);
  };

  const hasActiveFilters = Boolean(
    filters.vehicleId || filters.from || filters.to || filters.searchTerm
  );

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">
          <FiTool style={{ marginRight: 8, color: 'var(--primary)' }} /> Vehicle Service History
        </h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className={`btn ${showFilters ? 'btn-secondary' : 'btn-outline'}`}
            onClick={() => setShowFilters(!showFilters)}
          >
            <FiFilter /> Filters {hasActiveFilters && <span className="filter-dot" />}
          </button>
          <button className="btn btn-primary" onClick={handleCreate}>
            <FiPlus /> Log Service Record
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 20 }}>
        <StatCard
          icon={<FiTool />}
          label="Total Service Records"
          value={records.length}
          color="#1a237e"
        />
        <StatCard
          icon={<FiDollarSign />}
          label="Total Maintenance Spend"
          value={`₹${totalCost.toLocaleString()}`}
          color="#d32f2f"
        />
        <StatCard
          icon={<FiCheckCircle />}
          label="Completed Services"
          value={completedCount}
          color="#388e3c"
        />
        <StatCard
          icon={<FiClock />}
          label="Active / Scheduled"
          value={inProgressCount}
          color="#f57c00"
        />
      </div>

      {showFilters && (
        <div className="filter-bar" style={{ marginBottom: 16 }}>
          <div className="filter-group">
            <label className="filter-label">Filter by Vehicle</label>
            <select
              className="form-input filter-input"
              value={filters.vehicleId}
              onChange={(e) => {
                setFilters({ ...filters, vehicleId: e.target.value });
                setPage(0);
              }}
            >
              <option value="">All Vehicles</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vehicleNumber} ({v.type})
                </option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <label className="filter-label">From Date</label>
            <input
              type="date"
              className="form-input filter-input"
              value={filters.from}
              onChange={(e) => {
                setFilters({ ...filters, from: e.target.value });
                setPage(0);
              }}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">To Date</label>
            <input
              type="date"
              className="form-input filter-input"
              value={filters.to}
              onChange={(e) => {
                setFilters({ ...filters, to: e.target.value });
                setPage(0);
              }}
            />
          </div>
          <div className="filter-group">
            <label className="filter-label">Search Keyword</label>
            <input
              className="form-input filter-input"
              placeholder="e.g. oil, brake, tire..."
              value={filters.searchTerm}
              onChange={(e) => {
                setFilters({ ...filters, searchTerm: e.target.value });
                setPage(0);
              }}
            />
          </div>
          {hasActiveFilters && (
            <button
              className="btn btn-link"
              onClick={clearFilters}
              style={{ alignSelf: 'flex-end' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      {loading && records.length === 0 && !hasActiveFilters ? (
        <div className="page-loader">Loading service history...</div>
      ) : (
        <DataTable
          columns={columns}
          data={records}
          onEdit={handleEdit}
          onDelete={(row) => setDeleteTarget(row)}
        />
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
            <FiChevronLeft />
          </button>
          <span>
            Page {page + 1} of {totalPages} ({totalElements} total)
          </span>
          <button disabled={page >= totalPages - 1} onClick={() => setPage((p) => p + 1)}>
            <FiChevronRight />
          </button>
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editRecord ? 'Edit Service Record' : 'Log Maintenance & Service Record'}
      >
        <ServiceRecordForm
          record={editRecord}
          defaultVehicleId={filters.vehicleId}
          onSubmit={handleSubmit}
          onCancel={() => setModalOpen(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Service Record"
        message={`Delete service record for vehicle ${deleteTarget?.vehicleNumber || ''}?`}
      />
    </div>
  );
}

export default ServiceHistoryList;
