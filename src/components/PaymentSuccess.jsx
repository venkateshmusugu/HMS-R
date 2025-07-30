import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

function PaymentSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const hospitalId = searchParams.get('hospitalId');
    const plan = searchParams.get('plan');

    if (hospitalId && plan) {
      console.log("✅ Payment successful for:", hospitalId, plan);
      // TODO: Call your backend to update hospital license/paymentDone=true

      setTimeout(() => {
        navigate("/home-login"); // redirect after success
      }, 2000);
    } else {
      console.warn("❌ Missing hospitalId or plan in query params");
      navigate("/"); // fallback
    }
  }, [navigate, searchParams]);

  return (
    <div className="text-center mt-5">
      <h2>✅ Payment Successful!</h2>
      <p>You’ll be redirected to login shortly...</p>
    </div>
  );
}

export default PaymentSuccess;
