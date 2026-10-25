import React from 'react';
import '../../styles/components.css';

const statusThemes = {
  // Success (Emerald Green)
  AVAILABLE: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  ACTIVE: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  COMPLETED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  CONFIRMED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  DELIVERED: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },
  PAID: { bg: '#ecfdf5', color: '#047857', border: '#a7f3d0' },

  // Warning / In-Progress (Amber)
  BUSY: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  IN_PROGRESS: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  IN_TRANSIT: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },
  PENDING: { bg: '#fffbeb', color: '#b45309', border: '#fde68a' },

  // Info / Scheduled (Indigo / Sky)
  PLANNED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  CREATED: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },
  SENT: { bg: '#eff6ff', color: '#1d4ed8', border: '#bfdbfe' },

  // Danger / Terminated (Crimson)
  CANCELLED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },
  FAILED: { bg: '#fef2f2', color: '#b91c1c', border: '#fecaca' },

  // Neutral (Slate)
  MAINTENANCE: { bg: '#f8fafc', color: '#475569', border: '#cbd5e1' },
  INACTIVE: { bg: '#f8fafc', color: '#64748b', border: '#cbd5e1' },
  DRAFT: { bg: '#f8fafc', color: '#475569', border: '#cbd5e1' },
};

function StatusBadge({ status }) {
  const theme = statusThemes[status] || { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
  return (
    <span
      className="status-badge"
      style={{
        backgroundColor: theme.bg,
        color: theme.color,
        borderColor: theme.border,
      }}
    >
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

export default StatusBadge;
