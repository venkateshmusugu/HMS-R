import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const SurgeryMedication = () => {
  const { patientId, surgeryId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [expandedIndex, setExpandedIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    diagnosis: '',
    reasonForSurgery: '',
    followUpDate: '',
    medicines: [{ medicineName: '', dosage: '', duration: '', comments: '' }],
  });

  useEffect(() => {
    if (!patientId || !surgeryId) {
      alert('❌ Missing patient or surgery ID.');
      navigate('/surgery');
      return;
    }

    const fetchData = async () => {
      try {
        const [logsRes, surgeryRes] = await Promise.all([
          axiosInstance.get(`/api/surgery-medications/by-surgery/${surgeryId}`),
          axiosInstance.get(`/api/surgeries/${surgeryId}`)
        ]);

        setLogs(logsRes.data || []);
        const surgery = surgeryRes.data;

        setFormData(prev => ({
          ...prev,
          reasonForSurgery: surgery.reason || '',
          followUpDate: surgery.surgeryDate?.split('T')[0] || '',
        }));
      } catch (err) {
        console.error('❌ Failed to fetch surgery data:', err);
        alert('Error loading surgery information.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patientId, surgeryId, navigate]);

  const toggleLogs = (index) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleChange = (e, index, field) => {
    const updated = [...formData.medicines];
    updated[index][field] = e.target.value;
    setFormData({ ...formData, medicines: updated });
  };

  const handleAddMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { medicineName: '', dosage: '', duration: '', comments: '' }],
    });
  };

  const handleRemoveMedicine = (index) => {
    const updated = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      for (const med of formData.medicines) {
        const payload = {
          surgeryAppointmentId: surgeryId,
          name: med.medicineName,
          dosage: med.dosage,
          frequency: med.duration,
          duration: med.duration,         // ← Explicitly add
          comments: med.comments,         // ← Now included
          diagnosis: formData.diagnosis,
          date: formData.followUpDate,
        };
        await axiosInstance.post(`/api/surgery-medications/by-surgery/${surgeryId}`, payload);
        console.log('Sending payload:', payload);

      }

      alert('✅ Surgery medication saved!');
      navigate(-1);
    } catch (err) {
      console.error('❌ Error saving medication:', err);
      alert('❌ Failed to save medication.');
    }
  };

  if (loading) return <p className="text-center mt-5">Loading surgery details...</p>;

  return (
    <div className="container mt-4">
      <h2>Surgery Medication Prescription</h2>

      <form onSubmit={handleSubmit} className="mb-4">
        <input
          className="form-control mb-2"
          placeholder="Reason for Surgery"
          value={formData.reasonForSurgery}
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
            <div className="row g-2">
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
                  placeholder="Duration"
                  value={medicine.duration}
                  onChange={(e) => handleChange(e, index, 'duration')}
                  required
                />
              </div>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Comments"
                  value={medicine.comments}
                  onChange={(e) => handleChange(e, index, 'comments')}
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
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>

      <h3>Past Surgery Medication Logs</h3>
      {logs.length === 0 ? (
        <p>No past prescriptions available.</p>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Reason for Surgery</th>
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
                      onClick={() => toggleLogs(index)}
                    >
                      {expandedIndex === index ? 'Hide Prescription' : 'View Prescription'}
                    </button>
                  </td>
                </tr>
                {expandedIndex === index && (
                  <tr>
                    <td colSpan="4">
                      <div className="p-2 bg-light border rounded mb-2">
                        <strong>Prescription Details:</strong>
                      </div>
                      <table className="table table-sm table-striped mb-0">
                        <thead>
                          <tr>
                            <th>Medicine Name</th>
                            <th>Dosage</th>
                            <th>Duration</th>
                            <th>Comments</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(log.medicines || []).map((med, idx) => (
                            <tr key={idx}>
                              <td>{med.medicineName}</td>
                              <td>{med.dosage}</td>
                              <td>{med.duration}</td>
                              <td>{med.comments}</td>
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
  );
};

export default SurgeryMedication;
