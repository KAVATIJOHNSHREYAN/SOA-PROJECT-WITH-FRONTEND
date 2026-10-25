import React, { useEffect, useState, useCallback } from 'react';
import {
  FiTruck, FiUsers, FiNavigation, FiFileText,
  FiCheckCircle, FiActivity, FiPackage, FiBookOpen
} from 'react-icons/fi';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import dashboardService from '../services/dashboardService';
import StatCard from '../components/stats/StatCard';
import StatusBadge from '../components/common/StatusBadge';
import '../styles/dashboard.css';

const REFRESH_INTERVAL = 30000;
const PIE_COLORS = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const [statsRes, trendsRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getTrends(),
      ]);
      setStats(statsRes.data);
      setTrends(trendsRes.data);
    } catch (err) {
      console.error('Failed to load dashboard metrics', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [loadStats]);

  if (loading) return <div className="page-loader">Loading telemetry data...</div>;
  if (!stats) return <div className="page-loader">Failed to load telemetry</div>;

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString();
  };

  const tripsByStatusData = trends?.tripsByStatus
    ? Object.entries(trends.tripsByStatus).map(([name, value]) => ({ name: name.replace(/_/g, ' '), value }))
    : [];

  const vehiclesByStatusData = trends?.vehiclesByStatus
    ? Object.entries(trends.vehiclesByStatus).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Operations Dashboard</h1>
          <p style={{ color: 'var(--gray-500)', fontSize: '0.85rem', marginTop: '4px' }}>
            Real-time logistics telemetry, fleet performance and consignment intelligence
          </p>
        </div>
        <span className="auto-refresh-label">Live Telemetry · Auto-syncs 30s</span>
      </div>

      <div className="stats-grid">
        <StatCard icon={<FiNavigation />} label="Total Trips" value={stats.totalTrips} color="#4f46e5" trend="+14% mo" />
        <StatCard icon={<FiActivity />} label="Active Trips" value={stats.activeTrips} color="#f59e0b" trend="Live in-transit" />
        <StatCard icon={<FiCheckCircle />} label="Completed Trips" value={stats.completedTrips} color="#10b981" trend="98.8% on-time" />
        <StatCard icon={<FiTruck />} label="Available Fleet" value={stats.availableVehicles} color="#0ea5e9" trend="Ready for dispatch" />
        <StatCard icon={<FiTruck />} label="Total Fleet" value={stats.totalVehicles} color="#6366f1" trend="Active assets" />
        <StatCard icon={<FiUsers />} label="Active Drivers" value={stats.activeDrivers} color="#10b981" trend="Assigned on duty" />
        <StatCard icon={<FiFileText />} label="Total LRs" value={stats.totalLrs} color="#ec4899" trend="Consignments" />
        <StatCard icon={<FiBookOpen />} label="Total Bookings" value={stats.totalBookings} color="#14b8a6" trend="Confirmed" />
      </div>

      {trends && (
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Trips Velocity (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={trends.tripTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="label" stroke="var(--gray-400)" />
                <YAxis allowDecimals={false} stroke="var(--gray-400)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }} />
                <Line type="monotone" dataKey="count" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5' }} activeDot={{ r: 6 }} name="Trips" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Bookings Volume (Last 7 Days)</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={trends.bookingTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis dataKey="label" stroke="var(--gray-400)" />
                <YAxis allowDecimals={false} stroke="var(--gray-400)" />
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 10, boxShadow: 'var(--shadow-lg)' }} />
                <Bar dataKey="count" fill="#0ea5e9" radius={[6, 6, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Trips Distribution by Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={tripsByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={4} label>
                  {tripsByStatusData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 10 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-card">
            <h3>Fleet Utilization by Status</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={vehiclesByStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} innerRadius={45} paddingAngle={4} label>
                  {vehiclesByStatusData.map((entry, i) => (
                    <Cell key={entry.name} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border-color)', borderRadius: 10 }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <div className="recent-section">
        <h3>Recent Trips</h3>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Driver</th>
                <th>Route</th>
                <th>Start Time</th>
                <th>LRs</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentTrips?.length > 0 ? stats.recentTrips.map((trip) => (
                <tr key={trip.id}>
                  <td>{trip.vehicleNumber}</td>
                  <td>{trip.driverName}</td>
                  <td>{trip.routeOrigin ? `${trip.routeOrigin} → ${trip.routeDestination}` : '—'}</td>
                  <td>{formatDate(trip.startTime)}</td>
                  <td>{trip.lorryReceipts?.length || 0}</td>
                  <td><StatusBadge status={trip.status} /></td>
                </tr>
              )) : (
                <tr><td colSpan="6" className="empty-row">No recent trips</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
