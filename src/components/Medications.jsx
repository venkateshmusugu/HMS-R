import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const Medications = () => {
  const { patientId, apptId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null); // For date-based toggle
  const [formData, setFormData] = useState({
    reasonForVisit: '',
    diagnosis: '',
    followUpRequired: false,
    followUpDate: '',
    testType: '',
    medicines: [{
      name: '', dosage: '', frequency: '', durationInDays: 1
    }]
  });

  useEffect(() => {
    axiosInstance.get(`/api/doctor-logs/by-patient/${patientId}`)
      .then(res => setLogs(res.data))
      .catch(console.error);
  }, [patientId]);

  const handleMedicineChange = (index, field, value) => {
    const newMeds = [...formData.medicines];
    newMeds[index][field] = value;
    setFormData({ ...formData, medicines: newMeds });
  };

  const addMedicine = () => {
    setFormData({
      ...formData,
      medicines: [...formData.medicines, { name: '', dosage: '', frequency: '', durationInDays: 1 }]
    });
  };

  const removeMedicine = (index) => {
    const newMeds = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: newMeds });
  };

  const handleSubmit = async () => {
    try {
      await axiosInstance.post(`/api/doctor-logs/by-appointment/${apptId}`, formData);
      alert("Log saved!");
      setFormData({
        reasonForVisit: '',
        diagnosis: '',
        followUpRequired: false,
        followUpDate: '',
        testType: '',
        medicines: [{ name: '', dosage: '', frequency: '', durationInDays: 1 }]
      });
      const res = await axiosInstance.get(`/api/doctor-logs/by-patient/${patientId}`);
      setLogs(res.data);
    } catch (err) {
      console.error(err);
      alert("Error saving log");
    }
  };

  return (
    <div className="container mt-4">
      <button className="btn btn-secondary mb-3" onClick={() => navigate(-1)}>Back</button>
      <h2>Medication History (Patient #{patientId})</h2>

      <div className="accordion mb-3" id="medicationHistoryAccordion">
        {logs.map((log, index) => {
          const dateKey = log.date || `log-${index}`;
          const isOpen = expandedDate === dateKey;

          return (
            <div className="card mb-2" key={index}>
              <div className="card-header d-flex justify-content-between align-items-center">
                <button
                  className="btn btn-link fw-bold"
                  onClick={() => setExpandedDate(isOpen ? null : dateKey)}
                >
                  📅 {log.date || 'Unknown Date'}
                </button>
              </div>

              {isOpen && (
                <div className="card-body">
                  {log.medicines?.length ? (
                    <table className="table table-bordered table-striped">
                      <thead className="thead-dark">
                        <tr>
                          <th>Medicine Name</th>
                          <th>Dosage</th>
                          <th>Frequency</th>
                          <th>Duration (Days)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {log.medicines.map((med, idx) => (
                          <tr key={idx}>
                            <td>{med.name}</td>
                            <td>{med.dosage}</td>
                            <td>{med.frequency}</td>
                            <td>{med.durationInDays}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <p>No medicines prescribed.</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-light p-3 rounded">
        <h5>Add New Prescription</h5>
        <input className="form-control mb-2" placeholder="Reason for Visit"
          value={formData.reasonForVisit}
          onChange={e => setFormData({ ...formData, reasonForVisit: e.target.value })}
        />
        <input className="form-control mb-2" placeholder="Diagnosis"
          value={formData.diagnosis}
          onChange={e => setFormData({ ...formData, diagnosis: e.target.value })}
        />
        <input className="form-control mb-2" placeholder="Test Type"
          value={formData.testType}
          onChange={e => setFormData({ ...formData, testType: e.target.value })}
        />

        <label className="mb-2">
          <input type="checkbox"
            className="me-2"
            checked={formData.followUpRequired}
            onChange={e => setFormData({ ...formData, followUpRequired: e.target.checked })}
          /> Follow-up Required
        </label>
        {formData.followUpRequired &&
          <input type="date"
            className="form-control mb-2"
            value={formData.followUpDate}
            onChange={e => setFormData({ ...formData, followUpDate: e.target.value })}
          />
        }

        <h6 className="mt-3">Medicines</h6>
        {formData.medicines.map((med, idx) => (
          <div key={idx} className="d-flex gap-2 mb-2">
            <input placeholder="Name" className="form-control"
              value={med.name} onChange={e => handleMedicineChange(idx, 'name', e.target.value)} />
            <input placeholder="Dosage" className="form-control"
              value={med.dosage} onChange={e => handleMedicineChange(idx, 'dosage', e.target.value)} />
            <input placeholder="Frequency" className="form-control"
              value={med.frequency} onChange={e => handleMedicineChange(idx, 'frequency', e.target.value)} />
            <input type="number" placeholder="Days" className="form-control"
              value={med.durationInDays} onChange={e => handleMedicineChange(idx, 'durationInDays', parseInt(e.target.value))} />
            <button className="btn btn-danger" onClick={() => removeMedicine(idx)}>Remove</button>
          </div>
        ))}
        <button className="btn btn-secondary mb-2" onClick={addMedicine}>+ Add More</button>

        <button className="btn btn-primary" onClick={handleSubmit}>Save</button>
      </div>
    </div>
  );
};

export default Medications;
