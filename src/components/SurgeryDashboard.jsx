import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/SurgeryDashboard.css";

const SurgeryDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const actualRole = localStorage.getItem('role');
  const actingAs = localStorage.getItem('actingAs');
  const isAdminImpersonating = actualRole === 'ADMIN' && actingAs;

  const role = isAdminImpersonating ? 'ADMIN' : actualRole;
  const impersonatingRole = isAdminImpersonating ? actingAs : actualRole;

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) setUsername(storedUsername);

    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log("🔐 Decoded JWT Payload:", decoded);
      } catch (err) {
        console.error("❌ Failed to decode token:", err);
      }
    }
  }, []);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        console.warn("❌ accessToken not found in localStorage.");
        return;
      }

      try {
        const res = await axiosInstance.get('/api/surgery-appointments/by-date', {
          params: { date: selectedDate },
          headers: { Authorization: `Bearer ${token}` },
        });
        setAppointments(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("❌ Failed to fetch appointments:", err);
      }
    };

    fetchAppointments();
  }, [selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("actingAs");
    navigate('/home-login');
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
      <div className="surgery-bar">
        <div className="surgery-username">
          {impersonatingRole === 'SURGERY'
            ? `Surgery Reception: ${username}${isAdminImpersonating ? ` (Impersonated)` : ''}`
            : username}
        </div>
        <div className="surgery-buttons">
          <button className="btn-blue1" onClick={() => navigate('/book-surgery')}>Book Surgery</button>
          <button className="btn-red1" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className='heading-surgery'>
        <h2>Surgery Appointment Dashboard</h2>
      </div>

      <div className='surgery-two'>
        <h4 className="mb-3">Search Appointments by Date</h4>
        <input
          type="date"
          className="surgery-date-dark"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {appointments.length === 0 ? (
        <div className="alert1">No appointments for selected date.</div>
      ) : (
        <div className='table-scroll-wrapper'>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Mobile Number</th>
                <th>Doctor</th>
                <th>Surgery Type</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th>Note</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.map(app => (
                <tr key={app.id}>
                  <td>{app.patientName || 'N/A'}</td>
                  <td>{app.phoneNumber || 'N/A'}</td>
                  <td>{app.doctorName ? `${app.doctorName} (${app.departmentName || ''})` : 'N/A'}</td>
                  <td>{app.surgeryType || 'N/A'}</td>
                  <td>{app.surgeryDate || 'N/A'}</td>
                  <td>{app.surgeryTime || 'N/A'}</td>
                  <td>{app.status || 'Scheduled'}</td>
                  <td>
                    {Array.isArray(app.note) && app.note.length > 0
                      ? app.note.join(', ')
                      : '--'}
                  </td>
                  <td className="action-buttons">
                    <button className="btn-action" onClick={() => navigate(`/edit-surgery/${app.id}`)}>Edit</button>
                    <button className="btn-action" onClick={() => navigate(`/surgery-medication/${app.patientId}/${app.id}`)}>Medications</button>
                    {role === 'ADMIN' && (
                      <button className="btn-action btn-delete" onClick={() => handleDelete(app.id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {role === 'ADMIN' && (
        <div className="back-button-wrapper">
          <button className="back-button" onClick={() => navigate('/admin-dashboard')}>
            ⬅ Back to Admin Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default SurgeryDashboard;
