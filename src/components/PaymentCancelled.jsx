
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PaymentCancelled = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/"); // or wherever user can try again
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <div>❌ Payment was cancelled. Redirecting to plan selection...</div>;
};

export default PaymentCancelled;
