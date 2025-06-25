import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const SurgeryHistory = () => {
  const { patientId } = useParams();
  const [surgeries, setSurgeries] = useState([]);

  useEffect(() => {
    const fetchSurgeries = async () => {
      try {
        const res = await axiosInstance.get(`/api/surgeries/by-patient/${patientId}`);
        setSurgeries(res.data || []);
      } catch (err) {
        console.error('Error fetching surgery history:', err);
      }
    };

    fetchSurgeries();
  }, [patientId]);

  return (
    <div className="container mt-4">
      <h2>Surgery History</h2>
      {surgeries.length === 0 ? (
        <p>No surgeries found for this patient.</p>
      ) : (
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Surgery Date</th>
              <th>Reason</th>
              <th>Diagnosis</th>
              <th>Remarks</th>
              <th>Follow-Up Date</th>
            </tr>
          </thead>
          <tbody>
            {surgeries.map((surgery, index) => (
              <tr key={index}>
                <td>{surgery.surgeryDate}</td>
                <td>{surgery.reason}</td>
                <td>{surgery.diagnosis}</td>
                <td>{surgery.remarks}</td>
                <td>{surgery.followUpDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SurgeryHistory;
