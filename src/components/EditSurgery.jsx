import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../css/EditSurgery.css'; // ✅ Same CSS used in BookSurgery

const EditSurgery = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    surgeryDate: '',
    surgeryTime: '',
    surgeryType: '',
    status: 'Scheduled',
    reasonForSurgery: '',
    remarks: '',
    followUpDate: '',
    note: []
  });

  const [noteInput, setNoteInput] = useState('');

  useEffect(() => {
    axiosInstance.get(`/api/surgery-appointments/by-id/${id}`)
      .then(res => {
        const data = res.data;
        if (!Array.isArray(data.note)) {
          data.note = [];
        }
        setFormData(data);
      })
      .catch(() => alert("❌ Failed to load appointment"));
  }, [id]);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleNoteKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const newNote = noteInput.trim();
      if (newNote && !formData.note.includes(newNote)) {
        setFormData(prev => ({ ...prev, note: [...prev.note, newNote] }));
        setNoteInput('');
      }
    }
  };

  const removeNote = (noteToRemove) => {
    setFormData(prev => ({
      ...prev,
      note: prev.note.filter(n => n !== noteToRemove)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/api/surgery-appointments/by-patient/${id}`, formData);
      alert("✅ Updated successfully");
      navigate('/surgery');
    } catch (err) {
      console.error("❌ Update failed:", err);
      alert("❌ Update failed");
    }
  };

  return (
    <div className="surgery-book">
      <div className="container-seven">
        <div className="heading-surgerybook">
          <h2>Edit Surgery Appointment</h2>
        </div>

        <form onSubmit={handleSubmit} className="surgery-form">
          <div className="booking-one mb-3">
            <div>
              <label>Surgery Date</label>
              <input
                type="date"
                name="surgeryDate"
                className="form-control surgerydate"
                value={formData.surgeryDate}
                onChange={handleChange}
                required
              />
            </div>

            <div >
              <label>Surgery Time</label>
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

          <div className="mb-3 w-100">
            <label>Surgery Type</label>
            <input
              type="text"
              name="surgeryType"
              className="form-control"
              value={formData.surgeryType}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3 w-100">
            <label>Status</label>
            <select
              name="status"
              className="form-select"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Scheduled">Scheduled</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="mb-3 w-100">
            <label>Reason for Surgery</label>
            <input
              type="text"
              name="reasonForSurgery"
              className="form-control"
              value={formData.reasonForSurgery}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 w-100">
            <label>Remarks</label>
            <input
              type="text"
              name="remarks"
              className="form-control"
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 w-100">
            <label>Follow-Up Date</label>
            <input
              type="date"
              name="followUpDate"
              className="form-control"
              value={formData.followUpDate || ''}
              onChange={handleChange}
            />
          </div>

          <div className="mb-3 w-100">
            <label>Notes</label>
            <div className="tags-input-container">
              {formData.note.map((n, index) => (
                <div key={index} className="tag-item">
                  {n}
                  <span className="remove-tag" onClick={() => removeNote(n)}>×</span>
                </div>
              ))}
              <input
                type="text"
                className="tag-input"
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                onKeyDown={handleNoteKeyDown}
                placeholder="Type and press Enter or comma"
              />
            </div>
          </div>

          <div className="btn-center">
            <button type="submit" className="bookingbtn">Update</button>
                <button type="button" className="bookingbtnb" onClick={() => navigate('/surgery')}>
            ← Back
          </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditSurgery;
