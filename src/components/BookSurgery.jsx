import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import "../css/BookSurgery.css";

const BookSurgery = () => {
  const [doctors, setDoctors] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [noteInput, setNoteInput] = useState('');

  const [formData, setFormData] = useState({
    patientId: '',
    doctorId: '',
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    status: 'Scheduled',
    reasonForSurgery: '',
    remarks: '',
    note: [],
    followUpDate: ''
  });

  const navigate = useNavigate();

  useEffect(() => {
    axiosInstance.get('/api/doctors')
      .then((res) => setDoctors(Array.isArray(res.data) ? res.data : []))
      .catch((err) => console.error("❌ Doctor fetch failed:", err));
  }, []);

  const fetchTodayPatients = async () => {
    if (inputValue.trim() === '') {
      try {
        const res = await axiosInstance.get('/api/patients/registered-today');
        setSuggestions(Array.isArray(res.data) ? res.data : []);
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
                <label className="form-label">Search Patient</label>
                <input
                  type="text"
                  className="dark-input-p"
                  list="patient-suggestions"
                  placeholder="Type patient name"
                  value={inputValue}
                  onClick={fetchTodayPatients}
                  onChange={handleInputChange}
                  required
                />
                <datalist id="patient-suggestions">
                  {suggestions.map((p, i) => (
                    <option key={i} value={`${p.patientName} - ${p.phoneNumber}`} />
                  ))}
                </datalist>
              </div>

              <div className="nbl">
                <label className="form-label">Select Doctor</label>
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
                <label className="form-label">Surgery Date</label>
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
                <label className="form-label">Surgery Time</label>
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
              <label className="form-label">Surgery Type</label>
              <input
                type="text"
                name="surgeryType"
                className="dark-input-text"
                placeholder="e.g., Appendectomy"
                value={formData.surgeryType}
                onChange={handleChange}
              />
            </div>

            <div className="mel">
              <label className="form-label">Reason</label>
             <input
              type="text"
              name="reasonForSurgery"    // ✅ correct name
              className="dark-input-text"
              placeholder="e.g., Gallstones"
              value={formData.reasonForSurgery}
              onChange={handleChange}
            />

            </div>
                  
            <div className="mel">
              <label className="form-label">Remarks</label>
              <input
                type="text"
                name="remarks"
                className="dark-input-text"
                placeholder="Any special instructions"
                value={formData.remarks}
                onChange={handleChange}
              />
            </div>

            <div className="mel">
              <label className="form-label">Follow-Up Date</label>
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
                    <span className="remove-tag" onClick={() => removeNote(idx)}>×</span>
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
