import api from '../api/axios';

const profileService = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data) => api.put('/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/profile/avatar', formData);
  },
};

export default profileService;

