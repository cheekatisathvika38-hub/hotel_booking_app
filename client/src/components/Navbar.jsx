import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState } from "react";
import useAuth from "../hooks/useAuth.js";
import Icon from "./Icon.jsx";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="navbar">
      <div className="container navbar-inner">
        <Link to="/" className="brand" onClick={() => setOpen(false)}><span className="brand-mark"><Icon name="hotel" size={17} /></span>StayEasy</Link>
        <button className="menu-toggle" type="button" aria-label={open ? "Close navigation menu" : "Open navigation menu"} aria-expanded={open} onClick={() => setOpen(!open)}><Icon name={open ? "close" : "menu"} /></button>
        <nav className={`nav-links${open ? " is-open" : ""}`} aria-label="Main navigation">
          <NavLink to="/" end onClick={() => setOpen(false)}>Home</NavLink>
          <NavLink to="/hotels" onClick={() => setOpen(false)}>Explore stays</NavLink>

          {user ? (
            <>
              <NavLink to="/my-bookings" onClick={() => setOpen(false)}>My stays</NavLink>
              {user.role === "admin" && <NavLink to="/admin" onClick={() => setOpen(false)}>Admin</NavLink>}
              <NavLink to="/profile" onClick={() => setOpen(false)}>Profile</NavLink>
              <button className="btn btn-quiet" onClick={handleLogout}><Icon name="logout" size={16} /> Sign out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>Log in</NavLink>
              <NavLink to="/register" className="btn btn-primary" onClick={() => setOpen(false)}>Create account</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Navbar;