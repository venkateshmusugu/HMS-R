// src/utils/axiosConfig.js
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach CSRF only if NOT login or register
// api.interceptors.request.use((config) => {
//   const isSecureEndpoint = !config.url.includes('/login') && !config.url.includes('/register');
//   const csrfToken = getCookie('XSRF-TOKEN');
//   if (isSecureEndpoint && csrfToken) {
//     config.headers['X-XSRF-TOKEN'] = csrfToken;
//   }
//   return config;
// });

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  return match ? match[2] : null;
}

export default api;
