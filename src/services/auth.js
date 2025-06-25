import API from './api';

export const loginAdmin = async (credentials) => {
  const response = await API.post('/admin/login', credentials);
  // The backend returns the token as adminToken, map it to token for consistency
  return {
    ...response.data,
    token: response.data.adminToken
  };
};

export const getAdminProfile = async () => {
  const response = await API.get('/admin/profile');
  return response.data;
};