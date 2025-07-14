import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Homelogin.css";

const HomeLogin = () => {
  const [role, setRole] = useState('reception');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

 useEffect(() => {
  const isLoggedIn = localStorage.getItem('loggedIn') === 'true';
  const role = localStorage.getItem('role');

  if (isLoggedIn && role) {
    // ✅ Delay just a bit for safety
    setTimeout(() => {
      if (role === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else if (role === 'RECEPTIONIST') {
        navigate('/patients');
      } else if (role === 'SURGERY') {
        navigate('/surgery');
      } else if (role === 'BILLING') {
        navigate('/billing');
      } else if (role === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }

      // ✅ Clear flag
      localStorage.removeItem('loggedIn');
    }, 100); // short delay to ensure localStorage is stable
  }
}, [navigate]);



  const mapRole = (raw) => {
    switch (raw.toLowerCase()) {
      case 'reception': return 'RECEPTIONIST';
      case 'doctor': return 'DOCTOR';
      case 'billing': return 'BILLING';
      case 'surgery': return 'SURGERY';
      case 'admin': return 'ADMIN';
      default: return raw.toUpperCase();
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosInstance.post(
        '/api/users/login',
        { username, password, role: mapRole(role) },
        { headers: { Accept: 'application/json' } }
      );

      const { accessToken, refreshToken, role: respRole, username: respUsername } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', respRole);
      localStorage.setItem('username', respUsername);

     if (respRole === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else if (respRole === 'RECEPTIONIST') {
        navigate('/patients');
      } else if (respRole === 'SURGERY') {
        navigate('/surgery');
      } else if (respRole === 'BILLING') {
        navigate('/billing');
      } else if (respRole === 'ADMIN') {
        navigate('/admin-dashboard');
      } else {
        navigate('/');
      }


    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError("❌ Login failed. Check credentials.");
    }
  };

  const handleRegister = () => {
    navigate(`/register/${role}`);
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password'); // Route should be defined in your App.jsx
  };

  return (
    <div className="home-login-background">
      <div className="hospital-header-container">
  <div className="hospital-header">
    <h1 className="hospital-title">
  Hospita<span className="icon-inline">l
    <img src="/images/healthcare.png" alt="Hospital Icon" className="hospital-icon-inline" />
  </span> Management Service
</h1>

  </div>
</div>

      <div className="container-first mt-5">
        <h2 className="mb-4 text-center text-primary fw-bold border-bottom pb-2">Login</h2>
        <form className="form-1" onSubmit={handleLogin}>
          <div className="mb-3 text-primary fw-bold border-bottom pb-2">
            <label>Username</label>
            <input
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-primary fw-bold border-bottom pb-2">
            <label>Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="mb-3 text-primary fw-bold border-bottom pb-2">
            <label>Login As</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="reception">Reception</option>
              <option value="doctor">Doctor</option>
              <option value="billing">Billing</option>
              <option value="surgery">Surgery</option>
              <option value="admin">Admin</option> {/* ✅ Add this line */}
            </select>

          </div>
          <button className="btn login-button" type="submit">Login</button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link"
              style={{ fontSize: '1rem', textDecoration: 'underline', padding: 0, color: 'white' }} 
              onClick={handleForgotPassword}
            >
              Forgot Password?
            </button>
          </div>
        </form>

        {/* Register link */}
        {role !== 'admin' && (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'baseline',
    gap: '5px',
    whiteSpace: 'nowrap',
    marginTop: '1rem'
  }}>
    <span>Don't have an account?</span>
    <button
      onClick={handleRegister}
      style={{
        padding: 0,
        margin: 0,
        border: 'none',
        background: 'none',
        color: 'blue',
        textDecoration: 'underline',
        fontSize: 'inherit',
        lineHeight: 'inherit',
        cursor: 'pointer'
      }}
    >
      Register here
    </button>
  </div>
)}

      </div>
    </div>
  );
};

export default HomeLogin;
