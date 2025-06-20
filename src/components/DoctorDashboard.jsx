import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';

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

    const res = await axiosInstance.get('/api/appointments/upcoming', { params });

    console.log("Fetched Appointments:", res.data);

    // ✅ Ensure it's an array before setting state
    const fetched = Array.isArray(res.data) ? res.data : [];
    setAppointments(fetched);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    setAppointments([]); // Fallback to empty array on error
  }
};

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="doctordashboard-background">
      <div className="container mt-5">
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h4 className="gradient-receptionist">{role === 'DOCTOR' ? `Doctor: ${username}` : ''}</h4>
          <button className="btn btn-danger" onClick={handleLogout}>Logout</button>
        </div>

        <h2 className="text-light mb-4">Today's Appointments</h2>

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
              onClick={() => navigate('/register-patient')}
            >
              Add New Patient
            </button>
            <button
              className="btn btn-primary"
              onClick={() => navigate('/book-appointment')}
            >
              Add New Appointment
            </button>
          </div>
        </div>

        {/* Table */}
        <table className="table table-bordered bg-dark text-light">
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
                  <td>{a.patient?.patientName}</td>
                  <td>{a.doctor?.doctorName}</td>
                  <td>{a.visitDate}</td>
                  <td>{a.startTime}</td>
                  <td>{a.endTime}</td>
                  <td>
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => navigate(`/surgeries/${a.visitId}`)}
                    >
                      View Surgery History
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
    </div>
  );
};

export default DoctorDashboard;
