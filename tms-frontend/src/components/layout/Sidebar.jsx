import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useIntl } from 'react-intl';
import {
  FiGrid, FiTruck, FiUsers, FiMap, FiNavigation, FiBookOpen, FiFileText, FiShield,
  FiDollarSign, FiBarChart2, FiActivity, FiLink, FiCreditCard, FiTarget, FiDroplet, FiTool
} from 'react-icons/fi';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarUtils';
import logoImg from '../../assets/logo.jpg';
import '../../styles/layout.css';

const navGroups = [
  {
    title: 'OPERATIONS',
    items: [
      { path: '/dashboard', labelId: 'nav.dashboard', icon: <FiGrid />, roles: ['ADMIN', 'DISPATCHER', 'DRIVER', 'CLIENT'] },
      { path: '/trips', labelId: 'nav.trips', icon: <FiNavigation />, roles: ['ADMIN', 'DISPATCHER', 'DRIVER', 'CLIENT'] },
      { path: '/bookings', labelId: 'nav.bookings', icon: <FiBookOpen />, roles: ['ADMIN', 'DISPATCHER', 'CLIENT'] },
      { path: '/routes', labelId: 'nav.routes', icon: <FiMap />, roles: ['ADMIN', 'DISPATCHER', 'DRIVER', 'CLIENT'] },
      { path: '/lrs', labelId: 'nav.lrs', icon: <FiFileText />, roles: ['ADMIN', 'DISPATCHER', 'DRIVER', 'CLIENT'] },
    ]
  },
  {
    title: 'FLEET & ASSETS',
    items: [
      { path: '/vehicles', labelId: 'nav.vehicles', icon: <FiTruck />, roles: ['ADMIN', 'DISPATCHER', 'DRIVER'] },
      { path: '/service-history', labelId: 'nav.serviceHistory', icon: <FiTool />, roles: ['ADMIN', 'DISPATCHER'] },
      { path: '/drivers', labelId: 'nav.drivers', icon: <FiUsers />, roles: ['ADMIN', 'DISPATCHER'] },
      { path: '/geofences', labelId: 'nav.geofences', icon: <FiTarget />, roles: ['ADMIN', 'DISPATCHER'] },
      { path: '/fuel-analytics', labelId: 'nav.fuelAnalytics', icon: <FiDroplet />, roles: ['ADMIN', 'DISPATCHER'] },
    ]
  },
  {
    title: 'FINANCE & BILLING',
    items: [
      { path: '/billing', labelId: 'nav.billing', icon: <FiCreditCard />, roles: ['ADMIN', 'DISPATCHER'] },
      { path: '/invoices', labelId: 'nav.invoices', icon: <FiFileText />, roles: ['ADMIN', 'DISPATCHER'] },
      { path: '/expenses', labelId: 'nav.expenses', icon: <FiDollarSign />, roles: ['ADMIN', 'DISPATCHER'] },
      { path: '/reports', labelId: 'nav.reports', icon: <FiBarChart2 />, roles: ['ADMIN', 'DISPATCHER'] },
    ]
  },
  {
    title: 'ADMINISTRATION',
    items: [
      { path: '/users', labelId: 'nav.users', icon: <FiShield />, roles: ['ADMIN'] },
      { path: '/audit-logs', labelId: 'nav.auditLogs', icon: <FiActivity />, roles: ['ADMIN'] },
      { path: '/webhooks', labelId: 'nav.webhooks', icon: <FiLink />, roles: ['ADMIN'] },
    ]
  }
];

function Sidebar() {
  const { user } = useAuth();
  const intl = useIntl();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logoImg} alt="TMS Enterprise Logistics" className="sidebar-brand-logo" />
        <div>
          <h2>{intl.formatMessage({ id: 'app.short' })}</h2>
          <span className="tag">Enterprise Logistics</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navGroups.map((group) => {
          const visibleItems = group.items.filter(
            (item) => !item.roles || item.roles.includes(user?.role)
          );
          if (visibleItems.length === 0) return null;

          return (
            <div key={group.title} className="sidebar-group">
              <div className="sidebar-group-title">{group.title}</div>
              <div className="sidebar-group-items">
                {visibleItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                  >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{intl.formatMessage({ id: item.labelId })}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user-pill">
          <div className="sidebar-avatar">
            <img
              src={getAvatarUrl(user?.avatarUrl, user)}
              alt="User"
              onError={(e) => handleAvatarError(e, user)}
              className="sidebar-avatar-img"
            />
          </div>
          <div>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc', lineHeight: 1.2 }}>
              {user?.username || 'User'}
            </div>
            <span className="role-badge" style={{ marginTop: '3px' }}>{user?.role}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
