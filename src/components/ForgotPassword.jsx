import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const sendOtp = async () => {
    if (!email) {
      alert("Please enter your email.");
      return;
    }
    try {
      await axios.post('http://localhost:8081/api/users/otp/send', { email }); // ✅ corrected
      alert("✅ OTP sent to email");
      setStep(2);
    } catch (err) {
      alert("❌ Failed to send OTP");
    }
  };

  const resetPassword = async () => {
    if (!otp || !newPassword) {
      alert("Please enter OTP and new password.");
      return;
    }

    try {
      await axios.post('http://localhost:8081/api/users/otp/reset', {
        email, otp, newPassword
      });
      alert("✅ Password reset successfully");
      window.location.href = '/';
    } catch (err) {
      alert("❌ Password reset failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="container mt-5">
      <h2>Forgot Password</h2>
      {step === 1 && (
        <>
          <input
            placeholder="Enter email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="form-control mb-3"
          />
          <button onClick={sendOtp} className="btn btn-primary">Send OTP</button>
        </>
      )}

      {step === 2 && (
        <>
          <input
            placeholder="Enter OTP"
            value={otp}
            onChange={e => setOtp(e.target.value)}
            className="form-control mb-2"
          />
          <input
            type="password"
            placeholder="Enter New Password"
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            className="form-control mb-3"
          />
          <button onClick={resetPassword} className="btn btn-success">Reset Password</button>
        </>
      )}
    </div>
  );
};

export default ForgotPassword;
