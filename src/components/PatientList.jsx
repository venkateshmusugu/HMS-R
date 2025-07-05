import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Patientlist.css";

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const receptionist = localStorage.getItem('username') || '—';

 const fetchAppointments = async () => {
  try {
    const response = await axiosInstance.get('/api/appointments/upcoming');
    console.log("🔍 Raw API Response:", response);

    const data = response.data;

    if (!Array.isArray(data)) {
      console.warn("⚠️ Unexpected format from API:", response.data);
      setAppointments([]);
      return;
    }

    const sorted = data.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
    setAppointments(sorted);
  } catch (err) {
    console.error('❌ Failed to fetch appointments:', err);
    setAppointments([]);
  }
};





  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role === 'RECEPTIONIST' || role === 'DOCTOR') {
      fetchAppointments();
    }
  }, [searchTerm, selectedDate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="patient-list-background">
      <div className="container-1">
        <div className="header-name">
          <h4 className="receptionist">
            {role === 'RECEPTIONIST' ? (
              <>
                Receptionist:<br />
                {receptionist}
              </>
            ) : ''}
          </h4>
        </div>

        <button className="btn-blue-list" onClick={() => navigate('/register-patient')}>
          Add New Patient
        </button>
        <button className="btn-blue-list" onClick={() => navigate('/book-appointment')}>
          Add New Appointment
        </button>
        <button className="btn-red" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* Appointment Section */}
      <div className="container-two">
        <div className="heading-1">
          <h2 className="heading-content">Appointments</h2>
        </div>

        {/* Search Controls */}
        <div className="search-options">
          <div className="search-name">
            <input
              type="text"
              className="search"  style={{ color: 'white' }}
              placeholder ="Search by Name or Phone"
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
          <thead >
            <tr color='black'>
              <th>Name</th>
              <th>Doctor</th>
              <th>Date</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
  {appointments.length > 0 ? (
    appointments.map(appt => {
  const appointmentEnd = new Date(`${appt.visitDate}T${appt.endTime}`);
  const now = new Date();
  const isPast = now > appointmentEnd;

  const isCanceled =
    appt.status?.toUpperCase() === 'CANCELLED' || appt.status?.toUpperCase() === 'CANCELED';
  const isUpcoming = !isCanceled && !isPast;

  let rowClass = 'row-default';
  if (isCanceled) {
    rowClass = 'row-cancelled';
  } else if (isPast) {
    rowClass = 'row-past';
  } else if (isUpcoming) {
    rowClass = 'row-upcoming';
  }

  return (
    <tr key={appt.visitId} className={rowClass}>
      <td>{appt.patientName || 'N/A'}</td>
     <td>{appt.doctorName || 'N/A'}</td>
      <td>{appt.visitDate}</td>
      <td>{appt.startTime}</td>
      <td>{appt.endTime}</td>
      <td>
        {isCanceled ? (
          <button className="btn btn-danger btn-sm" disabled>Cancelled</button>
        ) : isPast ? (
          <button className="btn-done" disabled>Done</button>
        ) : (
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
                const confirm = window.confirm("❌ Cancel this appointment?");
                if (confirm) {
                  try {
                    await axiosInstance.put(`/api/appointments/${appt.visitId}/cancel`);
                    alert("❌ Appointment cancelled");
                    fetchAppointments();
                  } catch (err) {
                    console.error("Error cancelling:", err);
                    alert("❌ Failed to cancel appointment.");
                  }
                }
              }}
            >
              Cancel
            </button>
          </>
        )}
      </td>
    </tr>
  );
    })
  ) : (
    <tr>
      <td style={{ color: 'black' }} colSpan="6" className="text-center">No appointments found.</td>
    </tr>
  )}
</tbody>

        </table>
        </div>
      </div>
    </div>
  );
};

export default PatientList;
