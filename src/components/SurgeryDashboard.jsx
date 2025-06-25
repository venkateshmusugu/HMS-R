import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const SurgeryDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);
  }, []);

  useEffect(() => {
    if (selectedDate) {
      axiosInstance
        .get(`/api/surgery-appointments/by-date?date=${selectedDate}`)
        .then(res => setAppointments(res.data || []))
        .catch(err => console.error("❌ Error fetching appointments:", err));
    }
  }, [selectedDate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this appointment?")) {
      try {
        await axiosInstance.delete(`/api/surgery-appointments/${id}`);
        alert("✅ Appointment deleted successfully.");
        setAppointments(prev => prev.filter(app => app.id !== id));
      } catch (err) {
        alert("❌ Failed to delete appointment.");
        console.error(err);
      }
    }
  };

  return (
    <div className='surgery-background'>
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="w-65 p-3">
            <h2>Surgery Appointment Dashboard</h2>
            <h3 className="text-light bg-dark">Surgery Reception: {username}</h3>
          </div>
          <button className="btn btn-outline-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <h4 className="mb-3">Search Appointments by Date</h4>
        <input
          type="date"
          className="form-control mb-4"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />

        <div className="mb-3 d-flex justify-content-end gap-2">
          <button className="btn btn-primary" onClick={() => navigate('/book-surgery')}>
            Book Surgery
          </button>
        </div>

        {appointments.length === 0 ? (
          <div className="alert alert-info">No appointments for selected date.</div>
        ) : (
          <table className="table table-bordered">
            <thead className="table-light">
              <tr>
                <th>Patient Name</th>
                <th>Mobile Number</th>
                <th>Surgery Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => {
                const patient = app.patient || {};
                return (
                  <tr key={app.id}>
                    <td>{patient.patientName || 'N/A'}</td>
                    <td>{patient.phoneNumber || 'N/A'}</td>
                    <td>{app.surgeryType || 'N/A'}</td>
                    <td>{app.surgeryDate || 'N/A'}</td>
                    <td>{app.surgeryTime || 'N/A'}</td>
                    <td>{app.status || 'Scheduled'}</td>
                    <td>
                      <button
                        className="btn btn-warning btn-sm me-2"
                        onClick={() => navigate(`/edit-surgery/${app.id}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm me-2"
                        onClick={() => handleDelete(app.id)}
                      >
                        Delete
                      </button>
                      <button
                        className="btn btn-info btn-sm"
                       onClick={() => navigate(`/surgery-medication/${patient.patientId}/${app.id}`)}

                      >
                        Medications
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default SurgeryDashboard;
