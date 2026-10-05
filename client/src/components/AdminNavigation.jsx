import { NavLink } from "react-router-dom";
import Icon from "./Icon.jsx";

function AdminNavigation() {
  return <aside className="admin-nav">
    <p className="eyebrow">Workspace</p>
    <nav className="admin-nav-links" aria-label="Administration">
      <NavLink to="/admin" end><Icon name="home" size={16} /> Overview</NavLink>
      <NavLink to="/admin/hotels"><Icon name="hotel" size={16} /> Properties</NavLink>
      <NavLink to="/admin/bookings"><Icon name="bag" size={16} /> Bookings</NavLink>
    </nav>
  </aside>;
}

export default AdminNavigation;