import { Navigate, Outlet, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import Loading from "./Loading.jsx";

// Wraps pages that need an admin
function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading message="Checking your session..." />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (user.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}

export default AdminRoute;