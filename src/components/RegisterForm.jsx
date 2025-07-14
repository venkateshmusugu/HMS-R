import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../css/Registerform.css";

const mapRole = (raw) => {
  switch (raw?.toLowerCase()) {
    case 'reception': return 'RECEPTIONIST';
    case 'doctor': return 'DOCTOR';
    case 'surgery': return 'SURGERY';
    case 'billing': return 'BILLING';
    default: return '';
  }
};

const RegisterForm = () => {
  const { role } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1 = user details, 2 = enter OTP
  const [otp, setOtp] = useState('');
  const [roleLimitReached, setRoleLimitReached] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    email: '',
    role: mapRole(role),
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const checkRoleLimit = async () => {
      try {
        const res = await axios.get('http://localhost:8081/api/users/role-counts');
        const count = res.data[form.role];

        if ((form.role === 'DOCTOR' && count >= 5) ||
            (form.role !== 'DOCTOR' && count >= 1)) {
          setRoleLimitReached(true);
        }
      } catch (err) {
        console.error("Failed to fetch role counts:", err);
      }
    };

    if (form.role) {
      checkRoleLimit();
    }
  }, [form.role]);

  const sendOtp = async (e) => {
    e.preventDefault();
    if (!form.email) {
      alert("Please enter email.");
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/users/otp/send', {
        email: form.email
      });
      alert("✅ OTP sent to your email");
      setStep(2);
    } catch (err) {
      console.error("❌ Error sending OTP:", err);
      alert("❌ Failed to send OTP");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, otp };
      await axios.post('http://localhost:8081/api/users/otp/verify', payload);
      alert("✅ Registered successfully");
      navigate('/');
    } catch (err) {
      const message = err?.response?.data || "Unexpected error occurred";
      console.warn("⚠️ Registration error:", message);

      if (typeof message === "string") {
        if (message.includes("Email already registered")) {
          alert("❌ Email already registered.");
        } else if (message.includes("Username already exists")) {
          alert("❌ Username already exists.");
        } else {
          alert("❌ Registration failed: " + message);
        }
      } else {
        alert("❌ Registration failed. Please try again.");
      }
    }
  };

  return (
    <div className="background-container">
      <div className="login-form-one">
        <h2>Register as {mapRole(role)}</h2>

        {roleLimitReached ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>
            ❌ Registration not allowed. Maximum limit reached for {form.role}.
          </p>
        ) : (
          <>
            {step === 1 && (
              <form onSubmit={sendOtp}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" name="username" value={form.username} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" name="password" value={form.password} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" name="email" value={form.email} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <input type="text" name="role" value={form.role} readOnly />
                </div>
                <button type="submit" className='registerbtn' disabled={roleLimitReached}>Send OTP</button>
              </form>
            )}

            {step === 2 && (
              <form onSubmit={handleRegister}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={form.username} readOnly />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" value={form.email} readOnly />
                </div>
                <div className="form-group">
                  <label>Enter OTP</label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                </div>
                <button type="submit" className='registerbtn' disabled={roleLimitReached}>Verify & Register</button>
              </form>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RegisterForm;
