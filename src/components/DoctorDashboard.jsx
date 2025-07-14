import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import Modal from 'react-modal';
import "../css/doctordashboard.css";

Modal.setAppElement('#root');

const DoctorDashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [doctor, setDoctor] = useState(null);

  const navigate = useNavigate();
  const actualRole = localStorage.getItem('role');
  const actingAs = localStorage.getItem('actingAs');
  const isAdminImpersonating = actualRole === 'ADMIN' && actingAs;
  const role = isAdminImpersonating ? 'ADMIN' : actualRole;
  const impersonatingRole = isAdminImpersonating ? actingAs : actualRole;

  const fetchDepartments = async () => {
    try {
      const res = await axiosInstance.get("/api/departments");
      setDepartments(res.data);
    } catch (err) {
      console.error("Failed to fetch departments", err);
    }
  };

  const fetchDoctor = async () => {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    console.warn("⛔ No token found in localStorage");
    return;
  }

  try {
    const res = await axiosInstance.get("/api/doctors/me");
    const doctorData = res.data;

    setDoctor(doctorData);
    setDoctorName(doctorData.doctorName || "");
    setDepartmentId(doctorData.department?.departmentId || "");

    // ✅ Check if department is missing
    if (!doctorData.department || !doctorData.department.departmentId) {
      setIsModalOpen(true);
    }

  } catch (err) {
    console.error("❌ Error fetching doctor profile:", err);
    setDoctor(null);
    setIsModalOpen(true); // fallback for real 404
  }
};


  useEffect(() => {
    if (impersonatingRole === 'DOCTOR') {
      fetchDoctor();
      fetchDepartments();
    }
  }, []);

  useEffect(() => {
  if (impersonatingRole === 'DOCTOR' && doctor?.doctorId) {
    fetchAppointments();
  } else if (impersonatingRole !== 'DOCTOR') {
    fetchAppointments();
  }
}, [searchTerm, selectedDate, doctor?.doctorId]);


const fetchAppointments = async () => {
  if (impersonatingRole === 'DOCTOR' && !doctor?.doctorId) {
    console.warn("Doctor info not loaded yet.");
    return; // ⛔ Avoid fetching until doctorId is ready
  }

  try {
    const params = { date: selectedDate };

    if (impersonatingRole === 'DOCTOR') {
      params.doctorId = doctor.doctorId;
      console.log("📤 Sending doctorId to backend:", doctor.doctorId); // ✅ Watch this in DevTools
    }

    if (searchTerm) {
      params.searchTerm = searchTerm;
    }

    const res = await axiosInstance.get('/api/appointments/upcoming', { params });
    setAppointments(Array.isArray(res.data) ? res.data : []);
  } catch (err) {
    console.error('❌ Error fetching appointments:', err);
    setAppointments([]);
  }
};




  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    localStorage.removeItem('actingAs');
    navigate('/');
  };

const handleProfileSubmit = async () => {
  if (!doctorName || !departmentName) {
    alert("Please fill all fields.");
    return;
  }

  try {
  const doctorPayload = {
    doctorName: doctorName.trim(),
    departmentName: departmentName.trim(),
  };

  const res = await axiosInstance.post("/api/doctors/profile", doctorPayload);
  alert("✅ Profile saved");
  setIsModalOpen(false);
  window.location.reload();

} catch (err) {
  if (err.response?.data === "Doctor profile already exists") {
    alert("⚠️ You already have a profile.");
    setIsModalOpen(false);
    return;
  }

  console.error("❌ Failed to save profile:", err);
  alert("❌ Failed to save profile");
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

  const customModalStyles = {
    content: {
      top: '50%',
      left: '50%',
      right: 'auto',
      bottom: 'auto',
      marginRight: '-50%',
      transform: 'translate(-50%, -50%)',
      background: 'white',
      zIndex: 2000,
      padding: '30px',
      borderRadius: '10px',
      width: '400px',
      boxShadow: '0 0 10px rgba(0, 0, 0, 0.25)',
    },
    overlay: {
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      zIndex: 1500,
    },
  };

  return (
    <div className="doctordashboard-background">
      <div className="container-3">
        <div className="header-three">
          <h4 className="doctor-name">
            {impersonatingRole === 'DOCTOR' ? `Doctor: ${doctorName} (${departments.find(d => d.departmentId === departmentId)?.departmentName || ''})` : ''}
          </h4>
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
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>
      </div>

      <div className="table-scroll-wrapper">
        <table className="table-custom">
          <thead>
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
              const isCanceled = a.status === 'CANCELLED' || a.status === 'CANCELLD';
              const isActive = a.status === 'ACTIVE';
              const rowStyle = isCanceled
                ? { backgroundColor: '#f8d7da', color: '#721c24' }
                : isActive
                  ? { backgroundColor: '#d4edda', color: '#155724' }
                  : {};

              return (
                <tr key={a.visitId} style={rowStyle}>
                  <td>{a.patientName}</td>
                  <td>{a.doctorName}</td>
                  <td>{a.visitDate}</td>
                  <td>{a.startTime}</td>
                  <td>{a.endTime}</td>
                  <td>
                    <button
                      className="capsule-button"
                      onClick={() => navigate(`/surgery-history/${a.patientId}`)}
                    >
                      View Surgery History
                    </button>
                  </td>
                  <td>
                    <button
                      className="capsule-button"
                      onClick={() => {
                        if (!a.patientId || !a.visitId) {
                          alert("❌ Missing patient or appointment ID.");
                          return;
                        }
                        navigate(`/medications/${a.patientId}/${a.visitId}`);
                      }}
                    >
                      View Medications
                    </button>
                  </td>
                  <td>
                    {isCanceled ? (
                      <span className="badge bg-danger">Cancelled</span>
                    ) : isPast ? (
                      <button className="capsule-button capsule-secondary" disabled>
                        Done
                      </button>
                    ) : (
                      <>
                        <button
                          className="capsule-button capsule-warning me-2"
                          onClick={() => navigate(`/book-appointment/${a.visitId}`)}
                        >
                          Edit
                        </button>
                        <button
                          className="capsule-button capsule-danger me-2"
                          onClick={() => handleCancelAppointment(a.visitId)}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    {role === 'ADMIN' && (
                      <button
                        className="capsule-button capsule-danger"
                        onClick={async () => {
                          const confirmDelete = window.confirm("🗑️ Delete this appointment permanently?");
                          if (confirmDelete) {
                            try {
                              await axiosInstance.delete(`/api/appointments/${a.visitId}`);
                              alert("✅ Appointment deleted");
                              fetchAppointments();
                            } catch (err) {
                              console.error("Error deleting:", err);
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
                <td colSpan="8" className="text-center">No appointments found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {role === 'ADMIN' && (
        <div className="back-button-wrapper">
          <button className="back-button" onClick={() => navigate('/admin-dashboard')}>
            ⬅ Back to Admin Dashboard
          </button>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        style={customModalStyles}
        contentLabel="Doctor Profile Modal"
      >
        <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Complete Your Profile</h3>
        <div className="mb-3">
          <input
            type="text"
            placeholder="Doctor Name (e.g., Dr. Sharma)"
            className="form-control"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
          />
        </div>
       <div className="mb-3">
        <input
        type="text"
        placeholder="Department (e.g., Gynecologist)"
        className="form-control"
        value={departmentName}
        onChange={(e) => setDepartmentName(e.target.value)}
      />
      </div>
        <button className="btn btn-success" onClick={handleProfileSubmit}>
          Save Profile
        </button>
      </Modal>
    </div>
  );
};

export default DoctorDashboard;
