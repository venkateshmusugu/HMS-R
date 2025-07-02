import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Homelogin.css";

const HomeLogin = () => {
  const [role, setRole] = useState('reception'); // default role
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const mapRole = (raw) => {
    switch (raw.toLowerCase()) {
      case 'reception': return 'RECEPTIONIST';
      case 'doctor': return 'DOCTOR';
      case 'billing': return 'BILLING';
      case 'surgery': return 'SURGERY';
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

      // ✅ Role-based redirect
      if (respRole === 'DOCTOR') {
        navigate('/doctor-dashboard');
      } else if (respRole === 'RECEPTIONIST') {
        navigate('/patients');
      } else if (respRole === 'SURGERY') {
        navigate('/surgery');
      } else if (respRole === 'BILLING') {
        navigate('/billing');
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

  return (
    <div className="home-login-background">
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
            </select>
          </div>
          <button className="btn login-button" type="submit">Login</button>
          {error && <div className="alert alert-danger mt-3">{error}</div>}
        </form>

        {/* Link to Register */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'baseline',
          gap: '5px',
          whiteSpace: 'nowrap'
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
      </div>
    </div>
  );
};

export default HomeLogin;
