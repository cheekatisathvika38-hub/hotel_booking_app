import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import ErrorMessage from "../components/ErrorMessage.jsx";
import getErrorMessage from "../utils/getErrorMessage.js";
import useToast from "../hooks/useToast.js";
import Icon from "../components/Icon.jsx";

function Login() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  // If ProtectedRoute sent us here, go back to the page they wanted
  const from = location.state?.from;
  const redirectTo = from ? `${from.pathname}${from.search}` : "/";

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser's own form submit/reload
    setError("");
    setSubmitting(true);

    try {
      await login(formData.email, formData.password);
      showToast("Welcome back.");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container">
      <form className="form-card" onSubmit={handleSubmit}>
        <p className="eyebrow">Welcome back</p>
        <h1>Your next stay awaits.</h1>
        <p>Sign in to pick up where your travels left off.</p>
        <ErrorMessage message={error} />

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>

        <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
          {submitting ? "Signing in…" : <><Icon name="arrow" /> Sign in</>}
        </button>

        <p className="form-footer">
          New here? <Link to="/register">Create an account</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;