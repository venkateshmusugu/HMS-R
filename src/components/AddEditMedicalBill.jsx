// // File: components/AddEditMedicalBill.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import axiosInstance from '../axiosInstance';

// const AddEditMedicalBill = () => {
//   const { patientId, billId } = useParams();
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState([
//     { medicineName: '', dosage: '', quantity: 1, amount: 0 }
//   ]);

//   const [totalAmount, setTotalAmount] = useState(0);

//   useEffect(() => {
//     if (billId) {
//       // Fetch existing bill for edit
//       axiosInstance.get(`/api/medical-bills/${billId}`).then((res) => {
//         setFormData([res.data]);
//         setTotalAmount(res.data.totalAmount || 0);
//       });
//     }
//   }, [billId]);

//   useEffect(() => {
//     // Update total whenever formData changes
//     const total = formData.reduce(
//       (sum, item) => sum + item.quantity * item.amount,
//       0
//     );
//     setTotalAmount(total);
//   }, [formData]);

//   const handleChange = (index, field, value) => {
//     const updated = [...formData];
//     updated[index][field] = field === 'quantity' || field === 'amount' ? Number(value) : value;
//     setFormData(updated);
//   };

//   const handleAddRow = () => {
//     setFormData([
//       ...formData,
//       { medicineName: '', dosage: '', quantity: 1, amount: 0 }
//     ]);
//   };

//   const handleRemoveRow = (index) => {
//     const updated = formData.filter((_, i) => i !== index);
//     setFormData(updated);
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       for (const item of formData) {
//         const payload = {
//           patientId: Number(patientId),
//           medicineName: item.medicineName,
//           dosage: item.dosage,
//           quantity: item.quantity,
//           amount: item.amount,
//           totalAmount: totalAmount
//         };

//         if (billId) {
//           await axiosInstance.put(`/api/medical-bills/${billId}`, payload);
//         } else {
//           await axiosInstance.post('/api/medical-bills', payload);
//         }
//       }
//       alert('✅ Bill saved successfully');
//       navigate(`/billing/${patientId}`);
//     } catch (err) {
//       console.error('❌ Error saving bill:', err);
//       alert('❌ Failed to save bill');
//     }
//   };

//   return (
//     <div className="container mt-4">
//       <h2>{billId ? 'Edit Medical Bill' : 'Add Medical Bill'}</h2>
//       <form onSubmit={handleSubmit}>
//         {formData.map((item, index) => (
//           <div key={index} className="card p-3 mb-3 shadow-sm">
//             <div className="row g-2">
//               <div className="col-md-3">
//                 <input
//                   className="form-control"
//                   placeholder="Medicine Name"
//                   value={item.medicineName}
//                   onChange={(e) => handleChange(index, 'medicineName', e.target.value)}
//                   required
//                 />
//               </div>
//               <div className="col-md-2">
//                 <input
//                   className="form-control"
//                   placeholder="Dosage"
//                   value={item.dosage}
//                   onChange={(e) => handleChange(index, 'dosage', e.target.value)}
//                 />
//               </div>
//               <div className="col-md-2">
//                 <input
//                   type="number"
//                   className="form-control"
//                   placeholder="Quantity"
//                   value={item.quantity}
//                   onChange={(e) => handleChange(index, 'quantity', e.target.value)}
//                   min="1"
//                 />
//               </div>
//               <div className="col-md-2">
//                 <input
//                   type="number"
//                   className="form-control"
//                   placeholder="Amount"
//                   value={item.amount}
//                   onChange={(e) => handleChange(index, 'amount', e.target.value)}
//                   min="0"
//                 />
//               </div>
//               <div className="col-md-2 d-flex align-items-center">
//                 <strong>
//                   ₹ {(item.quantity * item.amount).toFixed(2)}
//                 </strong>
//               </div>
//               <div className="col-md-1">
//                 {formData.length > 1 && (
//                   <button
//                     type="button"
//                     className="btn btn-danger"
//                     onClick={() => handleRemoveRow(index)}>
//                     ✕
//                   </button>
//                 )}
//               </div>
//             </div>
//           </div>
//         ))}

//         <div className="mb-3">
//           <button type="button" className="btn btn-secondary me-2" onClick={handleAddRow}>
//             + Add Medicine
//           </button>
//           <button type="submit" className="btn btn-primary">
//             {billId ? 'Update' : 'Submit'} Bill
//           </button>
//         </div>

//         <h4 className="text-end">Total Amount: ₹ {totalAmount.toFixed(2)}</h4>
//       </form>
//     </div>
//   );
// };

// export default AddEditMedicalBill;
