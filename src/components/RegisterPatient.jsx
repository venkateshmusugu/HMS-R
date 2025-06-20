import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const RegisterPatient = () => {
  const [patientName, setPatientName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [caseDescription, setCaseDescription] = useState('');
  const [bookFlag, setBookFlag] = useState(false);
  const [context, setContext] = useState('');
  const [surgeryDate, setSurgeryDate] = useState('');
  const [medication, setMedication] = useState('');
  const [reason, setReason] = useState('');
  const [remarks, setRemarks] = useState('');

  // Appointment-specific
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ctx = params.get('context');
    if (ctx === 'surgery' || ctx === 'appointment') {
      setContext(ctx);
    }

    if (ctx === 'appointment') {
      axiosInstance.get('/api/doctors')
        .then(res => setDoctors(res.data))
        .catch(err => console.error('Error fetching doctors:', err));
    }
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newPatient = {
      patientName,
      gender,
      age,
      phoneNumber,
      dob,
      maritalStatus,
      caseDescription,
    };

    try {
      const { data: createdPatient } = await axiosInstance.post('/api/patients', newPatient);
      const patientId = createdPatient.patientId;

      if (bookFlag) {
        if (context === 'surgery') {
          await axiosInstance.post(`/api/surgeries/book/${patientId}`, {
            surgeryDate,
            medication,
            reason,
            remarks,
          });
        } else if (context === 'appointment') {
          await axiosInstance.post(`/api/appointments/book/${patientId}`, {
            visitDate: appointmentDate,
            startTime,
            endTime,
            reasonForVisit: reason,
            doctor: { doctorId },
          });
        }
      }

      alert(`✅ Patient registered${bookFlag ? (context === 'surgery' ? ' and surgery booked!' : ' and appointment booked!') : ' successfully.'}`);

      if (context === 'surgery' || role === 'SURGERY') {
        navigate('/surgery', { replace: true });
      } else {
        navigate('/patients');
      }

    } catch (err) {
      console.error('❌ Registration error:', err);
      alert('❌ Registration failed: ' + (err.response?.data || err.message));
    }
  };

  return (
    <div className="register-background">
      <div className="container mt-5">
        <h2 className="text-primary mb-4">Register New Patient</h2>
        <form onSubmit={handleSubmit}>
          {/* Basic Patient Details */}
          <div className="mb-3">
            <label>Patient Name</label>
            <input type="text" value={patientName} onChange={e => setPatientName(e.target.value)} required className="form-control" />
          </div>
          <div className="mb-3">
            <label>Phone Number</label>
            <input type="text" maxLength={10} value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required className="form-control" />
          </div>
          <div className="mb-3">
            <label>Age</label>
            <input type="number" value={age} onChange={e => setAge(e.target.value)} required className="form-control" />
          </div>
          <div className="mb-3">
            <label>Gender</label>
            <select value={gender} onChange={e => setGender(e.target.value)} required className="form-select">
              <option value="">Select Gender</option>
              <option>Male</option>
              <option>Female</option>
              <option>Other</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Date of Birth</label>
            <input type="date" value={dob} onChange={e => setDob(e.target.value)} required className="form-control" />
          </div>
          <div className="mb-3">
            <label>Marital Status</label>
            <select value={maritalStatus} onChange={e => setMaritalStatus(e.target.value)} required className="form-select">
              <option value="">Select Status</option>
              <option>Single</option>
              <option>Married</option>
              <option>Divorced</option>
            </select>
          </div>
          <div className="mb-3">
            <label>Case Description</label>
            <textarea value={caseDescription} onChange={e => setCaseDescription(e.target.value)} required className="form-control" />
          </div>

          {/* Booking Checkbox */}
          {context && (
            <div className="form-check mb-3">
              <input
                type="checkbox"
                className="form-check-input"
                checked={bookFlag}
                onChange={e => setBookFlag(e.target.checked)}
                id="bookFlagCheck"
              />
              <label htmlFor="bookFlagCheck" className="form-check-label">
                {context === 'surgery' ? 'Book a Surgery' : 'Book an Appointment'}
              </label>
            </div>
          )}

          {/* Surgery Fields */}
          {bookFlag && context === 'surgery' && (
            <>
              <div className="mb-3">
                <label>Surgery Date</label>
                <input type="date" value={surgeryDate} onChange={e => setSurgeryDate(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>Medication</label>
                <input type="text" value={medication} onChange={e => setMedication(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>Reason</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>Remarks</label>
                <textarea value={remarks} onChange={e => setRemarks(e.target.value)} className="form-control" />
              </div>
            </>
          )}

          {/* Appointment Fields */}
          {bookFlag && context === 'appointment' && (
            <>
              <div className="mb-3">
                <label>Appointment Date</label>
                <input type="date" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>Start Time</label>
                <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>End Time</label>
                <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>Reason for Visit</label>
                <input type="text" value={reason} onChange={e => setReason(e.target.value)} required className="form-control" />
              </div>
              <div className="mb-3">
                <label>Select Doctor</label>
                <select value={doctorId} onChange={e => setDoctorId(e.target.value)} required className="form-select">
                  <option value="">Select Doctor</option>
                  {doctors.map(doc => (
                    <option key={doc.doctorId} value={doc.doctorId}>
                      {doc.doctorName} ({doc.departmentName})
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

           <button className="btn btn-success px-4 py-2" type="submit">
            Register{bookFlag && (context === 'surgery' ? ' & Book Surgery' : ' & Book Appointment')}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPatient;
