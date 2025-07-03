import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/doctordashboard.css";

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const navigate = useNavigate();

  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username') || '—';

  useEffect(() => {
    fetchAppointments();
  }, [searchTerm, selectedDate]);

  const fetchAppointments = async () => {
    try {
      const params = { date: selectedDate };
      if (searchTerm) params.searchTerm = searchTerm;

      const res = await axiosInstance.get('/api/appointments/upcoming', { params });
      const fetched = Array.isArray(res.data) ? res.data : [];
      setAppointments(fetched);
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setAppointments([]);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const handleViewSurgeryHistory = async (patientId) => {
    try {
      const res = await axiosInstance.get(`/api/surgeries/latest-by-patient/${patientId}`);
      const latestSurgery = res.data;

      if (latestSurgery?.id) {
        navigate(`/surgery-medication/${patientId}/${latestSurgery.id}`);
      } else {
        alert("⚠️ No surgery found for this patient.");
      }
    } catch (err) {
      if (err.response?.status === 404) {
        alert("⚠️ No surgery record found for this patient.");
      } else {
        console.error("❌ Error fetching latest surgery", err);
        alert("❌ Error loading surgery history.");
      }
    }
  };

  const handleCancelAppointment = async (visitId) => {
    try {
      await axiosInstance.put(`/api/appointments/${visitId}/cancel`);
      fetchAppointments();
    } catch (err) {
      console.error("❌ Error canceling appointment:", err);
      alert("❌ Failed to cancel appointment.");
    }
  };

  return (
    <div className="doctordashboard-background">
      <div className="container-3">
        <div className="header-three">
          <h4 className="doctor-name">{role === 'DOCTOR' ? `Doctor: ${username}` : ''}</h4>
        </div>
        <div>
          <button className="btn-blue1 me-2" onClick={() => navigate('/register-patient')}>
            Add New Patient
          </button>
          <button className="btn-blue1 me-2" onClick={() => navigate('/book-appointment')}>
            Add New Appointment
          </button>
          <button className="btn-red1" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className='heading-app'>
        <h2 className="content">Today's Appointments</h2>
      </div>

      <div className="searching mb-3">
        <div className="search-by-name me-3">
          <input
            type="text"
            className="form-control data"
            placeholder="Search by Name or Phone"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
       <div className="search-by-date">
  <input
    type="date"
    className="dark-date-input"
    value={selectedDate}
    onChange={e => setSelectedDate(e.target.value)}
  />
</div>

      </div>
<div className="table-scroll-container">
      <table className="table-custom">
        <thead className="table-light text-dark">
          <tr>
            <th>Name</th>
            <th>Doctor</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>History</th>
            <th>Medications</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? appointments.map(a => {
            const appointmentEnd = new Date(`${a.visitDate}T${a.endTime}`);
            const now = new Date();
            const isPast = now > appointmentEnd;

            const isCanceled = a.status === 'CANCELLD' || a.status === 'CANCELLED';
            const isActive = a.status === 'ACTIVE';

            const rowStyle = isCanceled
              ? { backgroundColor: '#f8d7da', color: '#721c24' }
              : isActive
              ? { backgroundColor: '#d4edda', color: '#155724' }
              : {};

            return (
              <tr key={a.visitId} style={rowStyle}>
                <td style={{ color: 'black' }}>{a.patient?.patientName}</td>
                <td style={{ color: 'black' }}>{a.doctor?.doctorName}</td>
                <td style={{ color: 'black' }}>{a.visitDate}</td>
                <td style={{ color: 'black' }}>{a.startTime}</td>
                <td style={{ color: 'black' }}>{a.endTime}</td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => handleViewSurgeryHistory(a.patient.patientId)}>
                    View Surgery History
                  </button>
                </td>
                <td>
                  <button
                    className="btn btn-info btn-sm"
                    onClick={() => navigate(`/medications/${a.patient.patientId}/${a.visitId}`)}
                  >
                    View Medications
                  </button>
                </td>
                <td>
                  {isCanceled ? (
                    <span className="badge bg-danger">Cancelled</span>
                  ) : isPast ? (
                    <button className="btn btn-secondary btn-sm" disabled>
                      Done
                    </button>
                  ) : (
                    <>
                      <button
                        className="btn btn-warning btn-sm me-1"
                        onClick={() => navigate(`/book-appointment/${a.visitId}`)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelAppointment(a.visitId)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            );
          }) : (
            <tr>
              <td colSpan="8" className="text-center">No appointments found.</td>
            </tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default DoctorDashboard;
