import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/Patientlist.css";


const PatientList = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  // const [selectedDate, setSelectedDate] = useState(
  //   new Date().toISOString().split('T')[0]
  // );
  const [selectedDate, setSelectedDate] = useState('');

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
    fetchAppointments();
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

        <button className="btn-blue" onClick={() => navigate('/register-patient')}>
          Add New Patient
        </button>
        <button className="btn-blue" onClick={() => navigate('/book-appointment')}>
          Add New Appointment
        </button>
        <button className="btn-red" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {/* Header with Receptionist name and Logout */}
      <div className="container-two">



        <div className="heading-1">
          <h2 className="heading-content">Appointments</h2>
        </div>
        {/* Controls */}
        <div className="search-options">
          <div className="search-name">
            <input
              type="text"
              className="form-control"
              placeholder="Search by Name or Phone"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="search-date">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value || '')}
            />
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
