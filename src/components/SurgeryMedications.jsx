import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const SurgeryMedications = () => {
  const { surgeryId } = useParams();
  const [medications, setMedications] = useState([]);
  const [form, setForm] = useState({
    name: '',
    dosage: '',
    frequency: '',
    durationInDays: '',
  });

  const fetchMedications = () => {
    axiosInstance.get(`/api/surgery-medications/by-surgery/${surgeryId}`)
      .then(res => setMedications(res.data))
      .catch(err => console.error("❌ Error:", err));
  };

  useEffect(() => {
    fetchMedications();
  }, [surgeryId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      surgeryAppointmentId: surgeryId,
      date: new Date().toISOString().split("T")[0],
    };
    axiosInstance.post('/api/surgery-medications', payload)
      .then(() => {
        fetchMedications();
        setForm({ name: '', dosage: '', frequency: '', durationInDays: '' });
      })
      .catch(err => console.error("❌ Failed to save:", err));
  };

  return (
    <div className="container mt-4">
      <h3>Surgery Medications</h3>
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="row">
          <div className="col">
            <input className="form-control" placeholder="Name" value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })} required />
          </div>
          <div className="col">
            <input className="form-control" placeholder="Dosage" value={form.dosage}
              onChange={e => setForm({ ...form, dosage: e.target.value })} required />
          </div>
          <div className="col">
            <input className="form-control" placeholder="Frequency" value={form.frequency}
              onChange={e => setForm({ ...form, frequency: e.target.value })} required />
          </div>
          <div className="col">
            <input className="form-control" type="number" placeholder="Days" value={form.durationInDays}
              onChange={e => setForm({ ...form, durationInDays: e.target.value })} required />
          </div>
          <div className="col">
            <button className="btn btn-primary w-100">Add</button>
          </div>
        </div>
      </form>

      <h5>Previous Medications</h5>
      <ul className="list-group">
        {medications.map((med, idx) => (
          <li key={idx} className="list-group-item">
            {med.name} - {med.dosage} - {med.frequency} - {med.durationInDays} days
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SurgeryMedications;
