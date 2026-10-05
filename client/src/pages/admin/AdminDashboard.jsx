import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import AdminNavigation from "../../components/AdminNavigation.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import Icon from "../../components/Icon.jsx";
import getErrorMessage from "../../utils/getErrorMessage.js";

function AdminDashboard() {
  const [counts, setCounts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [hotelsRes, bookingsRes] = await Promise.all([api.get("/hotels"), api.get("/admin/bookings")]);
      const hotels = hotelsRes.data.hotels || [];
      const roomGroups = await Promise.all(hotels.map((hotel) => api.get(`/hotels/${hotel._id}/rooms`)));
      setCounts({
        hotels: hotels.length,
        rooms: roomGroups.reduce((sum, res) => sum + (res.data.rooms || []).length, 0),
        bookings: (bookingsRes.data.bookings || []).length,
      });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load, reload]);

  return <div className="container">
    <div className="admin-shell">
      <AdminNavigation />
      <main className="admin-content">
        <div className="page-header"><div><p className="eyebrow">StayEasy operations</p><h1>Overview</h1><p>A live view of the properties, rooms, and reservations in your system.</p></div></div>
        {loading && <Loading message="Loading workspace data…" />}
        <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
        {!loading && !error && counts && <>
          <div className="admin-stats">
            <article className="card stat-card"><span>Listed properties</span><strong>{counts.hotels}</strong></article>
            <article className="card stat-card"><span>Room inventory</span><strong>{counts.rooms}</strong></article>
            <article className="card stat-card"><span>All bookings</span><strong>{counts.bookings}</strong></article>
          </div>
          <div className="section-heading" style={{ marginTop: 35 }}><div><p className="eyebrow">Quick access</p><h2>Keep things in order.</h2></div></div>
          <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))" }}>
            <Link className="card" to="/admin/hotels"><Icon name="hotel" size={22} /><h3 style={{ margin: "17px 0 6px" }}>Manage properties</h3><p className="muted">Create, update, and remove hotel listings and their rooms.</p></Link>
            <Link className="card" to="/admin/bookings"><Icon name="bag" size={22} /><h3 style={{ margin: "17px 0 6px" }}>Review bookings</h3><p className="muted">View reservation records and filter by their current status.</p></Link>
          </div>
        </>}
      </main>
    </div>
  </div>;
}

export default AdminDashboard;