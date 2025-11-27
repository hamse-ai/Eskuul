import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ user, allowedRoles, children }) => {
  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but doesn't have permission
    return <Navigate to="/" />;
  }

  // Authorized → render content
  return children;
};

export default ProtectedRoute;
