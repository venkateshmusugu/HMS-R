import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../css/registerpatient.css';

const RegisterPatient = () => {
  const [patientName, setPatientName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] =useState('');
  const [dob, setDob] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [isAppointment, setIsAppointment] = useState(false);
  const [doctors, setDoctors] = useState([]);

  const navigate = useNavigate();
  const role = localStorage.getItem('role');

  useEffect(() => {
    axiosInstance.get('/api/doctors')
      .then(res => setDoctors(res.data))
      .catch(err => {
        console.error("❌ Failed to fetch doctors:", err);
        alert("❌ Failed to fetch doctors.");
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPatient = { patientName, gender,age, phoneNumber, dob, maritalStatus, caseDescription };

    try {
      const { data: createdPatient } = await axiosInstance.post('/api/patients', newPatient);
      const patientId = createdPatient.patientId;

      if (isAppointment) {
        await axiosInstance.post('/api/appointments', {
          visitDate: appointmentDate,
          startTime,
          endTime,
          patient: { patientId },
          doctor: { doctorId },
        });
      }

      alert("✅ Patient saved" + (isAppointment ? " and appointment booked!" : "!"));

      // Redirect based on role
      if (role === 'DOCTOR') navigate('/doctor-dashboard', {replace: true});
      else navigate('/patients');

    } catch (err) {
      console.error("❌ Registration failed:", err);
      alert("❌ Registration failed: " + (err.response?.data || err.message));
    }
  };

  return (
    <div className="register-background">
      <div className="container-one">
        
        
        <form className='patient-form' onSubmit={handleSubmit}>
          <div className="heading-one"><h2 >Register New Patient</h2></div>
          <div className="form-one">
            
          <div className="f-one">
            <label>Patient Name</label>
            <input  type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required />
          </div>
          <div className='mb-3'>
            <label>Age</label>
            <input type='number' value={age} onChange={e=>setAge(e.target.value)} required />
          </div>
          </div>
          <div className="form-one">
          <div className="f-one">
            <label>Phone Number</label>
            <input  type="text" maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
          </div>
          

          <div className="mb-3">
            <label>Gender</label>
            <select  value={gender} onChange={e => setGender(e.target.value)} required>
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          </div>
          <div className="form-one">
          <div className="f-one">
            <label>Date of Birth</label>
            <input  type="date" value={dob} onChange={e => setDob(e.target.value)} required />
          </div>

          <div className="mb-3">
            <label>Marital Status</label>
            <select  value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} required>
              <option value="">Select Status</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
            </select>
          </div>
          </div>
          <div className="f-two">
            <label>Case Description</label>
            <textarea value={caseDescription} onChange={e => setCaseDescription(e.target.value)} required />
          </div>
          <div className="checks">
          <div className="box">
            <input
              type="checkbox"
              checked={isAppointment}
              onChange={e => setIsAppointment(e.target.checked)}
            />
            </div>
            <label className="form-check-labels">Book an Appointment</label>
          </div>

          {isAppointment && <>
          <div className="form-one">
            <div className="f-one">
              <label>Appointment Date</label>
              <input  type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required />
            </div>
           <div className="f-three">
              <label>Doctor</label>
              <select  value={doctorId} onChange={e => setDoctorId(e.target.value)} required>
                <option value="">Select Doctor</option>
                {doctors.map(doc => (
                  <option key={doc.doctorId} value={doc.doctorId}>
                    {doc.doctorName} ({doc.departmentName})
                  </option>
                ))}
              </select>
            </div>
            </div>
            <div className='form-one'>
             <div className="f-4">
              <label>Start Time</label>
              <input  type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required />
            </div>
            <div className="mb-3">
              <label>End Time</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required />
            </div>
            </div>
            
          </>}

          <button className="btn-end" type="submit">
            Save Patient{isAppointment && ' & Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
