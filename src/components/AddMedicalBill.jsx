// ✅ AddMedicineBill.jsx (Final Version with Smart Suggestion Matching)

import React, { useEffect, useState, useRef } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../css/AddMedicineBill.css';

const AddMedicineBill = () => {
  const navigate = useNavigate();
  const printRef = useRef(null);

  const [inputName, setInputName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [patientNameSuggestions, setPatientNameSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [billId, setBillId] = useState(null);

  const [medicines, setMedicines] = useState([
    { medicineName: '', dosage: '', issuedQuantity: '', amount: '', subtotal: 0 },
  ]);

  const total = medicines.reduce((acc, m) => acc + (parseFloat(m.subtotal) || 0), 0);

 useEffect(() => {
  axiosInstance.get('/api/medical-bills/suggestions')
    .then(res => {
      const valid = (res.data || []).filter(
        s => s && typeof s.medicineName === 'string' && typeof s.dosage === 'string'
      );
      setSuggestions(valid);
    })
    .catch(err => console.error("Suggestions error:", err));
}, []);


  useEffect(() => {
    if (inputName.trim().length >= 2) {
      axiosInstance.get(`/api/patients/search?query=${inputName}`)
        .then(res => {
          const data = res.data;
          setPatientNameSuggestions(Array.isArray(data) ? data : []);
        })
        .catch(() => setPatientNameSuggestions([]));
    }
  }, [inputName]);

  const handlePatientInputChange = (e) => {
    const value = e.target.value;
    setInputName(value);

    const matched = patientNameSuggestions.find(
      (p) => `${p.patientName} - ${p.phoneNumber}` === value
    );

    if (matched) {
      setPatientName(matched.patientName);
      setMobile(matched.phoneNumber);
    } else {
      setPatientName(value);
      setMobile('');
    }
  };

  const updateField = (index, field, value) => {
    const updated = [...medicines];
    updated[index][field] = value;

    const name = updated[index].medicineName?.trim().toLowerCase();
    const dose = updated[index].dosage?.trim().toLowerCase();
   const match = suggestions.find(s =>
        s &&
        typeof s.medicineName === 'string' &&
        typeof s.dosage === 'string' &&
        s.medicineName.toLowerCase() === name &&
        s.dosage.toLowerCase() === dose
      );


    if (match) {
      updated[index].amount = match.amount;
    }

    const amt = parseFloat(updated[index].amount);
    const qty = parseInt(updated[index].issuedQuantity);
    updated[index].subtotal = (!isNaN(amt) && !isNaN(qty)) ? amt * qty : 0;

    setMedicines(updated);
  };

  const addRow = () => {
    setMedicines([...medicines, { medicineName: '', dosage: '', issuedQuantity: '', amount: '', subtotal: 0 }]);
  };

  const removeRow = (idx) => {
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    for (let entry of medicines) {
      if (!entry.issuedQuantity || parseInt(entry.issuedQuantity) <= 0) {
        alert("Each medicine must have quantity > 0");
        return;
      }
    }

    const confirmed = window.confirm("Do you really want to submit and print this bill?");
    if (!confirmed) return;

    try {
      const bill = {
        entries: medicines.map(m => ({
          medicineName: m.medicineName,
          dosage: m.dosage,
          amount: parseFloat(m.amount),
          quantity: 1,
          issuedQuantity: parseInt(m.issuedQuantity),
        })),
      };

      const res = await axiosInstance.post(`/api/medical-bills/create?phone=${mobile}`, bill);
      const newBill = res.data;
      setBillId(newBill?.billId);
      setPatientName(newBill?.patient?.patientName);

      localStorage.setItem("recentBillPatient", JSON.stringify({
        name: newBill.patient?.patientName,
        mobile: newBill.patient?.phoneNumber,
        billCount: newBill.entries?.length || 1,
        date: newBill.createdDate,
        time: newBill.createdTime?.slice(0, 5) || "--"
      }));

      setTimeout(() => {
        handlePrint();
        navigate('/billing');
      }, 500);

    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Save failed");
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Medicine Bill</title>
          <style>@page { size: A4; margin: 30px; } body { font-family: Arial, sans-serif; }</style>
        </head>
        <body><div class="bill-print">${printRef.current.innerHTML}</div></body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  return (
    <div className="add-bill-container">
      <h2>Add Medicine Bill</h2>
      <form onSubmit={handleSubmit}>
        <input className="form-control mb-2" placeholder="Patient Name" value={inputName}
          onChange={handlePatientInputChange} list="patient-name-list" required autoComplete="off" />
        <datalist id="patient-name-list">
          {patientNameSuggestions.map((p, i) => (
            <option key={i} value={`${p.patientName} - ${p.phoneNumber}`} />
          ))}
        </datalist>

        <input type="tel" className="form-control mb-3" placeholder="Mobile Number"
          value={mobile} onChange={e => setMobile(e.target.value)} required />

        <div className="scrollable-table">
          {medicines.map((m, idx) => (
            <div className="row g-2 mb-3" key={idx}>
              <div className="col-md-3">
                <input className="form-control" placeholder="Medicine Name" value={m.medicineName}
                  onChange={(e) => updateField(idx, 'medicineName', e.target.value)} required list="medicine-name-list" />
              </div>
              <div className="col-md-2">
                <input className="form-control" placeholder="Dosage" value={m.dosage}
                  onChange={(e) => updateField(idx, 'dosage', e.target.value)} required list="dosage-list" />
              </div>
              <div className="col-md-2">
                <input type="number" className="form-control" placeholder="Amount" value={m.amount}
                  onChange={(e) => updateField(idx, 'amount', e.target.value)} required />
              </div>
              <div className="col-md-2">
                <input type="number" className="form-control" placeholder="Qty" value={m.issuedQuantity}
                  onChange={(e) => updateField(idx, 'issuedQuantity', e.target.value)} required />
              </div>
              <div className="col-md-2">
                <input className="form-control" placeholder="Subtotal" value={m.subtotal} disabled />
              </div>
              <div className="col-md-1">
                {medicines.length > 1 && (
                  <button type="button" className="btn btn-danger" onClick={() => removeRow(idx)}>×</button>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="add-bill-buttons">
          <button type="button" className="btn btn-secondary" onClick={addRow}>+ Add More</button>
          <button type="submit" className="btn btn-primary">Submit & Print</button>
        </div>

        <div className="total-section">Total: ₹{total.toFixed(2)}</div>
      </form>

      <datalist id="medicine-name-list">
        {[...new Set(suggestions.map(s => s.medicineName))].map((name, i) => (
          <option key={i} value={name} />
        ))}
      </datalist>
      <datalist id="dosage-list">
        {[...new Set(suggestions.map(s => s.dosage))].map((dose, i) => (
          <option key={i} value={dose} />
        ))}
      </datalist>

      <div style={{ display: 'none' }}>
        <div ref={printRef} className="bill-print">
          <h2 style={{ textAlign: 'center' }}>Medicine Bill</h2>
          <p><strong>Bill ID:</strong> {billId || '--'}</p>
          <p><strong>Patient:</strong> {patientName} | <strong>Mobile:</strong> {mobile}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()} | <strong>Time:</strong> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

          <table className="bill-table">
            <thead>
              <tr>
                <th>Medicine</th>
                <th>Dosage</th>
                <th>Qty</th>
                <th>Amount</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {medicines.map((m, i) => (
                <tr key={i}>
                  <td>{m.medicineName || '--'}</td>
                  <td>{m.dosage || '--'}</td>
                  <td>{m.issuedQuantity || 0}</td>
                  <td>{m.amount || 0}</td>
                  <td>{m.subtotal || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Total: ₹{total.toFixed(2)}</h5>
          <div className="bill-footer">Thank you for choosing SanjitTech Hospital</div>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineBill;
