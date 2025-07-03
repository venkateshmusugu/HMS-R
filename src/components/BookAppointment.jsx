import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Bookappointment.css";

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [existingAppointments, setExistingAppointments] = useState([]);

  const [formData, setFormData] = useState({
    doctorId: '',
    patientId: '',
    visitDate: '',
    startTime: '',
    endTime: '',
    reason: '',
  });

 useEffect(() => {
  axiosInstance.get('/api/doctors')
    .then(res => {
      console.log("👨‍⚕️ Doctors fetched:", res.data); // ✅
      setDoctors(Array.isArray(res.data) ? res.data : []);
    })
    .catch(err => console.error("❌ Error loading doctors:", err));
}, []);


 useEffect(() => {
  if (id) {
    axiosInstance.get(`/api/appointments/${id}`)
      .then(res => {
        console.log("📅 Editing appointment data:", res.data); // ✅
        const a = res.data;
        setFormData({
          doctorId: a.doctor?.doctorId || '',
          patientId: a.patient?.patientId || '',
          visitDate: a.visitDate || '',
          startTime: a.startTime || '',
          endTime: a.endTime || '',
          reason: a.reasonForVisit || '',
        });
        setInputValue(`${a.patient?.patientName} - ${a.patient?.phoneNumber}`);
      })
      .catch(err => {
        console.error("❌ Failed to load appointment:", err);
        alert("Error loading appointment.");
      });
  }
}, [id]);


  useEffect(() => {
    if (formData.doctorId && formData.visitDate) {
      axiosInstance.get('/api/appointments/upcoming', {
        params: {
          date: formData.visitDate,
          doctorId: formData.doctorId
        }
      }).then(res => {
        const all = Array.isArray(res.data) ? res.data : [];
        const filtered = id ? all.filter(a => a.visitId !== parseInt(id)) : all;
        setExistingAppointments(filtered);
      }).catch(err => {
        console.error("❌ Error fetching overlapping checks:", err);
        setExistingAppointments([]);
      });
    }
  }, [formData.doctorId, formData.visitDate]);

  const fetchTodayPatients = async () => {
    if (inputValue.trim() === '') {
      try {
          const res = await axiosInstance.get('/api/patients/registered-today');
    setSuggestions(Array.isArray(res.data) ? res.data : []);
    console.log(res.data);
      } catch (err) {
        console.error("❌ Error fetching today's patients:", err);
      }
    }
  };

  const handleInputChange = async (e) => {
    
  const value = e.target.value;
  setInputValue(value);

  if (value.length >= 2) {
    try {
        const res = await axiosInstance.get(`/api/patients/search?query=${value}`);
        setSuggestions(Array.isArray(res.data) ? res.data : []);
 
      setSuggestions(results);
    } catch (err) {
      console.error("❌ Error searching patients:", err);
    }
  }
};

useEffect(() => {
  if (inputValue && suggestions.length > 0) {
    const matched = suggestions.find(
      p => `${p.patientName} - ${p.phoneNumber}`.toLowerCase() === inputValue.toLowerCase()
    );

    setFormData(prev => ({
      ...prev,
      patientId: matched ? matched.patientId : ''
    }));
  }
}, [inputValue, suggestions]);


  const handleChange = (e) => {
    const { name, value } = e.target;

    if ((name === "startTime" || name === "endTime") && formData.visitDate) {
      const selectedDate = new Date(formData.visitDate);
      const today = new Date();
      const now = new Date();

      const isToday = selectedDate.toDateString() === today.toDateString();
      if (isToday) {
        const currentTime = now.toTimeString().slice(0, 5);
        if (value < currentTime) {
          alert("⚠️ Please select a time from now onwards.");
          return;
        }
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const isOverlapping = () => {
  const { startTime, endTime } = formData;
  console.log("⏱️ Checking overlap with times:", startTime, endTime); // ✅
  console.log("🗂️ Existing appointments:", existingAppointments); // ✅

  return existingAppointments.some(app => {
    const aStart = app.startTime;
    const aEnd = app.endTime;

    return (
      (startTime >= aStart && startTime < aEnd) ||
      (endTime > aStart && endTime <= aEnd) ||
      (startTime <= aStart && endTime >= aEnd)
    );
  });
};


const handleSubmit = async e => {
  e.preventDefault();

  console.log("📝 Submitting formData:", formData); // ✅

  if (!formData.patientId || !formData.doctorId) {
    alert("❗ Please select both doctor and patient from the list.");
    return;
  }

  if (isOverlapping()) {
    alert("⚠️ Time overlaps with another appointment. Please choose a different time.");
    return;
  }

  const payload = {
    visitDate: formData.visitDate,
    startTime: formData.startTime,
    endTime: formData.endTime,
    departmentId: formData.departmentId,
    reasonForVisit: formData.reason,
    doctorId: parseInt(formData.doctorId),
    patientId: parseInt(formData.patientId)
  };

  console.log("📦 Sending payload to API:", payload); // ✅

  try {
    if (id) {
      await axiosInstance.put(`/api/appointments/${id}`, payload);
      console.log("✅ Appointment updated"); // ✅
    } else {
      await axiosInstance.post('/api/appointments', payload);
      console.log("✅ Appointment booked"); // ✅
    }
    const role = localStorage.getItem('role');
    navigate(role === 'DOCTOR' ? '/doctor-dashboard' : '/patients');
  } catch (err) {
    console.error("❌ Failed to save appointment:", err);
    alert("❌ Failed to save appointment");
  }
};


  return (
    <div className="book-appointment">
      <div className="container-five">
        <div className="appointmentform">
          <div className="heading-2"><h2>Book Appointment</h2></div>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Search Patient</label>
              <input
              type="text"
              className="form-control data"
              list="patient-suggestions"
              placeholder="Type patient name"
              value={inputValue}
              onClick={fetchTodayPatients}
              onChange={handleInputChange}
            />

             <datalist id="patient-suggestions">
              {(Array.isArray(suggestions) ? suggestions : []).map((p, i) => (
                <option key={i} value={`${p.patientName} - ${p.phoneNumber}`} />
              ))}
            </datalist>

            </div>

            <div className="mb-3">
              <label>Doctor</label>
              <select
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                required
                className="select-doctor"
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
              <input
                type="date"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                required
                className="enter-date"
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

            <div className="mb-3">
              <label>Start Time</label>
              <input
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                className="form-control select"
              />
            </div>

            <div className="mb-3">
              <label>End Time</label>
              <input
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                className="form-control select"
              />
            </div>

            <div className="mb-3">
              <label>Reason</label>
              <input
                type="text"
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                className="form-control data"
                placeholder="Reason for visit"
              />
            </div>
            <div className='end_appoint'>
            <button
              type="button"
              className="btn-back black"
              onClick={() => {
                const role = localStorage.getItem("role");
                navigate(role === "DOCTOR" ? '/doctor-dashboard' : '/patients');
              }}
            >
              Back
            </button>

            <button type="submit" className="btn-blue">Book Appointment</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
