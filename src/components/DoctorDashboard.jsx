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

  useEffect(() => { fetchAppointments(); }, [searchTerm, selectedDate]);

  const fetchAppointments = async () => {
    try {
      const params = { date: selectedDate };
      if (searchTerm) params.searchTerm = searchTerm;
      const res = await axiosInstance.get('/api/appointments/upcoming', { params});
      console.log("Fetched Appointments:", res.data);
      setAppointments(res.data);
    } catch (err) {
      console.error('Error fetching appointments:', err);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="doctordashboard-background">
      <div className="container-3">
        {/* Header */}
        <div className="header-4">
          <h4 className="doctor">{role === 'DOCTOR' ? `Doctor: ${username}` : ''}</h4>
         </div>
          
            <button
              className="btn-blue1"
              onClick={() => navigate('/register-patient')}
            >
              Add New Patient
            </button>
          
            
            <button
              className="btn-blue1"
              onClick={() => navigate('/book-appointment')}
            >
              Add New Appointment
            </button>
          
          <button className="btn-red1" onClick={handleLogout}>Logout</button>
        
         </div>
        <div className='heading-app'>
        <h2 className="content">Today's Appointments</h2>
        </div>
        {/* Controls */}
       <div className="search">
        <div className="search-by-name">
            <input 
              type="text"
              className="form-control"
              placeholder="Search by Name or Phone"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            </div>
             <div className="search-by-date">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
            />
          </div>
          
        </div>

        {/* Table */}
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

              return (
                <tr key={a.visitId}>
                  <td style={{ color: 'black' }}>{a.patient?.patientName}</td>
                  <td style={{ color: 'black' }}>{a.doctor?.doctorName}</td>
                  <td style={{ color: 'black' }}>{a.visitDate}</td>
                  <td style={{ color: 'black' }}>{a.startTime}</td>
                  <td style={{ color: 'black' }}>{a.endTime}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => navigate(`/surgeries/${a.visitId}`)}
                    >
                      View History
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-info btn-sm" onClick={() => navigate(`/medications/${a.patient.patientId}/${a.visitId}`)}>
                     View Medications</button>
                  </td>
                  <td>
                    {isPast ? (
                      <button className="btn btn-secondary btn-sm" disabled>
                        Done
                      </button>
                    ) : (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => navigate(`/book-appointment/${a.visitId}`)}
                      >
                        Edit
                      </button>
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
  );
};

export default DoctorDashboard;
