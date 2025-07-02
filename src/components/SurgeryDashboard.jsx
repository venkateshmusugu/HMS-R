import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/SurgeryDashboard.css";

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
    axiosInstance
      .get(`/api/surgery-appointments/by-date?date=${selectedDate}`)
      .then(res => {
        console.log("🧪 Appointments data:", res.data);
        setAppointments(res.data);
      })
      .catch(err => {
        console.error("❌ Failed to fetch appointments:", err);
        setAppointments([]);
      });
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
      <div className="container-four">
        <div className="header-four">
          <h3 className="surgery-name">Surgery Reception: {username}</h3>
        </div>

        <button className="btn-blue2" onClick={() => navigate('/book-surgery')}>
          Book Surgery
        </button>
        <button className="btn-red2" onClick={handleLogout}>
          Logout
        </button>
      </div>

      <div className='heading-surgery'>
        <h2>Surgery Appointment Dashboard</h2>
      </div>

      <div className='surgery-two'>
        <h4 className="mb-3">Search Appointments by Date</h4>
        <input
          type="date"
          className="form-control custom-date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
        />
      </div>

      {appointments.length === 0 ? (
        <div className="alert alert-info">No appointments for selected date.</div>
      ) : (
        <table className="table table-bordered">
          <thead className="table-light">
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
            {appointments.map(app => {
              const patientName = app.patientName || 'N/A';
              const phoneNumber = app.phoneNumber || 'N/A';
              const doctorFullName = app.doctorName && app.departmentName
                ? `${app.doctorName} (${app.departmentName})`
                : app.doctorName || 'N/A';

              return (
                <tr key={app.id}>
                  <td>{patientName}</td>
                  <td>{phoneNumber}</td>
                  <td>{doctorFullName}</td>
                  <td>{app.surgeryType || 'N/A'}</td>
                  <td>{app.surgeryDate || 'N/A'}</td>
                  <td>{app.surgeryTime || 'N/A'}</td>
                  <td>{app.status || 'Scheduled'}</td>
                  <td>
                    {Array.isArray(app.note) && app.note.length > 0
                      ? app.note.join(', ')
                      : '--'}
                  </td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => navigate(`/edit-surgery/${app.id}`)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-info btn-sm me-2"
                      onClick={() =>
                        navigate(`/surgery-medication/${app.patientId}/${app.id}`)
                      }
                    >
                      Medications
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(app.id)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default SurgeryDashboard;
