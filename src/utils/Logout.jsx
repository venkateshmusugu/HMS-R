// utils/logout.js
import axios from 'axios';
import { getCookie } from './csrf';

export const logout = async () => {
  try {
    await axios.get('http://localhost:8080/api/csrf', { withCredentials: true });

    const csrfToken = getCookie('XSRF-TOKEN');

    await axios.post(
      'http://localhost:8080/api/logout',
      {},
      {
        withCredentials: true,
        headers: { 'X-XSRF-TOKEN': csrfToken },
      }
    );

    localStorage.removeItem('token');
    localStorage.removeItem('role');
    return true;
  } catch (error) {
    console.error("Logout failed:", error);
    return false;
  }
};
