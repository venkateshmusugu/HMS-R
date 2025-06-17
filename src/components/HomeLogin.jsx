import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance'; // Ensure this has withCredentials: true

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
      case 'surgery': return 'SURGEON';
      default: return raw.toUpperCase();
    }
  };

  const handleLogin = async (e) => {
  e.preventDefault();
  try {
    const response = await axiosInstance.post(
      '/api/users/login',
      { username, password, role: mapRole(role) }
    );
    console.log("🔐 Login response:", response.data);

    const { accessToken, refreshToken, role: respRole, username: respUsername } = response.data;

    localStorage.setItem('accessToken',accessToken); // ✅ Correct key
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('role', respRole);
    localStorage.setItem('username', respUsername);

    // ✅ Redirect based on role
    if (respRole === 'DOCTOR') {
      navigate('/doctor-dashboard');
    } else {
      navigate('/patients');
    }
  } catch (err) {
    console.error("❌ Login failed:", err.response?.data || err.message);
    setError("❌ Login failed. Check credentials.");
  }
};


  const handleRegister = () => {
    // Redirect to the registration page if the login fails
    navigate(`/register/${role}`);
  };

  return (
    <div className="home-login-background">
      <div className="container mt-5">

        <h2 className="mb-4 text-center text-primary fw-bold border-bottom pb-2">Login</h2>
        <form onSubmit={handleLogin}>
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
          <button className="btn btn-primary w-65 " type="submit">Login</button>
          
          {error && <div className="alert alert-danger mt-3">{error}</div>}

        </form>

        {/* Link to Register if login fails */}
        <div className="mt-3">
          <p>Don't have an account? 
            <button className="btn btn-link" onClick={handleRegister}>
              Register here
            </button>
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default HomeLogin;
