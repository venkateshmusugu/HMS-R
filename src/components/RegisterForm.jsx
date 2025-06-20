import React, { useState, useEffect } from 'react';
import axios from 'axios';
import axiosInstance from '../axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';
import "../css/Registerform.css";
// ✅ Helper to extract CSRF token from cookies
const getCookie = (cookieName) => {
  const name = cookieName + "=";
  const decodedCookie = decodeURIComponent(document.cookie);
  const cookies = decodedCookie.split(';');
  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(name) === 0) {
      return cookie.substring(name.length);
    }
  }
  return "";
};

// ✅ Role mapping helper
const mapRole = (rawRole) => {
  const role = rawRole?.toLowerCase();
  switch (role) {
    case 'reception': return 'RECEPTIONIST';
    case 'doctor': return 'DOCTOR';
    case 'admin': return 'ADMIN';
    case 'nurse': return 'NURSE';
    case 'pharmacist': return 'PHARMACIST';
    default: return role?.toUpperCase() || '';
  }
};

// ✅ UI helper for display
const titleCase = (text) =>
  text?.charAt(0).toUpperCase() + text?.slice(1).toLowerCase();

function RegisterForm() {
  const { role } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    role: mapRole(role),
  });

  useEffect(() => {
    axiosInstance.get('/csrf', { withCredentials: true })
      .then(() => console.log("✅ CSRF token fetched"))
      .catch(err => console.error("❌ CSRF token load failed", err));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Submitting form:", form);

    try {
      // const csrfToken = getCookie('XSRF-TOKEN');

      const res = await axios.post('http://localhost:8081/api/users/register', form, {
        // headers: {
        //   'X-XSRF-TOKEN': csrfToken,
        //   'Content-Type': 'application/json',
        // },
        // withCredentials: true,
      });

      alert("✅ Registered successfully");
      console.log("Response:", res.data);
      navigate('/');
    } catch (err) {
      console.error("❌ Registration failed:", err.response?.data || err.message);
      alert("❌ Registration failed: " + (err.response?.data || err.message));
    }
  };

return (
  <div className="background-container">
    <div className="login-form-one">
      <h2>Register as {titleCase(role)}</h2>
      <form onSubmit={handleRegister}>
        <div className="form-group">
          <label>Username</label>
          <input type="text" name="username" value={form.username} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input type="password" name="password" value={form.password} onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Role</label>
          <input type="text" name="role" value={form.role} readOnly />
        </div>
        <button className='registerbtn' type="submit">Register</button>
      </form>
    </div>
  </div>
);
}

export default RegisterForm;
