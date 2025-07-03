import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import "../css/BookSurgery.css";

const BookSurgery = () => {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    status: 'Scheduled',
    reason: '',
    remarks: '',
    note: [],
    followUpDate: ''
  });

  const [noteInput, setNoteInput] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/doctors')
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("❌ Doctor fetch failed:", err));
  }, []);

  useEffect(() => {
    axiosInstance.get('/api/patients')
      .then((res) => {
        if (Array.isArray(res.data)) {
          setPatients(res.data);
        } else {
          console.error("❌ Expected array but got:", typeof res.data);
          setPatients([]);
        }
      })
      .catch((err) => {
        console.error("❌ API error:", err);
        setPatients([]);
      });
  }, []);

  const handleNoteKeyDown = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && noteInput.trim()) {
      e.preventDefault();
      const newNote = noteInput.trim();
      if (!formData.note.includes(newNote)) {
        setFormData((prev) => ({
          ...prev,
          note: [...prev.note, newNote]
        }));
      }
      setNoteInput('');
    }
  };

  const removeNote = (index) => {
    setFormData((prev) => ({
      ...prev,
      note: prev.note.filter((_, i) => i !== index),
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "surgeryTime" && formData.surgeryDate) {
      const selectedDate = new Date(formData.surgeryDate);
      const today = new Date();
      const isToday = selectedDate.toDateString() === today.toDateString();

      if (isToday) {
        const currentTime = today.toTimeString().slice(0, 5);
        if (value < currentTime) {
          alert("⚠️ Please select a time from now onwards.");
          return;
        }
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.patientId || !formData.doctorId) {
      alert("❗ Please select both patient and doctor.");
      return;
    }

    try {
      await axiosInstance.post(`/api/surgery-appointments/book/${formData.patientId}`, formData);
      alert("✅ Surgery appointment booked.");
      navigate('/surgery');
    } catch (err) {
      console.error("❌ Booking failed:", err);
      alert("❌ Booking failed.");
    }
  };

  return (
    <div className='surgery-book'>
      <div className="container-se">
        <h2 className="heading-surgerybook-one">Book Surgery Appointment</h2>
        <div className='surgeryform'>
          <form onSubmit={handleSubmit}>
          <div className="booking-other">
  <div className="nbl">
    <label htmlFor="patientId" className="form-label">Select Patient</label>
    <select
      name="patientId"
      className="dark-select-p"
      value={formData.patientId}
      onChange={handleChange}
      required
    >
      <option value="">-- Select Patient --</option>
      {patients.map(p => (
        <option key={p.patientId} value={p.patientId}>{p.patientName}</option>
      ))}
    </select>
  </div>

  <div className="nbl">
    <label htmlFor="doctorId" className="form-label">Select Doctor</label>
    <select
      name="doctorId"
      className="dark-select-p"
      value={formData.doctorId}
      onChange={handleChange}
      required
    >
      <option value="">-- Select Doctor --</option>
      {doctors.map((d) => (
        <option key={d.doctorId} value={d.doctorId}>
          {d.doctorName} ({d.departmentName})
        </option>
      ))}
    </select>
  </div>
</div>


            <div className='booking-other'>
              <div className="nbl">
                <label htmlFor="surgeryDate" className="form-label surgerydate">Surgery Date</label>
                <input
                  type="date"
                  name="surgeryDate"
                  value={formData.surgeryDate}
                  onChange={handleChange}
                  required
                  className="dark-input-p"
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              <div className="nbl">
                <label htmlFor="surgeryTime" className="form-label">Surgery Time</label>
                <input
                  type="time"
                  name="surgeryTime"
                  className="form-control surgerytime"
                  value={formData.surgeryTime}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="mel">
              <label htmlFor="surgeryType" className="form-label">Surgery Type</label>
              <input
                type="text"
                name="surgeryType"
                className="dark-input-text"
                placeholder="surgery type"
                value={formData.surgeryType}
                onChange={handleChange}
              />
            </div>

            <div className="mel">
              <label htmlFor="reason" className="form-label">Reason for Surgery</label>
              <input
                type="text"
                name="reason"
                className="dark-input-text"
                placeholder="e.g., Appendicitis"
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            <div className="mel">
              <label htmlFor="remarks" className="form-label">Remarks</label>
              <input
                type="text"
                name="remarks"
                className="dark-input-text"
                placeholder="e.g., Monitor post-op recovery"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="mel">
              <label htmlFor="followUpDate" className="form-label">Follow-Up Date</label>
              <input
                type="date"
                name="followUpDate"
                className="dark-input-p1"
                value={formData.followUpDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>

           <div className="notes-field">
  <label className="label-notes">Notes</label>
  <div className="tags-input-container">
    {formData.note.map((n, idx) => (
      <span key={idx} className="tag">
        {n}
        <span
          className="remove-tag"
          onClick={() => removeNote(idx)}
        >
          ×
        </span>
      </span>
    ))}
    <input
      type="text"
      className="dark-tag-input"
      value={noteInput}
      onChange={(e) => setNoteInput(e.target.value)}
      onKeyDown={handleNoteKeyDown}
      placeholder="Type and press Enter or comma"
    />
  </div>
</div>

            <div className='btn-center'>
              <button type="button" className="btn-back" onClick={() => navigate('/surgery')}>
                Back
              </button>
              <button type="submit" className="btn bookingbtn" disabled={!formData.patientId}>
                Book Surgery
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookSurgery;
