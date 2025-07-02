import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import "../css/BillingDashboard.css";

const BillingDashboard = () => {
  const [patients, setPatients] = useState([]);
  const [searchType, setSearchType] = useState('billId');
  const [searchValue, setSearchValue] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = () => {
    axiosInstance.get('/api/medical-bills/patient-summary')
      .then(res => setPatients(res.data))
      .catch(err => console.error("Failed to load billing data:", err));
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    navigate('/');
  };

  const handleSearch = async () => {
    if (!searchValue.trim()) return;

    try {
      const endpoint =
        searchType === 'billId'
          ? `/api/medical-bills/by-bill-id/${searchValue}`
          : `/api/medical-bills/by-phone/${searchValue}`;

      const res = await axiosInstance.get(endpoint);
      const data = Array.isArray(res.data) ? res.data : [res.data];

      if (data.length === 0) {
        alert("No matching bills found.");
        return;
      }

      const bill = data[0];
      if (searchType === 'billId') {
        navigate(`/view-bills/${bill.entries[0]?.mobile || ''}`);
      } else {
        navigate(`/view-bills/${searchValue}`);
      }
    } catch (err) {
      console.error('❌ Search failed:', err);
      alert("No bill found for the given input.");
    }
  };

  const handleDateFilter = async () => {
    try {
      const res = await axiosInstance.get(`/api/medical-bills/by-date?date=${selectedDate}`);
      const bills = res.data;

      const summaries = bills.reduce((acc, bill) => {
        bill.entries.forEach((entry) => {
          const key = `${entry.patientName}-${entry.mobile}`;
          if (!acc[key]) {
            acc[key] = {
              name: entry.patientName,
              mobile: entry.mobile,
              billCount: 0,
              date: bill.createdDate || '--',
              time: bill.createdTime ? bill.createdTime.slice(0, 5) : '--'
            };
          }
          acc[key].billCount += 1;
        });
        return acc;
      }, {});

      setPatients(Object.values(summaries));
    } catch (err) {
      console.error("❌ Error filtering by date:", err);
      alert("No bills found on selected date.");
    }
  };

  const handleDelete = async (patient) => {
    if (!window.confirm(`Are you sure you want to delete all bills for ${patient.name}?`)) return;

    try {
      const res = await axiosInstance.get(`/api/medical-bills/by-phone/${patient.mobile}`);
      const latestBill = res.data[res.data.length - 1];
      if (!latestBill || !latestBill.billId) {
        alert("No bill found for deletion.");
        return;
      }

      await axiosInstance.delete(`/api/medical-bills/delete/${latestBill.billId}`);
      alert("Deleted successfully");
      fetchPatients();
    } catch (err) {
      console.error("❌ Delete failed:", err);
      alert("Failed to delete bill.");
    }
  };

  return (
    <div className="billing-dashboard">
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h2>Medical Billing Dashboard</h2>
          <div className="dashboard-controls">
            <button className="btn btn-success me-2" onClick={() => navigate('/add-bill')}>+ Add Medicine</button>
            <button className="btn btn-outline-danger" onClick={handleLogout}>Logout</button>
          </div>
        </div>

        {/* 🔍 Search by ID / Mobile */}
        <div className="search-bar">
          <select
            className="form-select"
            value={searchType}
            onChange={(e) => setSearchType(e.target.value)}
          >
            <option value="billId">Bill ID</option>
            <option value="mobile">Mobile Number</option>
          </select>
          <input
            type="text"
            className="form-control"
            placeholder={`Search by ${searchType === 'billId' ? 'Bill ID' : 'Mobile Number'}`}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSearch}>Search</button>
        </div>

        {/* 📅 Date Filter */}
        <div className="date-filter">
          <input
            type="date"
            className="form-control"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
          <button className="btn btn-secondary" onClick={handleDateFilter}>Filter by Date</button>
        </div>

       {patients.length === 0 ? (
          <p>No billing data available.</p>
        ) : (
          <div className="table-container">
            <table className="table table-bordered shadow-sm">
              <thead className="table-dark">
                <tr>
                  <th>Patient Name</th>
                  <th>Mobile Number</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Total Medicines</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p, idx) => (
                  <tr key={idx}>
                    <td>{p.name}</td>
                    <td>{p.mobile}</td>
                    <td>{p.date || '--'}</td>
                    <td>{p.time ? p.time.slice(0, 8) : '--'}</td>
                    <td>{p.billCount}</td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm me-2"
                        onClick={() => navigate(`/view-bills/${p.mobile}`)}
                      >
                        View Medicines
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(p)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillingDashboard;