/**
 * Enterprise Avatar Resolution Utility
 * Resolves real picture avatars with fallbacks across the application.
 */

const BACKEND_BASE = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api/v1').replace(/\/api\/v1\/?$/, '');

// Curated high-resolution professional real human portraits
export const DEFAULT_ROLE_AVATARS = {
  ADMIN: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80', // Executive Director
  DISPATCHER: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80', // Operations Manager
  DRIVER: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80', // Fleet Operator
  CLIENT: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80', // Enterprise Client
  DEFAULT: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&h=300&q=80',
};

// User-specific real photos for known seeded users
export const USER_AVATARS = {
  admin: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&h=300&q=80',
  admin2: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&h=300&q=80',
  dispatcher: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&h=300&q=80',
  dispatcher2: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&h=300&q=80',
  dispatcher3: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&h=300&q=80',
  driver1: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&h=300&q=80',
  driver2: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&h=300&q=80',
  driver3: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&h=300&q=80',
  driver4: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=300&h=300&q=80',
  client1: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&h=300&q=80',
  client2: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=300&h=300&q=80',
  client3: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&h=300&q=80',
};

/**
 * Returns a valid full URL for an avatar image.
 * Prefixes local backend uploads with backend origin and falls back to a real portrait photo.
 */
export function getAvatarUrl(avatarUrl, user) {
  if (avatarUrl && typeof avatarUrl === 'string' && avatarUrl.trim() !== '') {
    const trimmed = avatarUrl.trim();
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
      return trimmed;
    }
    // Prefix relative backend upload path
    if (trimmed.startsWith('/')) {
      return `${BACKEND_BASE}${trimmed}`;
    }
    return `${BACKEND_BASE}/${trimmed}`;
  }

  // Fallback to real portrait picture
  return getFallbackAvatar(user);
}

/**
 * Returns a fallback real portrait picture based on user attributes.
 */
export function getFallbackAvatar(user) {
  const uname = user?.username ? user.username.toLowerCase() : '';
  if (uname && USER_AVATARS[uname]) {
    return USER_AVATARS[uname];
  }
  const role = user?.role;
  if (role && DEFAULT_ROLE_AVATARS[role]) {
    return DEFAULT_ROLE_AVATARS[role];
  }
  return DEFAULT_ROLE_AVATARS.DEFAULT;
}

/**
 * Handles image load errors gracefully by replacing src with a guaranteed real photo avatar.
 */
export function handleAvatarError(e, user) {
  if (e.target.src && e.target.src.startsWith('blob:')) {
    return;
  }
  const safeFallback = DEFAULT_ROLE_AVATARS[user?.role] || DEFAULT_ROLE_AVATARS.DEFAULT;
  if (e.target.src !== safeFallback) {
    e.target.src = safeFallback;
  }
}
