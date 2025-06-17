import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await axiosInstance.get('/api/appointments/upcoming');
        setAppointments(response.data);
      } catch (err) {
        console.error('❌ Failed to fetch appointments:', err);
      }
    };
    fetchAppointments();
  }, []);

  return (
    <div className="container mt-5">
      <h2>Upcoming Appointments</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Doctor</th>
            <th>Visit Date</th>
            <th>Start Time</th>
            <th>End Time</th>
          </tr>
        </thead>
        <tbody>
          {appointments.length > 0 ? (
            appointments.map((appointment) => (
              <tr key={appointment.visitId}>
                <td>{appointment.patient ? appointment.patient.patientName : 'N/A'}</td> {/* Add check for undefined */}
                <td>{appointment.doctor ? appointment.doctor.doctorName : 'N/A'}</td>
                <td>{appointment.visitDate}</td>
                <td>{appointment.startTime}</td>
                <td>{appointment.endTime}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No upcoming appointments</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Appointments;
