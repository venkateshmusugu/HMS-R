import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const BookSurgery = () => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    status: 'Scheduled'
  });
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/patients')
      .then(res => setPatients(res.data))
      .catch(() => alert("❌ Could not load patients."));
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/api/surgery-appointments/book/${formData.patientId}`, formData);
      alert("✅ Surgery appointment booked.");
      navigate('/surgery');
    } catch (err) {
      alert("❌ Booking failed.");
    }
  };

  return (
    <div className='surgery-book'>
    <div className="container mt-5">
      <h2 className="text-primary mb-4">Book Surgery Appointment</h2>
      <form onSubmit={handleSubmit}>
        <select name="patientId" className="form-select mb-3" value={formData.patientId} onChange={handleChange} required>
          <option value="">-- Select Patient --</option>
          {patients.map(p => <option key={p.patientId} value={p.patientId}>{p.patientName}</option>)}
        </select>

        <input type="date" name="surgeryDate" className="form-control mb-3" value={formData.surgeryDate} onChange={handleChange} required />
        <input type="time" name="surgeryTime" className="form-control mb-3" value={formData.surgeryTime} onChange={handleChange} required />
        <input type="text" name="surgeryType" className="form-control mb-3" placeholder="Surgery Type" value={formData.surgeryType} onChange={handleChange} required />

        <button type="submit" className="btn btn-success">Book</button>
      </form>
    </div></div>
  );
};

export default BookSurgery;