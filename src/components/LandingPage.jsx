import React, { useState } from "react";
import axios from "axios";
import "../css/LandingPage.css";

const LandingPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contactNumber: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
    iconFile: "",
    plan: "BASIC",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });

  const [iconFile, setIconFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e) => {
    setIconFile(e.target.files[0]);
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    const razorpayLoaded = await loadRazorpayScript();
    if (!razorpayLoaded) {
      alert("Razorpay SDK failed to load.");
      return;
    }

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });
      if (iconFile) {
        data.append("icon", iconFile);
      }

      // 🔓 Don't send token — this is a public registration
      const orderRes = await axios.post(
        "http://localhost:8081/api/hospitals/create-order",
        data
      );

      const orderData = orderRes.data;

      const options = {
        key: "rzp_test_11krXBMmubInXJ", // Replace with your real Razorpay key in production
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Hospital Registration",
        description: `Plan: ${formData.plan}`,
        order_id: orderData.id,
        handler: async function (response) {
          const callbackPayload = {
            razorpay_payment_id: response.razorpay_payment_id,
            order_id: response.razorpay_order_id,
            notes: {
              hospitalName: formData.name,
              hospitalEmail: formData.email,
              hospitalPlan: formData.plan,
              hospitalContact: formData.contactNumber,
              hospitalAddress: formData.address,
              hospitalPincode: formData.pincode,
              hospitalCity: formData.city,
              hospitalState: formData.state,
              hospitalCountry: formData.country,
              adminName: formData.adminName,
              adminEmail: formData.adminEmail,
              adminPassword: formData.adminPassword,
            },
            amount: orderData.amount,
          };

          // 🔁 Razorpay callback: register hospital and admin
          await axios.post("http://localhost:8081/api/hospitals/razorpay-callback", callbackPayload);

          // ✅ Auto-login after successful registration
          const loginRes = await axios.post("http://localhost:8081/api/users/login", {
            username: formData.adminEmail,
            password: formData.adminPassword,
            role: "ADMIN",
          });

          const { accessToken, refreshToken, role, username, hospitalId } = loginRes.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          localStorage.setItem("role", role);
          localStorage.setItem("username", username);
          localStorage.setItem("hospitalId", hospitalId);

          alert("✅ Hospital registered successfully!");
          window.location.href = "/home-login";
        },
        prefill: {
          name: formData.adminName,
          email: formData.adminEmail,
          contact: formData.contactNumber,
        },
        theme: {
          color: "#3399cc",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Order creation or payment failed:", err);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="register-form-container">
      <form onSubmit={handleRegister}>
        <h2>Register Your Hospital</h2>
        <input type="text" name="name" placeholder="Hospital Name" value={formData.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Hospital Email" value={formData.email} onChange={handleChange} required />
        <input type="text" name="contactNumber" placeholder="Contact Number" value={formData.contactNumber} onChange={handleChange} required />
        <input type="text" name="address" placeholder="Address" value={formData.address} onChange={handleChange} required />
        <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
        <input type="text" name="state" placeholder="State" value={formData.state} onChange={handleChange} required />
        <input type="text" name="country" placeholder="Country" value={formData.country} onChange={handleChange} required />
        <input type="text" name="pincode" placeholder="Pincode" value={formData.pincode} onChange={handleChange} required />

        <select name="plan" value={formData.plan} onChange={handleChange}>
          <option value="BASIC">Basic - 3 months</option>
          <option value="STANDARD">Standard - 6 months</option>
          <option value="PREMIUM">Premium - 1 year</option>
        </select>

        <div>
          <label htmlFor="icon">Upload Logo/Icon:</label>
          <input type="file" accept="image/*" name="icon" onChange={handleIconChange} />
        </div>

        <h3>Admin Credentials</h3>
        <input type="text" name="adminName" placeholder="Admin Name" value={formData.adminName} onChange={handleChange} required />
        <input type="email" name="adminEmail" placeholder="Admin Email" value={formData.adminEmail} onChange={handleChange} required />
        <input type="password" name="adminPassword" placeholder="Admin Password" value={formData.adminPassword} onChange={handleChange} required />

        <button type="submit">Register & Pay</button>
      </form>
    </div>
  );
};

export default LandingPage;
