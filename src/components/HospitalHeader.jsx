import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import axios from 'axios';
import '../css/HospitalHeader.css';

const HospitalHeader = () => {
  const [config, setConfig] = useState({ name: '', logoUrl: '' });

  useEffect(() => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    console.warn('🚫 No token found, skipping hospital config fetch');
    return;
  }

  axios.get("http://localhost:8081/api/hospitals/branding", {
    headers: {
      Authorization: `Bearer ${token}`
    }
  })
    .then(res => {
      setConfig(res.data || {});
    })
    .catch(err => {
      console.error('❌ Failed to fetch hospital config:', err);
    });
}, []);

  return (
    <div className="hospital-header">
      {config.logoUrl && (
        <img
          src={`http://localhost:8081${config.iconUrl}`}  
          alt="Hospital Logo"
          className="hospital-logo"
        />
      )}
      <h2>{config.name || 'Hospital'}</h2>
    </div>
  );
};

export default HospitalHeader;
