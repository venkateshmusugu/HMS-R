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
      setTimeout(() => {
        switch (role) {
          case 'DOCTOR': navigate('/doctor-dashboard'); break;
          case 'RECEPTIONIST': navigate('/patients'); break;
          case 'SURGERY': navigate('/surgery'); break;
          case 'BILLING': navigate('/billing'); break;
          case 'ADMIN': navigate('/admin-dashboard'); break;
          default: navigate('/');
        }
        localStorage.removeItem('loggedIn');
      }, 100);
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
      const response = await axiosInstance.post('/api/users/login', {
        username,
        password,
        role: mapRole(role)
      });

      const { accessToken, refreshToken, role: respRole, username: respUsername, hospitalId } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('role', respRole);
      localStorage.setItem('username', respUsername);
      localStorage.setItem('hospitalId', hospitalId);

      switch (respRole) {
        case 'DOCTOR': navigate('/doctor-dashboard'); break;
        case 'RECEPTIONIST': navigate('/patients'); break;
        case 'SURGERY': navigate('/surgery'); break;
        case 'BILLING': navigate('/billing'); break;
        case 'ADMIN': navigate('/admin-dashboard'); break;
        default: navigate('/');
      }
    } catch (err) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      setError("❌ Login failed. Check credentials.");
    }
  };

  const handleRegister = async () => {
    console.log("Register role:", role); 
  const mappedRole = mapRole(role);
  console.log("👉 Role selected:", role);
  console.log("👉 Mapped role:", mappedRole);

  if (mappedRole === 'ADMIN') {
    alert("❌ Admin can only be created during hospital registration.");
    return;
  }

  try {
    const res = await axiosInstance.get(`/api/users/role-counts`);
    console.log("📊 All role counts:", res.data);
    const allCounts = res.data || {};

    const hospitalId = localStorage.getItem("hospitalId");
    const currentHospitalCounts = hospitalId ? (allCounts[hospitalId] || {}) : {};
    console.log("🏥 Hospital ID from localStorage:", hospitalId);

    if (mappedRole === 'DOCTOR' && (currentHospitalCounts.DOCTOR || 0) >= 5) {
      alert("❌ Doctor registration limit reached (Max 5 per hospital).");
      return;
    }

    if (['RECEPTIONIST', 'BILLING', 'SURGERY'].includes(mappedRole) && (currentHospitalCounts[mappedRole] || 0) >= 1) {
      alert(`❌ Only 1 ${mappedRole.toLowerCase()} allowed per hospital.`);
      return;
    }

    const pathToNavigate = `/register/${role}`;
    console.log(role);
    console.log("🚀 Navigating to:", pathToNavigate); 
    navigate(pathToNavigate);
  } catch (err) {
    console.error("❌ Failed to check role count:", err);
    alert("Something went wrong while checking role limits.");
  }
};

  return (
    <div className="home-login-background">
      <div className="hospital-header-container">
        <div className="hospital-header">
          <h1 className="hospital-title">
            Hospita
            <span className="icon-inline">
              l
              {/* Removed unused hospital logo code */}
            </span>
            Management Service
          </h1>
        </div>
      </div>

      <div className="container-first mt-5">
        <h2 className="mb-4 text-center text-primary fw-bold border-bottom pb-2">Login</h2>
        <form className="form-1" onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-bold">Username</label>
            <input
              className="form-control"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Password</label>
            <input
              className="form-control"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-bold">Login As</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}>
              <option value="reception">Reception</option>
              <option value="doctor">Doctor</option>
              <option value="billing">Billing</option>
              <option value="surgery">Surgery</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button className="btn login-button" type="submit">Login</button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}

          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-link text-white text-decoration-underline p-0"
              onClick={() => navigate('/forgot-password')}
            >
              Forgot Password?
            </button>
          </div>

          {role === 'admin' && (
            <div className="text-center mt-2">
              <button
                type="button"
                className="btn btn-link text-warning text-decoration-underline p-0"
                onClick={() => navigate('/admin-reset-password')}
              >
                Reset Admin Password
              </button>
            </div>
          )}
        </form>

        {role !== 'admin' && (
          <div className="text-center mt-3">
            <span>Don't have an account? </span>
            <button
              onClick={handleRegister}
              style={{
                border: 'none',
                background: 'none',
                color: 'blue',
                textDecoration: 'underline',
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
