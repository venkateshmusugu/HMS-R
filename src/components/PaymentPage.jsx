import React, { useEffect, useState } from "react";

const PaymentPage = () => {
  const [status, setStatus] = useState("");

  useEffect(() => {
    setTimeout(() => setStatus("Success"), 1000);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      {status === "Success" ? (
        <h2>✅ Payment successful and hospital registered!</h2>
      ) : (
        <h2>⏳ Verifying payment...</h2>
      )}
    </div>
  );
};

export default PaymentPage;
  