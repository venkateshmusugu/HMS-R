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
      .then(res => setSuggestions(res.data))
      .catch(err => console.error("Suggestions error:", err));
  }, []);

  useEffect(() => {
    if (inputName.trim().length >= 2) {
      axiosInstance.get(`/api/patients/search?query=${inputName}`)
        .then(res => setPatientNameSuggestions(res.data))
        .catch(err => console.error("Patient name search error:", err));
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

    if (field === 'medicineName' || field === 'dosage') {
      const name = updated[index].medicineName?.toLowerCase() || '';
      const dose = updated[index].dosage?.toLowerCase() || '';
      const match = suggestions.find(
        s => s?.medicineName?.toLowerCase?.() === name && s?.dosage?.toLowerCase?.() === dose
      );
      if (match) {
        updated[index].amount = match.amount;
      }
    }

    if (field === 'amount' || field === 'issuedQuantity') {
      const amt = parseFloat(updated[index].amount);
      const qty = parseInt(updated[index].issuedQuantity);
      updated[index].subtotal = isNaN(amt * qty) ? 0 : amt * qty;
    }

    setMedicines(updated);
  };

  const addRow = () => {
    setMedicines([...medicines, { medicineName: '', dosage: '', issuedQuantity: '', amount: '', subtotal: 0 }]);
  };

  const removeRow = (idx) => {
    const updated = medicines.filter((_, i) => i !== idx);
    setMedicines(updated);
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
          patientName,
          mobile,
          medicineName: m.medicineName,
          dosage: m.dosage,
          amount: parseFloat(m.amount),
          quantity: 1,
          issuedQuantity: parseInt(m.issuedQuantity),
        })),
      };

      await axiosInstance.post('/api/medical-bills/create', bill);
      const response = await axiosInstance.get(`/api/medical-bills/by-phone/${mobile}`);
      const latestBill = response.data[response.data.length - 1];
      setBillId(latestBill?.billId);

      setTimeout(() => {
        handlePrint(); // print after billId is set
      }, 500);
    } catch (err) {
      console.error("❌ Save failed:", err);
      alert("Save failed");
    }
  };

  const handlePrint = () => {
    const printContents = printRef.current.innerHTML;
    const originalContents = document.body.innerHTML;
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  return (
    <div className="add-bill-container">
      <h2>Add Medicine Bill</h2>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          placeholder="Patient Name"
          value={inputName}
          onChange={handlePatientInputChange}
          list="patient-name-list"
          required
          autoComplete="off"
        />
        <datalist id="patient-name-list">
          {patientNameSuggestions.map((p, i) => (
            <option key={i} value={`${p.patientName} - ${p.phoneNumber}`} />
          ))}
        </datalist>

        <input
          className="form-control mb-3"
          placeholder="Mobile Number"
          value={mobile}
          onChange={e => setMobile(e.target.value)}
          required
        />

        <div className="scrollable-table">
          {medicines.map((m, idx) => (
            <div className="row g-2 mb-3" key={idx}>
              <div className="col-md-3">
                <input
                  className="form-control"
                  placeholder="Medicine Name"
                  value={m.medicineName}
                  onChange={(e) => updateField(idx, 'medicineName', e.target.value)}
                  required
                  list="medicine-name-list"
                />
              </div>
              <div className="col-md-2">
                <input
                  className="form-control"
                  placeholder="Dosage"
                  value={m.dosage}
                  onChange={(e) => updateField(idx, 'dosage', e.target.value)}
                  required
                  list="dosage-list"
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Amount"
                  value={m.amount}
                  onChange={(e) => updateField(idx, 'amount', e.target.value)}
                  required
                />
              </div>
              <div className="col-md-2">
                <input
                  type="number"
                  className="form-control"
                  placeholder="Qty"
                  value={m.issuedQuantity}
                  onChange={(e) => updateField(idx, 'issuedQuantity', e.target.value)}
                  required
                />
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
        {suggestions.map((s, i) => <option key={i} value={s.medicineName} />)}
      </datalist>
      <datalist id="dosage-list">
        {suggestions.map((s, i) => <option key={i} value={s.dosage} />)}
      </datalist>

      {/* Hidden Printable Section */}
      <div style={{ display: 'none' }}>
        <div ref={printRef}>
          <h2 style={{ textAlign: 'center' }}>Medicine Bill</h2>
          <p><strong>Bill ID:</strong> {billId || '--'}</p>
          <p><strong>Patient:</strong> {patientName} | <strong>Mobile:</strong> {mobile}</p>
          <p><strong>Date:</strong> {new Date().toLocaleDateString()} | <strong>Time:</strong> {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

          <table className="table">
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
                  <td>{m.medicineName}</td>
                  <td>{m.dosage}</td>
                  <td>{m.issuedQuantity}</td>
                  <td>{m.amount}</td>
                  <td>{m.subtotal}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <h5>Total: ₹{total.toFixed(2)}</h5>
        </div>
      </div>
    </div>
  );
};

export default AddMedicineBill;
