import API from './api';

export const loginAdmin = async (credentials) => {
  const response = await API.post('/admin/login', credentials);
  return response.data;
};

export const getAdminProfile = async () => {
  const response = await API.get('/admin/profile');
  return response.data;
};