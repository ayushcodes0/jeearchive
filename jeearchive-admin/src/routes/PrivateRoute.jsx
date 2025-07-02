import { Navigate } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const isAdmin = localStorage.getItem("admin_token");
  return isAdmin ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
