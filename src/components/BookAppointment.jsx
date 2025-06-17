import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const BookAppointment = () => {
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [patientId, setPatientId] = useState('');

  const navigate = useNavigate();
  const { id } = useParams(); // If editing, this will exist

  // Fetch patients, doctors, and appointment (if edit)
  useEffect(() => {
   const fetchData = async () => {
  try {
    const [patientsRes, doctorsRes] = await Promise.all([
      axiosInstance.get('/api/patients'),
      axiosInstance.get('/api/doctors'),
    ]);
    console.log("👥 Patients Response:", patientsRes.data);
    console.log("🩺 Doctors Response:", doctorsRes.data);

    // ✅ Ensure responses are arrays
    const patientList = Array.isArray(patientsRes.data) ? patientsRes.data : [];
    const doctorList = Array.isArray(doctorsRes.data) ? doctorsRes.data : [];

    setPatients(patientList);
    setDoctors(doctorList);

    if (id) {
      const apptRes = await axiosInstance.get(`/api/appointments/${id}`);
      const appt = apptRes.data;
      setAppointmentDate(appt.visitDate);
      setStartTime(appt.startTime);
      setEndTime(appt.endTime);
      setDoctorId(appt.doctor?.doctorId || '');
      setPatientId(appt.patient?.patientId || '');
    }
  } catch (err) {
    console.error('❌ Failed to fetch:', err);
  }
};

    fetchData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const appointmentData = {
      visitDate: appointmentDate,
      startTime,
      endTime,
      doctor: { doctorId },
      patient: { patientId },
    };

    try {
      if (id) {
        // Update existing
        await axiosInstance.put(`/api/appointments/${id}`, appointmentData);
        alert("✅ Appointment updated!");
      } else {
        // Create new
        await axiosInstance.post('/api/appointments', appointmentData);
        alert("✅ Appointment booked!");
      }

      navigate('/patients');
    } catch (err) {
      console.error("❌ Error submitting:", err);
      alert("❌ Failed to save appointment");
    }
  };

  return (
    <div className='book-appointment'>
    <div className="container mt-5">
      <h2>{id ? 'Edit Appointment' : 'Book Appointment'}</h2>
      <form onSubmit={handleSubmit}>
        {/* Patient Dropdown */}
        <div >
          <label>Patient</label>
        <select
          value={String(patientId)}  // ensure it's not an object or undefined
          onChange={(e) => setPatientId(e.target.value)}
          required
        >
          <option value="">Select Patient</option>
          {patients.map((patient) => (
            <option key={patient.patientId} value={String(patient.patientId)}>
              {patient.patientName}
            </option>
          ))}
        </select>
        <ul>
  {patients.map(p => (
    <li key={p.patientId}>{p.patientId} - {p.patientName}</li>
  ))}
</ul>
        </div>

        {/* Doctor Dropdown */}
        <div >
          <label>Doctor</label>
          <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
            <option value="">Select Doctor</option>
            {doctors.map((doctor) => (
              <option key={doctor.doctorId} value={doctor.doctorId}>
                {doctor.doctorName} ({doctor.departmentName})
              </option>
            ))}
          </select>
        </div>

        {/* Date */}
        <div className="mb-3">
          <label>Appointment Date</label>
          <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
        </div>

        {/* Time */}
        <div className="mb-3">
          <label>Start Time</label>
          <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>End Time</label>
          <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
        </div>

        <button type="submit">{id ? 'Update Appointment' : 'Book Appointment'}</button>
      </form>
    </div></div>
  );
};

export default BookAppointment;
