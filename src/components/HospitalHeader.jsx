import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import '../css/HospitalHeader.css';

const HospitalHeader = () => {
  const [config, setConfig] = useState({ hospitalName: '', logoUrl: '' });

 useEffect(() => {
  const token = localStorage.getItem('accessToken');
  console.log('🧪 Admin Token in Header useEffect:', token);

  if (!token) {
    console.warn('🚫 No token found, skipping hospital config fetch');
    return;
  }

  axiosInstance.get('/api/hospital-config')
    .then(res => {
      console.log('✅ Config fetched (Admin):', res.data);
      setConfig(res.data);
    })
    .catch(err => {
      console.error('❌ Admin config fetch error:', err);
    });
}, []);


  return (
    <div className="hospital-header">
      {config.logoUrl && (
        <img
          src={`http://localhost:8081${config.logoUrl}`}
          alt="Logo"
          className="hospital-logo"
        />
      )}
      <h2>{config.hospitalName}</h2>
    </div>
  );
};

export default HospitalHeader;
