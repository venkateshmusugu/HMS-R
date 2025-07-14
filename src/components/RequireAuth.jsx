import { Navigate, useLocation } from 'react-router-dom';

const RequireAuth = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  const location = useLocation();

  if (!token) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  if (
    allowedRoles &&
    !allowedRoles.map((r) => r.toUpperCase()).includes(role?.toUpperCase())
  ) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default RequireAuth;
  