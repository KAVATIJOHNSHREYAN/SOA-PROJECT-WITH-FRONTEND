import React from 'react';
import { FiTrendingUp } from 'react-icons/fi';
import '../../styles/dashboard.css';

function StatCard({ icon, label, value, color, trend }) {
  const accentColor = color || 'var(--primary)';

  return (
    <div className="stat-card">
      <div className="stat-card-header">
        <div
          className="stat-icon"
          style={{
            color: accentColor,
            background: `linear-gradient(135deg, ${accentColor}18 0%, ${accentColor}08 100%)`,
            border: `1px solid ${accentColor}25`
          }}
        >
          {icon}
        </div>
        {trend && (
          <span className="stat-trend-badge">
            <FiTrendingUp /> {trend}
          </span>
        )}
      </div>

      <div className="stat-info">
        <span className="stat-value">{value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default StatCard;
