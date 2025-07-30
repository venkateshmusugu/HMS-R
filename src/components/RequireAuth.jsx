import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  const hospitalId = localStorage.getItem('hospitalId'); // ✅ Enforce hospital-based access
  const location = useLocation();

  // 🔐 Check login
  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // 🏥 Enforce hospital context
  if (!hospitalId) {
    return <Navigate to="/select-hospital" state={{ from: location }} replace />;
  }

  // 👮 Role-based check
  if (
    allowedRoles &&
    !allowedRoles.map((r) => r.toUpperCase()).includes(role?.toUpperCase())
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
