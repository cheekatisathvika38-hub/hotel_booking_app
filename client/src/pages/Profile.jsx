import useAuth from "../hooks/useAuth.js";
import { Link } from "react-router-dom";
import Icon from "../components/Icon.jsx";

function Profile() {
  const { user } = useAuth();
  const initials = (user?.name || "Guest").split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase();

  return (
    <div className="container">
      <div className="page-header"><div><p className="eyebrow">Your account</p><h1>Profile</h1><p>Your details, just as they are used for your StayEasy account.</p></div></div>
      <div className="profile-layout">
        <aside className="card profile-aside">
          <div className="avatar" aria-label={`${user?.name || "Guest"} initials`}>{initials}</div>
          <h2 style={{ fontSize: "1.6rem" }}>{user?.name || "Traveler"}</h2>
          <p>{user?.email}</p>
          <div className="profile-links"><Link to="/my-bookings"><Icon name="bag" size={16} /> My stays</Link><Link to="/hotels"><Icon name="search" size={16} /> Explore stays</Link></div>
        </aside>
        <section className="card">
          <p className="eyebrow">Personal details</p>
          <h2 style={{ fontSize: "1.8rem", margin: "8px 0 23px" }}>Account information</h2>
          <div className="summary-row"><span className="muted">Full name</span><strong>{user?.name || "—"}</strong></div>
          <div className="summary-row"><span className="muted">Email address</span><strong>{user?.email || "—"}</strong></div>
          <div className="summary-row"><span className="muted">Account type</span><strong className="capitalize">{user?.role || "traveler"}</strong></div>
          <p className="muted" style={{ marginTop: 20, fontSize: ".88rem" }}>Profile details are managed through your StayEasy account. Changes to account information are not currently available.</p>
        </section>
      </div>
    </div>
  );
}

export default Profile;