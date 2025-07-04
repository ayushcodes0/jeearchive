// components/PrivateRoute.jsx
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('admin_token');
  if (!token) return <Navigate to="/register" replace />;

  try {
    const { exp } = jwtDecode(token);
    if (Date.now() >= exp * 1000) throw new Error('expired');
    return children;
  } catch {
    localStorage.removeItem('admin_token');
    return <Navigate to="/register" replace />;
  }
};

export default PrivateRoute;
