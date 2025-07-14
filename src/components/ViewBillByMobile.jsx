import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import '../css/ViewBillsByMobile.css';

const ViewBillsByMobile = () => {
  const { mobile } = useParams();
  const navigate = useNavigate();
  const [bills, setBills] = useState([]);
  const [patientName, setPatientName] = useState('');
  const [expandedBillIndexes, setExpandedBillIndexes] = useState([]);

  useEffect(() => {
    axiosInstance.get(`/api/medical-bills/by-mobile/${mobile}`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.every(bill => bill.entries && Array.isArray(bill.entries))) {
          setBills(res.data);
          if (res.data.length > 0) {
            const name = res.data[0]?.patient?.patientName || '';
            setPatientName(name);
          }
        } else {
          setBills([]);
        }
      })
      .catch(err => {
        console.error("❌ Error loading bills", err);
        setBills([]);
      });
  }, [mobile]);

  const toggleExpand = (index) => {
    setExpandedBillIndexes(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="view-bills-container">
      <div className="view-bills-header">
        <h2>Medicine Bills for: <span>{patientName}</span> ({mobile})</h2>
        <button className="back-btn" onClick={() => navigate('/billing')}>← Back</button>
      </div>

      {bills.length === 0 ? (
        <p className="no-data-msg">No bills found for this patient.</p>
      ) : (
        bills.map((bill, index) => {
          const isExpanded = expandedBillIndexes.includes(index);
          const totalAmount = (bill.entries || []).reduce((sum, e) => {
            const amt = parseFloat(e.amount || e.medicine?.amount || 0);
            const qty = parseInt(e.issuedQuantity || 0);
            return sum + (isNaN(amt) || isNaN(qty) ? 0 : amt * qty);
          }, 0).toFixed(2);

          return (
            <div key={index} className="bill-card">
              <div className="bill-header">
                <span><strong>Bill ID:</strong> {bill.billId}</span>
                <span>&nbsp; | &nbsp;</span>
                <span><strong>Date:</strong> {bill.billDate}</span>
                <button 
                  className="dropdown-toggle" 
                  onClick={() => toggleExpand(index)}
                >
                  {isExpanded ? '▲ Hide' : '▼ Show'}
                </button>
              </div>

              {isExpanded && (
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
                          <td>{entry.medicine?.name || '--'}</td>
                          <td>{entry.medicine?.dosage || '--'}</td>
                          <td>{entry.medicine?.amount || 0}</td>
                          <td>{entry.issuedQuantity}</td>
                          <td>{entry.subtotal || (entry.medicine?.amount || 0) * entry.issuedQuantity}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h5 className="total-amount">Total: ₹{totalAmount}</h5>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ViewBillsByMobile;
