import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReceptionDashboard = () => {
  const [patients, setPatients] = useState([]);
  const navigate = useNavigate();

  // Fetch patients from backend
  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/patients', {
        withCredentials: true, // needed if using Spring Security + CSRF
      });
      setPatients(response.data);
    } catch (error) {
      console.error('❌ Failed to fetch patients:', error);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = () => {
    navigate('/register-patient');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reception Dashboard</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Patient List</h2>
        <button
          onClick={handleAddPatient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add Patient
        </button>
      </div>

      {patients.length === 0 ? (
        <p className="text-gray-500">No patients registered yet.</p>
      ) : (
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Age</th>
              <th className="border px-4 py-2">Gender</th>
              <th className="border px-4 py-2">Contact</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((patient) => (
              <tr key={patient.id}>
                <td className="border px-4 py-2">{patient.name}</td>
                <td className="border px-4 py-2">{patient.age}</td>
                <td className="border px-4 py-2">{patient.gender}</td>
                <td className="border px-4 py-2">{patient.contactNumber}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
export default ReceptionDashboard;