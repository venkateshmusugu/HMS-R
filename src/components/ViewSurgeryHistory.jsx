import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const ViewSurgeryHistory = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/api/surgery-medications/by-patient/${patientId}`)
      .then(res => setHistory(res.data))
      .catch(err => {
        console.error("❌ Error fetching surgery history:", err);
        alert("Could not load surgery history.");
      });
  }, [patientId]);

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Surgery History</h2>
      {history.length === 0 ? (
        <p>No surgeries found.</p>
      ) : (
        history.map((entry, index) => (
          <div key={index} className="card mb-3 p-3">
            <h5>Surgery Date: {entry.surgeryDate || 'N/A'}</h5>
            <p><strong>Type:</strong> {entry.surgeryType || 'N/A'}</p>
            <p><strong>Diagnosis:</strong> {entry.diagnosis || 'N/A'}</p>
            <p><strong>Reason:</strong> {entry.reason || 'N/A'}</p>
            <p><strong>Remarks:</strong> {entry.remarks || 'N/A'}</p>
            <p><strong>Follow-Up:</strong> {entry.followUpDate || 'N/A'}</p>

            {entry.medicationLogs.length > 0 && (
              <>
                <h6>Medicines Prescribed:</h6>
                {entry.medicationLogs.map((log, logIndex) => (
                  <div key={logIndex} className="border rounded p-2 mb-2">
                    <p><strong>Date:</strong> {log.date}</p>
                    <ul>
                      {log.medicines.map((med, i) => (
                        <li key={i}>
                          {med.medicineName} | {med.dosage} | {med.durationInDays} days | {med.frequency}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </>
            )}
          </div>
        ))
      )}
      <button className="btn btn-secondary mt-3" onClick={() => navigate(-1)}>Back</button>
    </div>
  );
};

export default ViewSurgeryHistory;
