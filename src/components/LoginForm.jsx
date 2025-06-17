// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axiosInstance from '../axiosInstance'; // Ensure axiosInstance is imported correctly

// const LoginForm = () => {
//   const [username, setUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [role, setRole] = useState('reception');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const mapRole = (raw) => {
//     switch (raw.toLowerCase()) {
//       case 'reception': return 'RECEPTIONIST';
//       case 'doctor': return 'DOCTOR';
//       case 'billing': return 'BILLING';
//       case 'surgery': return 'SURGEON';
//       default: return raw.toUpperCase();
//     }
//   };

//   const handleLogin = async (e) => {
//   e.preventDefault();
//   setError('');
  
//   const form = { username, password, role: mapRole(role) };
//   console.log("Submitting login form:", form);

//   try {
//     // Fetch CSRF token before login
//     const csrfResponse = await axiosInstance.get('/csrf');
//     console.log("✅ CSRF cookie set:", document.cookie); // Check if CSRF cookie is set in the browser

//     const token = getCookie('XSRF-TOKEN'); // Check the CSRF token you are getting from cookies
//     console.log("CSRF Token from Cookie:", token); // Print CSRF token from cookie

//     const response = await axiosInstance.post('/users/login', form);
//     console.log("Login response:", response.data); // Log login response to ensure it's correct

//     alert("✅ Login successful");
//     localStorage.setItem('token', response.data.token);
//     localStorage.setItem('role', response.data.role);

//     switch (role.toLowerCase()) {
//       case 'reception': navigate('/reception'); break;
//       case 'doctor': navigate('/doctorlog'); break;
//       case 'billing': navigate('/billing'); break;
//       case 'surgery': navigate('/surgery'); break;
//       default: navigate('/');
//     }
//   } catch (err) {
//     console.error("❌ Login failed:", err.response?.data || err.message);
//     setError("❌ Login failed. Check credentials and CSRF setup.");
//   }
// };

//   return (
//     <div className="container mt-5" style={{ maxWidth: 400 }}>
//       <h2 className="mb-4 text-center">Login</h2>
//       <form onSubmit={handleLogin}>
//         <div className="mb-3">
//           <label>Username</label>
//           <input className="form-control" value={username} onChange={(e) => setUsername(e.target.value)} required />
//         </div>
//         <div className="mb-3">
//           <label>Password</label>
//           <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>
//         <div className="mb-3">
//           <label>Login As</label>
//           <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
//             <option value="reception">Reception</option>
//             <option value="doctor">Doctor</option>
//             <option value="billing">Billing</option>
//             <option value="surgery">Surgery</option>
//           </select>
//         </div>
//         <button className="btn btn-primary w-100" type="submit">Login</button>
//         {error && <div className="alert alert-danger mt-3">{error}</div>}
//       </form>
//     </div>
//   );
// };

// export default LoginForm;
