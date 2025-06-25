// BookAppointment.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Bookappointment.css";

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]); // ✅ must be array
  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    visitDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [doctorRes, patientRes] = await Promise.all([
          axiosInstance.get('/api/doctors'),
          axiosInstance.get('/api/patients')
        ]);

        const doctorList = Array.isArray(doctorRes.data) ? doctorRes.data : [];
        const patientList = Array.isArray(patientRes.data) ? patientRes.data : [];

        console.log("✅ Doctors:", doctorList);
        console.log("✅ Patients:", patientList);

        setDoctors(doctorList);
        setPatients(patientList);
      } catch (err) {
        console.error("❌ Error loading doctors/patients:", err);
        setDoctors([]);
        setPatients([]);
      }
    };

    fetchData();
  }, []);

  const handleChange = e => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const payload = {
      visitDate: formData.visitDate,
      startTime: formData.startTime,
      endTime: formData.endTime,
      reasonForVisit: formData.reason,
      doctor: { doctorId: parseInt(formData.doctorId) },
      patient: { patientId: parseInt(formData.patientId) }
    };

    try {
      await axiosInstance.post('/api/appointments', payload);
      alert("✅ Appointment booked");

      const role = localStorage.getItem('role');
      navigate(role === 'DOCTOR' ? '/doctor-dashboard' : '/patients');
    } catch (err) {
      console.error("❌ Failed to book appointment:", err);
      alert("❌ Failed to book");
    }
  };

  return (
    <div className="book-appointment">
      <div className="container-five">
        <div className="appointmentform">
          <div className="heading-2"><h2>Book Appointment</h2></div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Patient</label>
            <select name="patientId" value={formData.patientId} onChange={handleChange} required className="form-select">
                      <option value="">-- Select Patient --</option>
                      {patients.map(p => (
                        <option key={p.patientId} value={p.patientId}>
                          {p.patientName} - {p.phoneNumber}
                        </option>
                      ))}
                    </select>
               </div>

            <div className="mb-3">
              <label>Doctor</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">-- Select Doctor --</option>
                {(doctors || []).map(d => (
                  <option key={d.doctorId} value={d.doctorId}>
                    {d.doctorName} ({d.departmentName})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-3">
              <label>Visit Date</label>
              <input type="date" name="visitDate" value={formData.visitDate} onChange={handleChange} required className="form-control" />
            </div>

            <div className="mb-3">
              <label>Start Time</label>
              <input type="time" name="startTime" value={formData.startTime} onChange={handleChange} required className="form-control" />
            </div>

            <div className="mb-3">
              <label>End Time</label>
              <input type="time" name="endTime" value={formData.endTime} onChange={handleChange} required className="form-control" />
            </div>

            <div className="mb-3">
              <label>Reason</label>
              <input type="text" name="reason" value={formData.reason} onChange={handleChange} className="form-control" placeholder="Reason for visit" />
            </div>

            <button type="submit" className="btn-blue">Book Appointment</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
