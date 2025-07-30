import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const ReceptionDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchPatients = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/patients', {
        withCredentials: true,
      });
      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('❌ Failed to fetch patients:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleAddPatient = () => {
    navigate('/register-patient');
  };

  return (
    <div className="p-6 bg-white min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-blue-800">Reception Dashboard</h1>

      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Patient List</h2>
        <button
          onClick={handleAddPatient}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
        >
          + Add Patient
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading patients...</p>
      ) : patients.length === 0 ? (
        <p className="text-gray-500">No patients registered yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded shadow-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="border px-4 py-2 text-left">Name</th>
                <th className="border px-4 py-2 text-left">Age</th>
                <th className="border px-4 py-2 text-left">Gender</th>
                <th className="border px-4 py-2 text-left">Contact</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="border px-4 py-2">{patient.name}</td>
                  <td className="border px-4 py-2">{patient.age}</td>
                  <td className="border px-4 py-2">{patient.gender}</td>
                  <td className="border px-4 py-2">{patient.contactNumber || patient.phoneNumber || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReceptionDashboard;
