import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Medications.css";

const SurgeryMedication = () => {
  const { patientId, surgeryId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);
  const [formData, setFormData] = useState({
    diagnosis: '',
    reasonForSurgery: '',
    followUpDate: '',
    medicines: [
      { medicineName: '', dosage: '', durationInDays: '', frequency: '' },
    ],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const medRes = await axiosInstance.get(`/api/surgery-medications/by-surgery/${surgeryId}`);
        const medData = medRes.data || {};
        setFormData(prev => ({
          ...prev,
          diagnosis: medData.diagnosis || '',
          reasonForSurgery: medData.reasonForSurgery || '',
          followUpDate: medData.date || '',
        }));
        setLogs(medData.logs || []);
      } catch (err) {
        console.error("❌ Medication logs fetch error:", err);
      }

      try {
        const surgRes = await axiosInstance.get(`/api/surgeries/${surgeryId}`);
        const surg = surgRes.data || {};
        setFormData(prev => ({
          ...prev,
          reasonForSurgery: prev.reasonForSurgery || surg.reason || '',
          followUpDate: prev.followUpDate || (surg.surgeryDate?.split('T')[0] || ''),
        }));
      } catch (err) {
        console.error("❌ Surgery fetch error:", err);
        alert("Error loading surgery details.");
      }
    };

    fetchData();
  }, [surgeryId]);

  const toggleLogs = (date) => {
    setExpandedDate(prev => (prev === date ? null : date));
  };

  const handleChange = (e, idx, field) => {
    const updated = [...formData.medicines];
    updated[idx][field] = e.target.value;
    setFormData({ ...formData, medicines: updated });
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { medicineName: '', dosage: '', durationInDays: '', frequency: '' }],
    }));
  };

  const removeMedicine = (idx) => {
    setFormData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        diagnosis: formData.diagnosis,
        reasonForSurgery: formData.reasonForSurgery,
        followUpDate: formData.followUpDate,
        medicines: formData.medicines.map(m => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          durationInDays: parseInt(m.durationInDays, 10) || 0,
          frequency: m.frequency,
        })),
      };

      await axiosInstance.post(`/api/surgery-medications/by-surgery/${surgeryId}`, payload);
      alert("✅ Medications saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("❌ Save error:", err);
      alert("❌ Failed to save medications");
    }
  };

  return (
    <div className='medication-background'>
      <div className="container mt-4">
        <h2>Surgery Medication Prescription</h2>

        <form onSubmit={handleSubmit} className="mb-4">
          <input
            className="form-control mb-2"
            placeholder="Reason for Surgery"
            value={formData.reasonForSurgery || ''}
            disabled
          />
          <input
            type="date"
            className="form-control mb-2"
            value={formData.followUpDate}
            onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
          />
          <input
            className="form-control mb-2"
            placeholder="Diagnosis"
            value={formData.diagnosis}
            onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
            required
          />

          {formData.medicines.map((m, idx) => (
            <div key={idx} className="border rounded p-3 mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-3">
                  <input className="form-control" placeholder="Medicine Name" value={m.medicineName}
                    onChange={(e) => handleChange(e, idx, 'medicineName')} required />
                </div>
                <div className="col-md-2">
                  <input className="form-control" placeholder="Dosage" value={m.dosage}
                    onChange={(e) => handleChange(e, idx, 'dosage')} required />
                </div>
                <div className="col-md-2">
                  <input className="form-control" placeholder="Duration (days)" value={m.durationInDays}
                    onChange={(e) => handleChange(e, idx, 'durationInDays')} required />
                </div>
                <div className="col-md-3">
                  <input className="form-control" placeholder="Frequency (e.g. 1-0-1)" value={m.frequency}
                    onChange={(e) => handleChange(e, idx, 'frequency')} />
                </div>
                <div className="col-md-2">
                  {formData.medicines.length > 1 && (
                    <button type="button" className="btn btn-danger" onClick={() => removeMedicine(idx)}>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-secondary me-2" onClick={addMedicine}>
            + Add Medicine
          </button>
          <button type="submit" className="btn-med">Submit</button>
          <button type="button" className="btn-back" onClick={() => navigate('/surgery')}>
            Back
          </button>
        </form>

        <h3>Past Medication Logs</h3>
        {logs.length === 0 ? (
          <p>No prescriptions available.</p>
        ) : (
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Reason</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>{log.date || 'N/A'}</td>
                    <td>{log.reasonForSurgery || 'N/A'}</td>
                    <td>{log.diagnosis || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => toggleLogs(log.date)}
                      >
                        {expandedDate === log.date ? 'Hide' : 'View'}
                      </button>
                    </td>
                  </tr>
                  {expandedDate === log.date && (
                    <tr>
                      <td colSpan="4">
                        <table className="table table-sm table-striped mb-0">
                          <thead>
                            <tr>
                              <th>Medicine Name</th>
                              <th>Dosage</th>
                              <th>Duration</th>
                              <th>Frequency</th>
                            </tr>
                          </thead>
                          <tbody>
                            {log.medicines.map((m, i) => (
                              <tr key={i}>
                                <td>{m.medicineName || '-'}</td>
                                <td>{m.dosage || '-'}</td>
                                <td>{m.durationInDays || '-'}</td>
                                <td>{m.frequency || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SurgeryMedication;
