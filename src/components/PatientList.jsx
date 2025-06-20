import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const receptionist = localStorage.getItem('username') || '—';

 // const receptionist = localStorage.getItem('username') || '—';

 const fetchAppointments = async () => {
  try {
    const params = {};
    if (selectedDate && selectedDate.trim() !== '') {
      params.date = selectedDate;
    }
    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    const response = await axiosInstance.get('/api/appointments/upcoming', { params });
    const sorted = response.data.sort((a, b) => new Date(a.visitDate) - new Date(b.visitDate));
    setAppointments(sorted);
  } catch (err) {
    console.error('❌ Failed to fetch appointments:', err);
    alert('❌ Failed to fetch appointments.');
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
      <div className="container mt-5">
        {/* Header with Receptionist name and Logout */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="gradient-receptionist">
  {role === 'RECEPTIONIST' ? `Receptionist: ${receptionist}` : ''}
</h4>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <h2 className="text-light mb-4">Appointments</h2>

        {/* Controls */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div className="d-flex gap-3 w-50">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name or Phone"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          <div>
            <button
              className="btn btn-success me-2"
              onClick={() => navigate('/register-patient?context=appointment')}>
              Add New Patient
            </button>

            <button className="btn btn-primary" onClick={() => navigate('/book-appointment')}>
              Add New Appointment
            </button>
          </div>
        </div>

        {/* Appointment Table */}
        <table className="table table-bordered table-hover text-light bg-dark">
          <thead className="table-light text-dark">
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
        {appointments.length > 0 ? (
          appointments.map(appt => {
            const appointmentEnd = new Date(`${appt.visitDate}T${appt.endTime}`);
            const now = new Date();
            const isPast = now > appointmentEnd;

            return (
              <tr key={appt.visitId}>
                <td>{appt.patient?.patientName || 'N/A'}</td>
                <td>{appt.doctor?.doctorName || 'N/A'}</td>
                <td>{appt.visitDate}</td>
                <td>{appt.startTime}</td>
                <td>{appt.endTime}</td>
                <td>
                  {isPast ? (
                    <button className="btn btn-secondary btn-sm" disabled>
                      Done
                    </button>
                  ) : (
                    <button
                      className="btn btn-warning btn-sm"
                      onClick={() => navigate(`/book-appointment/${appt.visitId}`)}
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            );
          })
        ) : (
          <tr>
            <td colSpan="6" className="text-center">No appointments found.</td>
          </tr>
        )}
      </tbody>

        </table>
      </div>
    </div>
  );
};

export default PatientList;
