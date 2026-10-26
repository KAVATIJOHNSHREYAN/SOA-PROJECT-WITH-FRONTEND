import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useI18n } from '../i18n/I18nProvider';
import { 
  FiLock, 
  FiUser, 
  FiEye, 
  FiEyeOff, 
  FiGlobe, 
  FiMoon, 
  FiSun, 
  FiArrowRight, 
  FiCheckCircle 
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import api from '../api/axios';
import logoImg from '../assets/logo.jpg';
import '../styles/luxury-login.css';

const LOCALES = [
  { code: 'en', label: 'EN' },
  { code: 'hi', label: 'HI' },
];

function Login() {
  const [username, setUsername] = useState(() => localStorage.getItem('tms_remembered_username') || '');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('tms_remembered_username'));
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthProviders, setOauthProviders] = useState([]);

  const { login, error } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale } = useI18n();
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/auth/oauth2/providers')
      .then(res => setOauthProviders(res.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.warn('Please enter your credentials');
      return;
    }

    setIsSubmitting(true);
    try {
      if (rememberMe) {
        localStorage.setItem('tms_remembered_username', username.trim());
      } else {
        localStorage.removeItem('tms_remembered_username');
      }

      const success = await login(username.trim(), password);
      if (success) {
        toast.success('Welcome back to TMS Enterprise');
        navigate('/dashboard');
      } else {
        toast.error('Invalid enterprise credentials');
      }
    } catch (err) {
      toast.error('Authentication failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = (e) => {
    e.preventDefault();
    toast.info('Password reset instructions have been forwarded to your system administrator.', {
      icon: <FiCheckCircle style={{ color: '#38bdf8' }} />
    });
  };

  const handleFillDemo = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    toast.info(`Pre-filled credentials for ${user}`);
  };

  const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1';
  const backendBase = apiBaseUrl.replace('/api/v1', '');

  return (
    <motion.div 
      className="luxury-login-root"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
    >
      {/* Background Animated Ambient Glowing Mesh Spheres */}
      <motion.div 
        className="ambient-glow-sphere sphere-top"
        animate={{ 
          x: ['-50%', '-48%', '-52%', '-50%'], 
          y: [0, 15, -10, 0] 
        }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="ambient-glow-sphere sphere-left"
        animate={{ 
          x: [0, 30, -15, 0], 
          y: [0, -25, 20, 0] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div 
        className="ambient-glow-sphere sphere-right"
        animate={{ 
          x: [0, -35, 20, 0], 
          y: [0, 30, -15, 0] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Top Right Controls Capsule */}
      <header className="luxury-top-bar">
        <div className="luxury-controls-capsule">
          <div className="luxury-locale-wrapper">
            <FiGlobe />
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value)}
              className="luxury-locale-select"
              aria-label="Language Selector"
            >
              {LOCALES.map((l) => (
                <option key={l.code} value={l.code}>{l.label}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="luxury-theme-btn"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>
        </div>
      </header>

      {/* Centered Luxury Glass Card */}
      <main className="luxury-center-container">
        <div className="card-ambient-glow" />
        
        <motion.div 
          className="luxury-login-card"
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Logo Section — The Sole Hero Brand Identity */}
          <div className="luxury-brand-section">
            <motion.div 
              className="luxury-logo-frame"
              animate={{ scale: [1, 1.018, 1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img 
                src={logoImg} 
                alt="TMS - Transport Management System" 
                className="luxury-logo-img" 
              />
            </motion.div>
            <h1 className="luxury-title">TMS</h1>
            <p className="luxury-subtitle">Transport Management System</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="luxury-form" noValidate>
            {/* Username Field */}
            <div className="luxury-field-group">
              <label htmlFor="login-username" className="luxury-label">Enterprise Username</label>
              <div className={`luxury-input-wrapper ${focusedField === 'username' ? 'is-focused' : ''}`}>
                <FiUser className="luxury-input-icon" />
                <input
                  id="login-username"
                  type="text"
                  className="luxury-input"
                  placeholder="admin or username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocusedField('username')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="luxury-field-group">
              <label htmlFor="login-password" className="luxury-label">Security Password</label>
              <div className={`luxury-input-wrapper ${focusedField === 'password' ? 'is-focused' : ''}`}>
                <FiLock className="luxury-input-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="luxury-input"
                  placeholder="Enter security password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocusedField('password')}
                  onBlur={() => setFocusedField(null)}
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  className="luxury-password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Utilities: Remember Me & Forgot Password */}
            <div className="luxury-utilities-row">
              <label className="luxury-remember-label">
                <input
                  type="checkbox"
                  className="luxury-checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <a 
                href="#forgot" 
                onClick={handleForgotPassword} 
                className="luxury-forgot-link"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="luxury-error-banner"
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="luxury-submit-btn"
              disabled={isSubmitting}
              whileHover={{ scale: 1.018, y: -2 }}
              whileTap={{ scale: 0.985 }}
              transition={{ duration: 0.2 }}
            >
              {isSubmitting ? (
                <>
                  <div className="luxury-spinner" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <FiArrowRight style={{ fontSize: '1.1rem' }} />
                </>
              )}
            </motion.button>
          </form>

          {/* Enterprise OAuth Providers */}
          {oauthProviders.length > 0 && (
            <div className="luxury-oauth-container">
              <div className="luxury-oauth-divider">
                <span>or continue with</span>
              </div>
              <div className="luxury-oauth-grid">
                {oauthProviders.map((p) => (
                  <a 
                    key={p.name} 
                    href={`${backendBase}${p.url}`} 
                    className="luxury-oauth-btn"
                  >
                    {p.name === 'google' && (
                      <svg width="17" height="17" viewBox="0 0 24 24">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                    )}
                    {p.name === 'microsoft' && (
                      <svg width="17" height="17" viewBox="0 0 23 23">
                        <rect x="1" y="1" width="10" height="10" fill="#f25022"/>
                        <rect x="12" y="1" width="10" height="10" fill="#7fba00"/>
                        <rect x="1" y="12" width="10" height="10" fill="#00a4ef"/>
                        <rect x="12" y="12" width="10" height="10" fill="#ffb900"/>
                      </svg>
                    )}
                    <span>{p.label}</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Secondary Actions */}
          <div className="luxury-secondary-actions">
            <div className="luxury-secondary-links-row">
              <Link to="/register" className="luxury-secondary-link">
                Create Account
              </Link>
              <span className="luxury-link-dot">•</span>
              <a 
                href="#forgot" 
                onClick={handleForgotPassword} 
                className="luxury-secondary-link"
              >
                Forgot Password
              </a>
            </div>
            <div>
              <button 
                type="button" 
                className="luxury-demo-pill"
                onClick={() => handleFillDemo('admin', 'admin123')}
                title="Click to auto-fill Admin demo credentials"
              >
                <span>Demo Access:</span> <strong>admin / admin123</strong>
              </button>
            </div>
          </div>
        </motion.div>
      </main>

      {/* World-Class Footer */}
      <footer className="luxury-footer">
        <p>© 2026 Transport Management System</p>
        <p>Enterprise Fleet Logistics • High Security Gateway</p>
      </footer>
    </motion.div>
  );
}

export default Login;
