    // ---------------------- FRONTEND (React.js) ----------------------
// File: MedicalBilling.jsx
import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosInstance';
import { useParams, useNavigate } from 'react-router-dom';

const MedicalBilling = () => {
  const { patientId } = useParams();
  const [bills, setBills] = useState([]);
  const [searchType, setSearchType] = useState('billId');
  const [searchValue, setSearchValue] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    fetchBills();
  }, []);

  const fetchBills = async () => {
    try {
      const res = await axiosInstance.get(`/api/medical-bills/by-patient/${patientId}`);
      setBills(res.data);
    } catch (err) {
      console.error('❌ Error loading bills:', err);
    }
  };
  const handleSearch = async () => {
  if (!searchValue.trim()) return;

  try {
    const endpoint =
      searchType === 'billId'
        ? `/api/medical-bills/by-bill-id/${searchValue}`
        : `/api/medical-bills/by-phone/${searchValue}`;

    const res = await axiosInstance.get(endpoint);
    const data = Array.isArray(res.data) ? res.data : [res.data]; // normalize
    setBills(data);
  } catch (err) {
    console.error('❌ Search failed:', err);
    alert('No bill found for the given input.');
    setBills([]); // Optional: clear list
  }
};


  const deleteBill = async (id) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      await axiosInstance.delete(`/api/medical-bills/${id}`);
      fetchBills();
    }
  };

  const printBill = (id) => {
    window.open(`/api/medical-bills/${id}/print`, '_blank');
  };

  return (
    <div className="container mt-4">
      <h2>Medical Billing</h2>
      <button
        className="btn btn-success mb-3"
        onClick={() => navigate(`/add-bill/${patientId}`)}>
        + Add Medicine
      </button>
      <div className="d-flex mb-3">
  <select className="form-select me-2" value={searchType} onChange={(e) => setSearchType(e.target.value)}>
    <option value="billId">Bill ID</option>
    <option value="mobile">Mobile Number</option>
  </select>
  <input
    type="text"
    className="form-control me-2"
    placeholder={`Search by ${searchType === 'billId' ? 'Bill ID' : 'Mobile Number'}`}
    value={searchValue}
    onChange={(e) => setSearchValue(e.target.value)}
  />
  <button className="btn btn-primary" onClick={handleSearch}>Search</button>
</div>


      <table className="table table-bordered">
        <thead className="table-light">
          <tr>
            <th>Date</th>
            <th>Medicine</th>
            <th>Dosage</th>
            <th>Quantity</th>
            <th>Amount</th>
            <th>Subtotal</th>
            <th>Total</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {bills.map((bill) =>
    bill.entries.map((entry, idx) => (
      <tr key={`${bill.billId}-${idx}`}>
        <td>{bill.billDate}</td>
        <td>{entry.medicineName}</td>
        <td>{entry.dosage}</td>
        <td>{entry.quantity}</td>
        <td>{entry.amount}</td>
        <td>{(entry.quantity * entry.amount).toFixed(2)}</td>
        <td>{bill.totalAmount}</td>
        <td>
          <button
            className="btn btn-sm btn-primary me-2"
            onClick={() => navigate(`/edit-bill/${bill.billId}`)}>
            Edit
          </button>
          <button
            className="btn btn-sm btn-danger me-2"
            onClick={() => deleteBill(bill.billId)}>
            Delete
          </button>
          <button
            className="btn btn-sm btn-secondary"
            onClick={() => printBill(bill.billId)}>
            Prints
          </button>
        </td>
      </tr>
    ))
  )}
</tbody>

      </table>
    </div>
  );
};

export default MedicalBilling;
