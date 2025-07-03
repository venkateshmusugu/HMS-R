import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/RegisterPatient.css";

const RegisterPatient = () => {
  const [patientName, setPatientName] = useState('');
  const [gender, setGender] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [age, setAge] = useState('');
  const [dob, setDob] = useState('');
  const [ageDisplay, setAgeDisplay] = useState('');
  const [maritalStatus, setMaritalStatus] = useState('');
  const [address, setAddress] = useState('');


  const [context, setContext] = useState('');
  const [bookFlag, setBookFlag] = useState(false);

  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [existingAppointments, setExistingAppointments] = useState([]);

  const [surgeryDate, setSurgeryDate] = useState('');
  const [medication, setMedication] = useState('');
  const [surgeryReason, setSurgeryReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [surgeryTime, setSurgeryTime] = useState('');
  const [surgeryType, setSurgeryType] = useState('');
  const [status, setStatus] = useState('Scheduled');

  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem("role");

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();

    let years = today.getFullYear() - birthDate.getFullYear();
    let months = today.getMonth() - birthDate.getMonth();
    let days = today.getDate() - birthDate.getDate();

    if (days < 0) {
      months--;
      days += new Date(today.getFullYear(), today.getMonth(), 0).getDate();
    }

    if (months < 0) {
      years--;
      months += 12;
    }

    return `${years} yrs ${months} mths ${days} days`;
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let ctx = params.get("context");

    if (!ctx) {
      if (role === "RECEPTIONIST" || role === "DOCTOR") {
        ctx = "appointment";
      } else {
        ctx = "surgery";
      }
    }

    setContext(ctx);

    if (ctx === "appointment") {
      axiosInstance.get("/api/doctors")
        .then(res => setDoctors(res.data))
        .catch(console.error);
    }
  }, [location.search, role]);

  useEffect(() => {
    if (doctorId && appointmentDate) {
      axiosInstance.get('/api/appointments/upcoming', {
        params: { date: appointmentDate, doctorId }
      }).then(res => {
        setExistingAppointments(Array.isArray(res.data) ? res.data : []);
      }).catch(err => {
        console.error("❌ Error fetching overlapping checks:", err);
        setExistingAppointments([]);
      });
    }
  }, [doctorId, appointmentDate]);

  const isOverlapping = () => {
    return existingAppointments.some(app => {
      return (
        (startTime >= app.startTime && startTime < app.endTime) ||
        (endTime > app.startTime && endTime <= app.endTime) ||
        (startTime <= app.startTime && endTime >= app.endTime)
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const patientPayload = {
        patientName,
        gender,
        phoneNumber,
        age,
        dob,
        maritalStatus,
        address,

      };

      const { data } = await axiosInstance.post("http://localhost:8081/api/patients", patientPayload);
      const patientId = data.patientId;

      if (bookFlag) {
        if (context === "appointment") {
          if (isOverlapping()) {
            alert("⚠️ Time slot overlaps with an existing appointment.");
            return;
          }

          await axiosInstance.post(`/api/appointments/book/${patientId}`, {
            visitDate: appointmentDate,
            startTime,
            endTime,
            reasonForVisit: reason,
           doctorId: doctorId 
          });
        } else {
          await axiosInstance.post(`/api/surgeries/book/${patientId}`, {
            surgeryDate,
            surgeryTime,
            surgeryType,
            status
          });
        }
      }

      alert("✅ Patient registered successfully" + (bookFlag ? ` and ${context} booked.` : ''));
      navigate(context === "surgery" ? "/surgery" : "/patients");
    } catch (err) {
      console.error("❌ Error registering patient:", err);
      alert("❌ Failed to register patient.");
    }
  };

  return (
    <div className="register-background">
      <div className="container-one">
        <div className="patient-form">
          <div className="heading-one">
            <h3 style={{ color: "white" }}>Register New Patient</h3>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="form-one">
              <div className="f-one">
                <label>Patient Name</label>
                <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)} required />
              </div>
              <div className="f-one">
                <label>Phone Number</label>
                <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required maxLength={10} />
              </div>
            </div>

            <div className="form-one">
              <div className="f-one">
                <label>Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => {
                  const selectedDob = e.target.value;
                  setDob(selectedDob);
                  if (selectedDob) {
                    const ageStr = calculateAge(selectedDob);
                    setAgeDisplay(ageStr);
                    setAge(ageStr);
                  }
                }} required />
              </div>
              <div className="f-one">
                <label>Age</label>
                <input type="text" value={ageDisplay} readOnly />
              </div>
            </div>

            <div className="form-one">
              <div className="f-one">
                <label>Gender</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select</option>
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="f-one">
                <label>Marital Status</label>
                <select value={maritalStatus} onChange={(e) => setMaritalStatus(e.target.value)} required>
                  <option value="">Select</option>
                  <option>Single</option>
                  <option>Married</option>
                  <option>Divorced</option>
                </select>
              </div>
            </div>

            <div className="f-two">
  <label>Address</label>
  <textarea value={address} onChange={(e) => setAddress(e.target.value)} required />
</div>


            {context && (
              <div className="checks">
                <input type="checkbox" className="box" id="booking" checked={bookFlag} onChange={() => setBookFlag(!bookFlag)} />
                <label htmlFor="booking" className="form-check-labels">
                  Book {context === 'appointment' ? 'Appointment' : 'Surgery'}
                </label>
              </div>
            )}

            {bookFlag && context === 'appointment' && (
              <>
                <div className="form-one">
                  <div className="f-one">
                    <label>Date</label>
                    <input type="date" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} required />
                  </div>
                  <div className="f-one">
                    <label>Reason</label>
                    <input type="text" value={reason} onChange={(e) => setReason(e.target.value)} required />
                  </div>
                </div>

                <div className="form-one">
                  <div className="f-one">
                    <label>Start Time</label>
                    <input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                  </div>
                  <div className="f-one">
                    <label>End Time</label>
                    <input type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                  </div>
                </div>

                <div className="f-one">
                  <label>Doctor</label>
                  <select value={doctorId} onChange={(e) => setDoctorId(e.target.value)} required>
                    <option value="">Select Doctor</option>
                    {doctors.map((doc) => (
                      <option key={doc.doctorId} value={doc.doctorId}>
                        {doc.doctorName} ({doc.departmentName})
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            {bookFlag && context === 'surgery' && (
              <>
                <div className="form-one">
                  <div className="f-one">
                    <label>Surgery Date</label>
                    <input type="date" value={surgeryDate} onChange={(e) => setSurgeryDate(e.target.value)} required />
                  </div>
                  <div className="f-one">
                    <label>Surgery Time</label>
                    <input type="time" value={surgeryTime} onChange={(e) => setSurgeryTime(e.target.value)} required />
                  </div>
                </div>

                <div className="form-one">
                  <div className="f-one">
                    <label>Surgery Type</label>
                    <input type="text" value={surgeryType} onChange={(e) => setSurgeryType(e.target.value)} required />
                  </div>
                  <div className="f-one">
                    <label>Status</label>
                    <select value={status} onChange={(e) => setStatus(e.target.value)}>
                      <option value="Scheduled">Scheduled</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            <div className="f-four">
              <button
                type="button"
                className="btn-back"
                onClick={() => {
                  const role = localStorage.getItem("role");
                  navigate(role === "DOCTOR" ? '/doctor-dashboard' : '/patients');
                }}
              >
                Back
              </button>

              <button type="submit" className="btn-end">
                Register {bookFlag ? ` & Book ${context === 'appointment' ? 'Appointment' : 'Surgery'}` : ''}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPatient;
