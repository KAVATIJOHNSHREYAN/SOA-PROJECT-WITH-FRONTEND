import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiSave, FiUpload, FiCamera } from 'react-icons/fi';
import profileService from '../../services/profileService';
import { useAuth } from '../../context/AuthContext';
import { getAvatarUrl, handleAvatarError } from '../../utils/avatarUtils';
import '../../styles/forms.css';

function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: '', email: '' });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profileService.getProfile().then(res => {
      setForm({ fullName: res.data.fullName || '', email: res.data.email || '' });
      setAvatarUrl(res.data.avatarUrl || null);
      setLoading(false);
    }).catch(() => { setLoading(false); toast.error('Failed to load profile'); });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await profileService.updateProfile(form);
      if (updateUser) {
        updateUser({ fullName: form.fullName, email: form.email });
      }
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Immediately display local preview so user sees chosen photo with 0ms delay
    const previewUrl = URL.createObjectURL(file);
    setAvatarUrl(previewUrl);

    try {
      const res = await profileService.uploadAvatar(file);
      const serverUrl = res.data?.avatarUrl || res.avatarUrl;
      if (serverUrl) {
        setAvatarUrl(serverUrl);
        if (updateUser) {
          updateUser({ avatarUrl: serverUrl });
        }
      }
      toast.success('Avatar updated successfully');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Avatar upload failed');
    } finally {
      e.target.value = '';
    }
  };

  if (loading) return <div className="page-loader">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title"><FiUser /> My Profile</h2>
      </div>
      <div style={{
        maxWidth: 520,
        background: 'linear-gradient(145deg, #0d1a33 0%, #091326 100%)',
        border: '1px solid rgba(56, 189, 248, 0.22)',
        borderRadius: 16,
        padding: 32,
        boxShadow: '0 12px 36px rgba(3, 10, 26, 0.55)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: 28, position: 'relative' }}>
          <div style={{
            position: 'relative',
            width: 104,
            height: 104,
            borderRadius: '50%',
            margin: '0 auto 16px',
            border: '3px solid #38bdf8',
            boxShadow: '0 0 24px rgba(56, 189, 248, 0.45)',
            background: '#091326',
            overflow: 'hidden'
          }}>
            <img
              src={getAvatarUrl(avatarUrl, user)}
              alt="User Portrait"
              onError={(e) => handleAvatarError(e, user)}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
          <div>
            <label className="btn btn-outline" style={{
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              fontWeight: 600,
              padding: '8px 18px',
              borderRadius: 30,
              border: '1px solid rgba(56, 189, 248, 0.4)',
              background: 'rgba(14, 165, 233, 0.12)',
              color: '#38bdf8',
              boxShadow: '0 2px 8px rgba(14, 165, 233, 0.25)',
              transition: 'all 0.2s ease'
            }}>
              <FiCamera style={{ fontSize: '1.05rem' }} /> Upload Photo
              <input type="file" accept="image/*" onChange={handleAvatarUpload} style={{ display: 'none' }} />
            </label>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="entity-form">
          <div style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ color: '#93c5fd', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Username</label>
            <input className="form-input" value={user?.username || ''} disabled style={{ opacity: 0.85, cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ color: '#93c5fd', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Role</label>
            <input className="form-input" value={user?.role || ''} disabled style={{ opacity: 0.85, cursor: 'not-allowed' }} />
          </div>
          <div style={{ marginBottom: 18 }}>
            <label className="form-label" style={{ color: '#93c5fd', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Full Name</label>
            <input className="form-input" value={form.fullName} onChange={e => setForm({ ...form, fullName: e.target.value })} placeholder="Enter your full name" />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label className="form-label" style={{ color: '#93c5fd', fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 700 }}>Email Address</label>
            <input className="form-input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="user@company.com" />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '12px 20px', fontSize: '0.95rem' }}>
            <FiSave /> Save Changes
          </button>
        </form>
      </div>
    </div>
  );
}

export default ProfilePage;

