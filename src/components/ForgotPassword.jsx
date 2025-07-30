import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const sendOtp = async () => {
    if (!email.trim()) {
      alert("Please enter your email.");
      return;
    }
    try {
      await axios.post('http://localhost:8081/api/users/otp/send', { email });
      alert("✅ OTP sent to email");
      setStep(2);
    } catch (err) {
      alert("❌ Failed to send OTP. Please check the email or try again later.");
      console.error("Send OTP error:", err);
    }
  };

  const resetPassword = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      alert("Please enter both OTP and new password.");
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/users/otp/reset', {
        email,
        otp,
        newPassword,
      });
      alert("✅ Password reset successfully");
      window.location.href = '/';
    } catch (err) {
      const message = err.response?.data || err.message;
      alert("❌ Password reset failed: " + message);
      console.error("Reset error:", err);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: '400px' }}>
      <h2 className="mb-4 text-center">Forgot Password</h2>

      {step === 1 && (
        <>
          <input
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="form-control mb-3"
            required
          />
          <button onClick={sendOtp} className="btn btn-primary w-100">
            Send OTP
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="form-control mb-2"
            required
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="form-control mb-3"
            required
          />
          <button onClick={resetPassword} className="btn btn-success w-100">
            Reset Password
          </button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
