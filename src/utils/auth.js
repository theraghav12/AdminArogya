export const isAuthenticated = () => {
    return localStorage.getItem('adminToken') !== null;
  };
  
  export const logout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/login';
  };