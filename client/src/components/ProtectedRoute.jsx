import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Loading from "./Loading.jsx";

// Wraps pages that need a logged-in user
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the saved-token check, otherwise a refresh would bounce to /login
  if (loading) return <Loading message="Checking your session..." />;

  if (!user) {
    // Remember where they were going, so login can send them back
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
}

export default ProtectedRoute;