import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';

const AddDoctorForm = () => {
  const [doctorName, setDoctorName] = useState('');
  const [designation, setDesignation] = useState('');
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const res = await axiosInstance.get('/api/departments'); // You must expose this endpoint
        setDepartments(res.data);
      } catch (err) {
        console.error("Error fetching departments", err);
      }
    };

    fetchDepartments();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!doctorName || !designation || !selectedDept) {
      alert("Please fill all fields.");
      return;
    }

    try {
      await axiosInstance.post('/api/doctors/add', {
        doctorName,
        designation,
        department: { departmentId: selectedDept }
      });

      alert("Doctor added successfully!");
      navigate('/doctor-dashboard');
    } catch (err) {
      console.error("Failed to add doctor", err);
      alert("Error adding doctor.");
    }
  };

  return (
    <div className="container-first mt-5">
      <h2 className="mb-4 text-center text-primary fw-bold border-bottom pb-2">Add Doctor</h2>
      <form className="form-1" onSubmit={handleSubmit}>
        <div className="mb-3 text-primary fw-bold border-bottom pb-2">
          <label>Doctor Name</label>
          <input
            className="form-control"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 text-primary fw-bold border-bottom pb-2">
          <label>Designation</label>
          <input
            className="form-control"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Cardiologist, Surgeon"
            required
          />
        </div>

        <div className="mb-3 text-primary fw-bold border-bottom pb-2">
          <label>Department</label>
          <select
            className="form-select"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            required
          >
            <option value="">-- Select Department --</option>
            {departments.map(dept => (
              <option key={dept.departmentId} value={dept.departmentId}>
                {dept.departmentName}
              </option>
            ))}
          </select>
        </div>

        <button className="btn login-button" type="submit">Add Doctor</button>
      </form>
    </div>
  );
};

export default AddDoctorForm;
