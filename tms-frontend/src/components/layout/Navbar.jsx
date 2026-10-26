import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nProvider';
import { useIntl } from 'react-intl';
import { FiLogOut, FiMoon, FiSun, FiGlobe, FiSearch, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarUtils';
import '../../styles/layout.css';

const LOCALES = [
  { code: 'en', label: 'English (EN)' },
  { code: 'hi', label: 'हिन्दी (HI)' },
];

function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const intl = useIntl();

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="workspace-badge" title="Active Logistics Network">
          <span className="workspace-icon"><FiLayers /></span>
          <span className="workspace-name">Bharat Logistics Hub</span>
          <span className="workspace-tag">Mumbai HQ</span>
        </div>

        <div className="navbar-search">
          <FiSearch className="navbar-search-icon" />
          <input
            type="text"
            className="navbar-search-input"
            placeholder="Search trips, vehicles, invoices..."
            aria-label="Search"
          />
          <kbd className="search-shortcut">⌘K</kbd>
        </div>
      </div>

      <div className="navbar-actions">
        <div className="locale-selector">
          <FiGlobe style={{ marginRight: 6, color: 'var(--gray-400)' }} />
          <select
            value={locale}
            onChange={(e) => setLocale(e.target.value)}
            className="locale-select"
            aria-label="Select language"
          >
            {LOCALES.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        </div>

        <NotificationBell />

        <button
          className="btn-theme-toggle"
          onClick={toggleTheme}
          title={theme === 'light' ? 'Switch to Dark mode' : 'Switch to Light mode'}
          aria-label="Toggle theme"
        >
          {theme === 'light' ? <FiMoon /> : <FiSun />}
        </button>

        <Link to="/profile" className="navbar-user" title="View Profile">
          <div className="navbar-user-avatar">
            <img
              src={getAvatarUrl(user?.avatarUrl, user)}
              alt="User Portrait"
              onError={(e) => handleAvatarError(e, user)}
              className="navbar-user-avatar-img"
            />
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">{user?.fullName || user?.username}</span>
            <span className="navbar-role-badge">{user?.role}</span>
          </div>
        </Link>

        <button className="btn-logout" onClick={logout} title="Sign Out">
          <FiLogOut />
          <span>{intl.formatMessage({ id: 'btn.logout' })}</span>
        </button>
      </div>
    </header>
  );
}

export default Navbar;
