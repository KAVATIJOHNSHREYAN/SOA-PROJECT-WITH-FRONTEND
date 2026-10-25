import React, { useState, useEffect } from 'react';
import FormField from '../../components/common/FormField';
import vehicleService from '../../services/vehicleService';
import tripService from '../../services/tripService';
import '../../styles/forms.css';

const CATEGORIES = ['FUEL', 'TOLL', 'MAINTENANCE', 'DRIVER_ALLOWANCE', 'OTHER'];

function ExpenseForm({ expense, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    category: expense?.category || 'FUEL',
    amount: expense?.amount || '',
    description: expense?.description || '',
    expenseDate: expense?.expenseDate || new Date().toISOString().slice(0, 10),
    tripId: expense?.tripId || '',
    vehicleId: expense?.vehicleId || '',
  });
  const [vehicles, setVehicles] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    vehicleService.getAll({ size: 100 })
      .then(res => setVehicles(res.data?.content || (Array.isArray(res.data) ? res.data : [])))
      .catch(() => {});
    tripService.getAll({ size: 100 })
      .then(res => setTrips(res.data?.content || (Array.isArray(res.data) ? res.data : [])))
      .catch(() => {});
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      tripId: form.tripId || null,
      vehicleId: form.vehicleId || null,
    });
  };

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <form onSubmit={handleSubmit} className="entity-form">
      <div className="form-grid">
        <FormField label="Category *">
          <select className="form-input" value={form.category} onChange={handleChange('category')}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>)}
          </select>
        </FormField>
        <FormField label="Amount (₹) *">
          <input className="form-input" type="number" step="0.01" min="0.01" value={form.amount} onChange={handleChange('amount')} required />
        </FormField>
        <FormField label="Vehicle">
          <select className="form-input" value={form.vehicleId} onChange={handleChange('vehicleId')}>
            <option value="">No vehicle linked</option>
            {vehicles.map(v => (
              <option key={v.id} value={v.id}>{v.vehicleNumber} ({v.type})</option>
            ))}
          </select>
        </FormField>
        <FormField label="Trip">
          <select className="form-input" value={form.tripId} onChange={handleChange('tripId')}>
            <option value="">No trip linked</option>
            {trips.map(t => (
              <option key={t.id} value={t.id}>
                {t.vehicleNumber || 'Trip'} — {t.routeOrigin || 'Start'} → {t.routeDestination || 'End'}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Date *">
          <input className="form-input" type="date" value={form.expenseDate} onChange={handleChange('expenseDate')} required />
        </FormField>
        <FormField label="Description">
          <textarea className="form-input form-textarea" value={form.description} onChange={handleChange('description')} placeholder="e.g. Scheduled oil change, brake pads..." />
        </FormField>
      </div>
      <div className="form-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn btn-primary">{expense ? 'Update' : 'Create'}</button>
      </div>
    </form>
  );
}

export default ExpenseForm;

