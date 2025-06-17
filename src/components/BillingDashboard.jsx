import React from 'react';
import { useParams } from 'react-router-dom';

const BillingDashboard = () => {
  const { role } = useParams();

  return <div>Welcome to the {role} dashboard!</div>;
};

export default BillingDashboard;