import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Medications.css";

const Medications = () => {
  const { patientId, apptId } = useParams();
  const navigate = useNavigate();

  const [logs, setLogs] = useState([]);
  const [expandedDate, setExpandedDate] = useState(null);

  const [formData, setFormData] = useState({
    diagnosis: '',
    reasonForVisit: '',
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
    axiosInstance.get(`/api/doctor-logs/by-patient/${patientId}`)
      .then(res => setLogs(res.data))
      .catch(err => console.error("❌ Failed to fetch logs:", err));

    if (apptId) {
      axiosInstance.get(`/api/appointments/${apptId}`)
        .then(res => {
          const appt = res.data;
          setFormData(prev => ({
            ...prev,
            reasonForVisit: appt.reasonForVisit || '',
            followUpDate: appt.visitDate ? appt.visitDate.split('T')[0] : ''
          }));
        })
        .catch(err => {
          console.error("❌ Failed to fetch appointment:", err);
          alert("Error loading appointment details.");
        });
    }
  }, [patientId, apptId]);

  const toggleLogs = (date) => {
    setExpandedDate(expandedDate === date ? null : date);
  };

  const handleChange = (e, index, field) => {
    const updatedMedicines = [...formData.medicines];
    updatedMedicines[index][field] = e.target.value;
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const handleAddMedicine = () => {
    setFormData({
      ...formData,
      medicines: [
        ...formData.medicines,
        { medicineName: '', dosage: '', durationInDays: '', frequency: '' },
      ],
    });
  };

  const handleRemoveMedicine = (index) => {
    const updatedMedicines = formData.medicines.filter((_, i) => i !== index);
    setFormData({ ...formData, medicines: updatedMedicines });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedPayload = {
      diagnosis: formData.diagnosis,
      reasonForVisit: formData.reasonForVisit,
      followUpDate: formData.followUpDate,
      medicines: formData.medicines.map((med) => ({
        medicineName: med.medicineName,
        dosage: med.dosage,
        durationInDays: parseInt(med.durationInDays, 10) || 0,
        frequency: med.frequency,
      })),
    };

    try {
      await axiosInstance.post(`/api/doctor-logs/by-appointment/${apptId}`, formattedPayload);
      alert("Medications saved successfully!");
      navigate(-1);
    } catch (err) {
      console.error("❌ Error saving medications:", err);
      alert("Failed to save medications");
    }
  };

  return (
    <div className='medication-background'>
      <div className="container mt-4">
        <h2>Medication Prescription</h2>

        <form onSubmit={handleSubmit} className="mb-4">
          <input
            className="form-control mb-2"
            placeholder="Reason for Visit"
            value={formData.reasonForVisit}
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
                    placeholder="Duration(in days)"
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
          <button type="button" className="btn-back" onClick={() => navigate('/doctor-dashboard')}>
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
                <th>Reason for Visit</th>
                <th>Diagnosis</th>
                <th>Prescription</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log, index) => (
                <React.Fragment key={index}>
                  <tr>
                    <td>{log.date || 'N/A'}</td>
                    <td>{log.reasonForVisit || 'N/A'}</td>
                    <td>{log.diagnosis || 'N/A'}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => toggleLogs(log.date)}
                      >
                        {expandedDate === log.date ? 'Hide' : 'View Prescription'}
                      </button>
                    </td>
                  </tr>
                  {expandedDate === log.date && (
                    <tr>
                      <td colSpan="4">
                         {console.log("🧾 Prescription for:", log.date, log.medicines)}
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

export default Medications;
