import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const BookSurgery = () => {
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    status: 'Scheduled',
  });

  const navigate = useNavigate();
  const { id } = useParams(); // for editing if needed later

  // Fetch patients
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await axiosInstance.get('/api/patients');
        const data = Array.isArray(response.data) ? response.data : [];
        setPatients(data);
      } catch (err) {
        console.error("❌ Error fetching patients:", err);
        alert("❌ Could not load patient list");
      }
    };
    fetchPatients();
  }, []);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axiosInstance.post(
        `/api/surgery-appointments/book/${formData.patientId}`,
        {
          surgeryDate: formData.surgeryDate,
          surgeryTime: formData.surgeryTime,
          surgeryType: formData.surgeryType,
          status: formData.status
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      alert("✅ Surgery appointment booked");
      navigate('/surgery');
    } catch (err) {
      console.error("❌ Booking failed:", err);
      alert("❌ Failed to book surgery");
    }
  };

  return (
    <div className='book-appointment'>
      <div className="container mt-5">
        <h2>Book Surgery Appointment</h2>
        <form onSubmit={handleSubmit}>
          {/* Patient Dropdown */}
          <div className="mb-3">
            <label>Patient</label>
            <select
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              required
              className="form-select"
            >
              <option value="">-- Select Patient --</option>
              {patients.map((p) => (
                <option key={p.patientId} value={p.patientId}>
                  {p.patientName} - Age: {p.age}, Phone: {p.phoneNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Surgery Date */}
          <div className="mb-3">
            <label>Surgery Date</label>
            <input
              type="date"
              name="surgeryDate"
              value={formData.surgeryDate}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          {/* Surgery Time */}
          <div className="mb-3">
            <label>Surgery Time</label>
            <input
              type="time"
              name="surgeryTime"
              value={formData.surgeryTime}
              onChange={handleChange}
              required
              className="form-control"
            />
          </div>

          {/* Surgery Type */}
          <div className="mb-3">
            <label>Surgery Type</label>
            <input
              type="text"
              name="surgeryType"
              value={formData.surgeryType}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="e.g. Appendectomy, Fracture Repair"
            />
          </div>

          <button type="submit" className="btn btn-success">
            Book Surgery
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookSurgery;
