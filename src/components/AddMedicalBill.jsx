import React, { useEffect, useState } from 'react';
import axiosInstance from '../axiosInstance';
import { useNavigate } from 'react-router-dom';
import '../css/AddMedicineBill.css';

const AddMedicineBill = () => {
  const navigate = useNavigate();
  const hospitalId = localStorage.getItem('hospitalId');

  const [hospitalConfig, setHospitalConfig] = useState({ hospitalName: '', logoUrl: '' });
  const [inputName, setInputName] = useState('');
  const [patientName, setPatientName] = useState('');
  const [mobile, setMobile] = useState('');
  const [patientNameSuggestions, setPatientNameSuggestions] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  const [medicines, setMedicines] = useState([
    { medicineName: '', dosage: '', issuedQuantity: '', amount: '', subtotal: 0 },
  ]);

  const total = medicines.reduce((acc, m) => acc + (parseFloat(m.subtotal) || 0), 0);

  useEffect(() => {
    if (!hospitalId) {
      alert("❌ Hospital context missing. Please select a hospital.");
      navigate("/select-hospital");
      return;
    }

   axiosInstance.get(`/api/hospitals/${hospitalId}`)
    .then(res => {
      const data = res.data || {};
      setHospitalConfig({
        hospitalName: data.hospitalName || 'Unnamed Hospital',
        logoUrl: data.logoUrl || ''
      });
    })
    .catch(err => {
      console.error("❌ Failed to load hospital:", err);
      alert("❌ Failed to load hospital information.");
    });
}, [hospitalId, navigate]);

  useEffect(() => {
    if (!hospitalId) return;

    axiosInstance.get('/api/medical-bills/suggestions', { params: { hospitalId } })
      .then(res => {
        const valid = (res.data || []).filter(
          s => s && typeof s.medicineName === 'string' && typeof s.dosage === 'string'
        );
        setSuggestions(valid);
      })
      .catch(err => console.error("Suggestions error:", err));
  }, [hospitalId]);

  useEffect(() => {
    if (inputName.trim().length >= 2 && hospitalId) {
      axiosInstance.get(`/api/patients/search`, {
        params: { query: inputName, hospitalId }
      })
        .then(res => setPatientNameSuggestions(Array.isArray(res.data) ? res.data : []))
        .catch(() => setPatientNameSuggestions([]));
    }
  }, [inputName, hospitalId]);

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

  const handleDosageBlur = async (index) => {
  const current = medicines[index];
  const name = current.medicineName?.trim();
  const dose = current.dosage?.trim();
  const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

  if (!name || !dose || !hospitalId) return;

  const match = suggestions.find(
    s =>
      s.medicineName?.toLowerCase() === name.toLowerCase() &&
      s.dosage?.toLowerCase() === dose.toLowerCase()
  );

  if (match) {
    const updated = [...medicines];
    updated[index].amount = match.amount;
    const amt = parseFloat(match.amount);
    const qty = parseInt(updated[index].issuedQuantity);
    updated[index].subtotal = (!isNaN(amt) && !isNaN(qty)) ? amt * qty : 0;
    setMedicines(updated);
  } else {
    try {
      const res = await axiosInstance.get('/api/medicines/find', {
        params: { name, dosage: dose, hospitalId }
      });

      if (res.data) {
        const updated = [...medicines];
        updated[index].amount = res.data.amount;
        const amt = parseFloat(res.data.amount);
        const qty = parseInt(updated[index].issuedQuantity);
        updated[index].subtotal = (!isNaN(amt) && !isNaN(qty)) ? amt * qty : 0;
        setMedicines(updated);
        return;
      }
    } catch (err) {
      console.log("❌ Backend fetch error:", err);
    }

    const confirmSave = window.confirm(`🆕 Medicine "${name} (${dose})" not found.\nDo you want to save it as a new medicine?`);
    if (confirmSave) {
      try {
        let amt = parseFloat(current.amount);
        if (!amt || amt <= 0) {
          const input = window.prompt(`Enter price per unit for "${name} (${dose})":`);
          amt = parseFloat(input);
          if (!amt || amt <= 0) {
            alert("❌ Invalid amount. Cannot save medicine.");
            return;
          }
        }

        await axiosInstance.post('/api/medicines/create', {
            name,
            dosage: dose,
            amount: amt
          }, {
            params: { hospitalId },
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
setSuggestions(prev => [...prev, res.data]);

        const updated = [...medicines];
        updated[index].amount = amt;
        const qty = parseInt(updated[index].issuedQuantity);
        updated[index].subtotal = (!isNaN(amt) && !isNaN(qty)) ? amt * qty : 0;
        setMedicines(updated);

        setSuggestions(prev => [...prev, res.data]);
        alert("✅ New medicine saved.");
      } catch (err) {
        if (err.response?.status === 409) {
          alert("⚠️ This medicine already exists.");
        } else {
          alert("❌ Failed to save new medicine.");
        }
      }
    }
  }
};


 const handleSubmit = async (e) => {
  e.preventDefault();
   const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
   console.log("Sending token:", token);

  const seen = new Set();
  for (let entry of medicines) {
    const key = `${entry.medicineName?.trim().toLowerCase()}|${entry.dosage?.trim().toLowerCase()}`;
    if (seen.has(key)) {
      alert(`Duplicate medicine entry: ${entry.medicineName} ${entry.dosage}`);
      return;
    }
    seen.add(key);
  }

  for (let entry of medicines) {
    if (!entry.issuedQuantity || parseInt(entry.issuedQuantity) <= 0) {
      alert("Each medicine must have quantity > 0");
      return;
    }
  }

  const confirmed = window.confirm("Do you really want to submit and print this bill?");
  if (!confirmed) return;

  try {
        const billPayload = {
        hospital: { id: parseInt(hospitalId) },
        entries: medicines.map((m) => ({
          medicine: {
            name: m.medicineName,
            dosage: m.dosage,
            amount: parseFloat(m.amount),
          },
          quantity: 1,
          issuedQuantity: parseInt(m.issuedQuantity),
        })),
      };

      const response = await axiosInstance.post(
        'http://localhost:8081/api/medical-bills/create',
        billPayload,
        {
          params: { phone: mobile },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );


    const newBill = response.data;

    localStorage.setItem("recentBillPatient", JSON.stringify({
      name: newBill.patient?.patientName,
      mobile: newBill.patient?.phoneNumber,
      billCount: newBill.entries?.length || 1,
      date: newBill.createdDate,
      time: newBill.createdTime?.slice(0, 5) || "--",
    }));

    if (!newBill?.billId) {
      alert("❌ Bill ID missing. Cannot navigate.");
      return;
    }

    navigate(`/print/${newBill.billId}`);
  } catch (err) {
    console.error("❌ Save failed:", err);
    alert("Save failed");
  }
};


  return (
    <div className='add-medicine-page'>
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
                    onChange={(e) => updateField(idx, 'dosage', e.target.value)}
                    onBlur={() => handleDosageBlur(idx)}
                    required list="dosage-list" />
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
            <button type="button" className="btn btn-secondary mb-3" onClick={addRow}>+ Add More</button>
            <button type="button" className="btn btn-secondary mb-3" onClick={() => navigate('/billing')}>← Back</button>
            <button type="submit" className="btn btn-primary mb-3">Submit & Print</button>
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
      </div>
    </div>
  );
};

export default AddMedicineBill;
