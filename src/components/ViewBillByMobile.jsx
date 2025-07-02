// ViewBillsByMobile.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../css/ViewBillsByMobile.css'; // 👈 Add this line for styling

const ViewBillsByMobile = () => {
  const { mobile } = useParams();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/api/medical-bills/by-mobile/${mobile}`)
      .then(res => {
        console.log("✅ bills response:", res.data);
        if (Array.isArray(res.data)) {
          setBills(res.data);
        } else {
          setBills([]);
          console.warn("⚠️ Unexpected response format:", res.data);
        }
      })
      .catch(err => {
        console.error("❌ Error loading bills", err);
        setBills([]);
      });
  }, [mobile]);

  return (
    <div className="view-bills-container">
      <div className="view-bills-header">
        <h2>Medicine Bills for <span>{mobile}</span></h2>
        <button className="back-btn" onClick={() => navigate('/billing')}>← Back</button>
      </div>

      {bills.length === 0 ? (
        <p className="no-data-msg">No bills found for this patient.</p>
      ) : (
        bills.map((bill, index) => (
          <div key={index} className="bill-card">
            <div className="bill-header">
              <strong>Bill Date:</strong> {bill.billDate}
            </div>
            <div className="bill-body">
              <table className="bill-table">
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage</th>
                    <th>Amount</th>
                    <th>Quantity</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {(bill.entries || []).map((entry, i) => (
                    <tr key={i}>
                      <td>{entry.medicineName}</td>
                      <td>{entry.dosage}</td>
                      <td>{entry.amount}</td>
                      <td>{entry.quantity}</td>
                      <td>{entry.totalAmount || entry.amount * entry.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <h5 className="total-amount">Total: ₹{bill.totalAmount?.toFixed(2) || 0}</h5>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ViewBillsByMobile;
