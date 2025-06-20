import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const EditSurgery = () => {
  const { surgeryLogId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    status: ''
  });

  useEffect(() => {
    axiosInstance.get(`/api/surgery-appointments/${surgeryLogId}`)
      .then(res => setFormData(res.data))
      .catch(() => alert("❌ Failed to load appointment"));
  }, [surgeryLogId]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/surgery-appointments/${surgeryLogId}`, formData);
      alert("✅ Updated successfully");
      navigate('/surgery');
    } catch (err) {
      alert("❌ Update failed");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Edit Surgery Appointment</h2>
      <form onSubmit={handleSubmit}>
        <input type="date" name="surgeryDate" className="form-control mb-2" value={formData.surgeryDate} onChange={handleChange} required />
        <input type="time" name="surgeryTime" className="form-control mb-2" value={formData.surgeryTime} onChange={handleChange} required />
        <input type="text" name="surgeryType" className="form-control mb-2" placeholder="Surgery Type" value={formData.surgeryType} onChange={handleChange} required />
        <select name="status" className="form-select mb-2" value={formData.status} onChange={handleChange} required>
          <option value="Scheduled">Scheduled</option>
          <option value="Completed">Completed</option>
          <option value="Cancelled">Cancelled</option>
        </select>

        <button type="submit" className="btn btn-primary">Update</button>
      </form>
    </div>
  );
};

export default EditSurgery;
