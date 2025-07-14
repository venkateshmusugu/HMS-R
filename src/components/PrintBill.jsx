import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axiosInstance from '../axiosInstance';
import { QRCodeSVG } from 'qrcode.react';
import '../css/PrintBill.css';

const PrintBill = () => {
  const { billId } = useParams();
  const containerRef = useRef();
  const [bill, setBill] = useState(null);
  const [config, setConfig] = useState({
    hospitalName: '',
    logoUrl: '',
    address: '',
    contact: '',
    gst: '',
  });
  const [logoLoaded, setLogoLoaded] = useState(false);

  useEffect(() => {
    axiosInstance.get('/api/hospital-config').then(res => {
      setConfig(prev => ({ ...prev, ...res.data }));
    });
  }, []);

  useEffect(() => {
    axiosInstance.get(`/api/medical-bills/by-bill-id/${billId}`)
      .then(res => setBill(res.data))
      .catch(err => console.error("❌ Bill Fetch Error:", err));
  }, [billId]);

 useEffect(() => {
  const configReady = config.address && config.contact;

  if (bill && configReady && (config.logoUrl === '' || logoLoaded)) {
    const timeout = setTimeout(() => {
      console.log("🖨️ Printing...");
      window.print();
    }, 1200);

    return () => clearTimeout(timeout);
  }
}, [bill, config, logoLoaded]);


  if (!bill) return <p>Loading...</p>;

  return (
    <div className="print-container" ref={containerRef}>
      <div className="header">
        {config.logoUrl && (
          <img
            src={`http://localhost:8081${config.logoUrl}`}
            alt="Hospital Logo"
            onLoad={() => setLogoLoaded(true)}
          />
        )}
        <div className="header-details">
          <h2>{config.hospitalName || 'Hospital Name'}</h2>
          <p>{config.gst ? `GSTIN: ${config.gst}` : 'GSTIN: N/A'}</p>
        </div>
      </div>

      <div className="bill-metadata">
        <h3>Bill ID: {bill.billId}</h3>
        <p>Date: {bill.billDate}</p>
        <p>Patient Name: {bill.patient?.patientName || 'N/A'}</p>
        <p>Phone Number: {bill.patient?.phoneNumber || 'N/A'}</p>
        <p>Address: {bill.patient?.address || 'N/A'}</p>
      </div>

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
          {bill.entries.map((e, i) => {
            const qty = e.issuedQuantity || e.quantity || 1;
            const amt = parseFloat(e.medicine?.amount) || 0;
            const subtotal = (qty * amt).toFixed(2);

            return (
              <tr key={i}>
                <td>{e.medicine?.name || 'N/A'}</td>
                <td>{e.medicine?.dosage || 'N/A'}</td>
                <td>{qty}</td>
                <td>{amt.toFixed(2)}</td>
                <td>{subtotal}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="total">Total: ₹{bill.totalAmount?.toFixed(2)}</div>

      <div className="footer">
        <div className="footer-text">
          Thank you for choosing {config.hospitalName || 'Our Hospital'}!
        </div>
        <div className="signature">
          <p><strong>Authorized Signature</strong></p>
          <div style={{ borderTop: '1px solid #000', width: '150px' }}></div>
        </div>
      </div>

      <div className="qr-section">
        <QRCodeSVG value={`BillID-${bill.billId}`} size={100} />
        <p style={{ fontSize: '12px', marginTop: '5px' }}>Scan for Bill Info</p>
      </div>
    </div>
  );
};

export default PrintBill;
