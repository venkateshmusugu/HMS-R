import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import "../css/BookAppointment.css"; // ✅ Appointment styling only


const BookSurgery = () => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
     patientId: '',
  surgeryDate: '',
  surgeryTime: '',
  surgeryType: '',
  status: 'Scheduled',
  reason: '',
  remarks: '',
  followUpDate: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
  axiosInstance.get('/api/patients')
    .then((res) => {
      console.log("✅ API response:", res.data);
      if (Array.isArray(res.data)) {
        setPatients(res.data);
      } else {
        console.error("❌ Expected array but got:", typeof res.data);
        setPatients([]); // fallback to prevent crash
      }
    })
    .catch((err) => {
      console.error("❌ API error:", err);
      setPatients([]);
    });
}, []);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.post(`/api/surgery-appointments/book/${formData.patientId}`, formData);
      alert("✅ Surgery appointment booked.");
      console.log("📅 Booking surgery with date:", formData.surgeryDate);

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
  <div className="mb-3">
    <label htmlFor="patientId" className="form-label">Select Patient</label>
    <select name="patientId" className="form-select" value={formData.patientId} onChange={handleChange} required>
      <option value="">-- Select Patient --</option>
      {patients.map(p => (
        <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
      ))}
    </select>
  </div>

  <div className="mb-3">
    <label htmlFor="surgeryDate" className="form-label">Surgery Date</label>
    <input type="date" name="surgeryDate" className="form-control" value={formData.surgeryDate} onChange={handleChange} required />
  </div>

  <div className="mb-3">
    <label htmlFor="surgeryTime" className="form-label">Surgery Time</label>
    <input type="time" name="surgeryTime" className="form-control" value={formData.surgeryTime} onChange={handleChange} required />
  </div>

  <div className="mb-3">
    <label htmlFor="surgeryType" className="form-label">Surgery Type</label>
    <input type="text" name="surgeryType" className="form-control" placeholder="e.g., Appendectomy" value={formData.surgeryType} onChange={handleChange} required />
  </div>

  <div className="mb-3">
    <label htmlFor="reason" className="form-label">Reason for Surgery</label>
    <input type="text" name="reason" className="form-control" placeholder="e.g., Appendicitis" value={formData.reason} onChange={handleChange} />
  </div>

  <div className="mb-3">
    <label htmlFor="remarks" className="form-label">Remarks</label>
    <input type="text" name="remarks" className="form-control" placeholder="e.g., Monitor post-op recovery" value={formData.remarks} onChange={handleChange} />
  </div>

  <div className="mb-3">
    <label htmlFor="followUpDate" className="form-label">Follow-Up Date</label>
    <input type="date" name="followUpDate" className="form-control" value={formData.followUpDate} onChange={handleChange} />
  </div>

  <button type="submit" className="btn btn-success">Book</button>
</form>
    </div></div>
  );
};

export default BookSurgery;