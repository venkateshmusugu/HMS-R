import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Patientlist.css";

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const hospitalId = localStorage.getItem("hospitalId");
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  const navigate = useNavigate();
  const actualRole = localStorage.getItem('role');
  const actingAs = localStorage.getItem('actingAs');
  const isAdminImpersonating = actualRole === 'ADMIN' && actingAs;
  const role = isAdminImpersonating ? 'ADMIN' : actualRole;
  const impersonatingRole = isAdminImpersonating ? actingAs : actualRole;
  const receptionist = localStorage.getItem('username') || '—';

  const fetchAppointments = async () => {
  try {
    const hospitalId = localStorage.getItem("hospitalId");
    const params = { date: selectedDate, hospitalId };

    if (searchTerm) params.searchTerm = searchTerm;

    const res = await axiosInstance.get('/api/appointments/upcoming', { params });
    setAppointments(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error("❌ Error fetching appointments:", err);
    setAppointments([]);
  }
};

  useEffect(() => {
    if (["RECEPTIONIST", "DOCTOR", "ADMIN"].includes(actualRole)) {
      fetchAppointments();
    }
  }, [searchTerm, selectedDate, actualRole]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('actingAs');
    navigate('/home-login');
  };

  return (
    <div className="patient-list-background">
      {/* Header Bar */}
      <div className="receptionist-bar">
        <div className="receptionist-name">
          {impersonatingRole === 'RECEPTIONIST' ? `Receptionist : ${receptionist}` : ''}
        </div>

        <div className="receptionist-buttons">
          <button className="btn-blue1" onClick={() => navigate('/register-patient')}>
            Add New Patient
          </button>
          <button className="btn-blue1" onClick={() => navigate('/book-appointment')}>
            Add New Appointment
          </button>
          <button className="btn-red1" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      {/* Heading & Search */}
      <div className="container-two">
        <div className="heading-1">
          <h2 className="heading-content">Appointments</h2>
        </div>

        <div className="search-options">
          <div className="search-name">
            <input
              type="text"
              className="search"
              style={{ color: 'white' }}
              placeholder="Search by Name or Phone"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="search-date">
            <input
              type="date"
              className="search"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value || '')}
            />
          </div>
        </div>

        {/* Appointment Table */}
        <div className='table-scroll-wrapper'>
          <table className="table-custom">
            <thead>
              <tr>
                <th>Name</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appointments.length > 0 ? appointments.map(appt => {
                const appointmentEnd = new Date(`${appt.visitDate}T${appt.endTime}`);
                const now = new Date();
                const isPast = now > appointmentEnd;
                const isCanceled = appt.status?.toUpperCase() === 'CANCELLED' || appt.status?.toUpperCase() === 'CANCELED';
                const isUpcoming = !isCanceled && !isPast;

                let rowClass = 'row-default';
                if (isCanceled) rowClass = 'row-cancelled';
                else if (isPast) rowClass = 'row-past';
                else if (isUpcoming) rowClass = 'row-upcoming';

                return (
                  <tr key={appt.visitId} className={rowClass}>
                    <td>{appt.patientName || 'N/A'}</td>
                    <td>{appt.doctorName || 'N/A'}</td>
                    <td>{appt.visitDate}</td>
                    <td>{appt.startTime}</td>
                    <td>{appt.endTime}</td>
                    <td>
                      {/* Upcoming Actions */}
                      {!isCanceled && !isPast && (
                        <>
                          <button
                            className="btn btn-warning btn-sm me-1"
                            onClick={() => navigate(`/book-appointment/${appt.visitId}`)}
                          >
                            Edit
                          </button>
                          <button
                            className="btn-cancel"
                            onClick={async () => {
                              if (window.confirm("❌ Cancel this appointment?")) {
                                try {
                                  await axiosInstance.put(`/api/appointments/${appt.visitId}/cancel`);
                                  alert("❌ Appointment cancelled");
                                  fetchAppointments();
                                } catch (err) {
                                  console.error("Cancel failed:", err);
                                  alert("❌ Failed to cancel appointment.");
                                }
                              }
                            }}
                          >
                            Cancel
                          </button>
                        </>
                      )}

                      {/* Status Badges */}
                      {isCanceled && (
                        <button className="btn btn-danger btn-sm me-1" disabled>
                          Cancelled
                        </button>
                      )}
                      {isPast && !isCanceled && (
                        <button className="btn-done me-1" disabled>
                          Done
                        </button>
                      )}

                      {/* Admin Permanent Delete */}
                      {role === 'ADMIN' && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={async () => {
                            if (window.confirm("🗑️ Delete this appointment permanently?")) {
                              try {
                                await axiosInstance.delete(`/api/appointments/${appt.visitId}`);
                                alert("✅ Appointment deleted");
                                fetchAppointments();
                              } catch (err) {
                                console.error("Delete failed:", err);
                                alert("❌ Failed to delete appointment.");
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td style={{ color: 'black' }} colSpan="6" className="text-center">
                    No appointments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin-only back button */}
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

export default PatientList;
