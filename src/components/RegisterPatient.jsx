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
  const [maritalStatus, setMaritalStatus] = useState('');
  const [caseDescription, setCaseDescription] = useState('');

  const [context, setContext] = useState('');
  const [bookFlag, setBookFlag] = useState(false);

  // Appointment booking
  const [appointmentDate, setAppointmentDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [reason, setReason] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [doctors, setDoctors] = useState([]);

  // Surgery booking
  const [surgeryDate, setSurgeryDate] = useState('');
  const [medication, setMedication] = useState('');
  const [surgeryReason, setSurgeryReason] = useState('');
  const [remarks, setRemarks] = useState('');

  const navigate = useNavigate();
  const location = useLocation();
  const [surgeryTime, setSurgeryTime] = useState('');
const [surgeryType, setSurgeryType] = useState('');
const [status, setStatus] = useState('Scheduled');

  const role = localStorage.getItem("role");

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
        caseDescription,
      };
      const { data } = await axiosInstance.post("/api/patients", patientPayload);
      const patientId = data.patientId;

      if (bookFlag) {
        if (context === "appointment") {
          await axiosInstance.post(`/api/appointments/book/${patientId}`, {
            visitDate: appointmentDate,
            startTime,
            endTime,
            reasonForVisit: reason,
            doctor: { doctorId }
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
                <label>Age</label>
                <input type="number" value={age} onChange={(e) => setAge(e.target.value)} required />
              </div>
              <div className="f-one">
                <label>Date of Birth</label>
                <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} required />
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
              <label>Case Description</label>
              <textarea value={caseDescription} onChange={(e) => setCaseDescription(e.target.value)} />
            </div>

            {context && (
              <div className="checks">
                <input
                  type="checkbox"
                  className="box"
                  id="booking"
                  checked={bookFlag}
                  onChange={() => setBookFlag(!bookFlag)}
                />
                <label htmlFor="booking" className="form-check-labels">
                  Book {context === 'appointment' ? 'Appointment' : 'Surgery'}
                </label>
              </div>
            )}

            {/* Appointment Booking */}
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

            {/* Surgery Booking */}
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

            <div className="f-one">
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
