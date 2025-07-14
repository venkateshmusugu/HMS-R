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
      {
        medicineName: '',
        dosage: '',
        durationInDays: '',
        frequency: '',
      },
    ],
  });

  useEffect(() => {
  // Step 1: Load any existing medication logs
  axiosInstance.get(`/api/surgery-medications/by-surgery/${surgeryId}`)
    .then(res => {
      const data = res.data;
      setFormData(prev => ({
        ...prev,
        diagnosis: data.diagnosis || '',
        reasonForSurgery: data.reasonForSurgery || '',
        followUpDate: data.date || ''
      }));
      setLogs(data.logs || []);
    })
    .catch(err => console.error("❌ Failed to fetch logs:", err));

  // Step 2: Fallback load from surgery
  axiosInstance.get(`/api/surgeries/${surgeryId}`)
    .then(res => {
      const surgery = res.data;
      setFormData(prev => ({
        ...prev,
        reasonForSurgery: prev.reasonForSurgery || surgery.reason || '',
        followUpDate: prev.followUpDate || (surgery.surgeryDate ? surgery.surgeryDate.split('T')[0] : '')
      }));
    })
    .catch(err => {
      console.error("❌ Failed to fetch surgery:", err);
      alert("Error loading surgery details.");
    });
}, [surgeryId]);


  const toggleLogs = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const handleChange = (e, index, field) => {
    const updated = [...formData.medicines];
    updated[index][field] = e.target.value;
    setFormData({ ...formData, medicines: updated });
  };

  const handleAddMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { medicineName: '', dosage: '', durationInDays: '', frequency: '' }],
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

        const payload = {
        diagnosis: formData.diagnosis,
        reasonForSurgery: formData.reasonForSurgery,
        followUpDate: formData.followUpDate,
        medicines: formData.medicines.map((med) => ({
        medicineName: med.medicineName,
        dosage: med.dosage,
        durationInDays: parseInt(med.durationInDays, 10) || 0,
        frequency: med.frequency,
      })),
    };

try {
  await axiosInstance.post(`/api/surgery-medications/by-surgery/${surgeryId}`, payload);
  console.log("Submitting payload:", payload);

      alert("✅ Medications saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("❌ Error saving medications:", err);
      alert("Failed to save medications");
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
            value={formData.reasonForSurgery || 'Reason not specified'}
            disabled
          />

          <input
            type="date"
            className="form-control mb-2"
            value={formData.followUpDate}
            onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
          />
          <input
            className="form-control mb-2"
            placeholder="Diagnosis"
            value={formData.diagnosis}
            onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            required
          />

          {formData.medicines.map((medicine, index) => (
            <div key={index} className="border rounded p-3 mb-3">
              <div className="row g-2 align-items-center">
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Medicine Name"
                    value={medicine.medicineName}
                    onChange={(e) => handleChange(e, index, 'medicineName')}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    placeholder="Dosage"
                    value={medicine.dosage}
                    onChange={(e) => handleChange(e, index, 'dosage')}
                    required
                  />
                </div>
                <div className="col-md-2">
                  <input
                    className="form-control"
                    placeholder="Duration (in days)"
                    value={medicine.durationInDays}
                    onChange={(e) => handleChange(e, index, 'durationInDays')}
                    required
                  />
                </div>
                <div className="col-md-3">
                  <input
                    className="form-control"
                    placeholder="Frequency (e.g. 1-0-1)"
                    value={medicine.frequency}
                    onChange={(e) => handleChange(e, index, 'frequency')}
                  />
                </div>
                <div className="col-md-2">
                  {formData.medicines.length > 1 && (
                    <button
                      type="button"
                      className="btn btn-danger"
                      onClick={() => handleRemoveMedicine(index)}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          <button type="button" className="btn btn-secondary me-2" onClick={handleAddMedicine}>
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
                            {log.medicines.map((med, medIndex) => (
                              <tr key={medIndex}>
                                <td>{med.medicineName || '-'}</td>
                                <td>{med.dosage || '-'}</td>
                                <td>{med.durationInDays || '-'}</td>
                                <td>{med.frequency || '-'}</td>
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
