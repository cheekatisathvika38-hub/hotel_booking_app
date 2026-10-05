import { useCallback, useEffect, useState } from "react";
import api from "../../api/axios.js";
import AdminNavigation from "../../components/AdminNavigation.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import Icon from "../../components/Icon.jsx";
import getErrorMessage from "../../utils/getErrorMessage.js";

const statuses = ["all", "confirmed", "cancelled", "completed"];
const dateLabel = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—";

function ManageBookings() {
  const [status, setStatus] = useState("all");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/admin/bookings", { params: status === "all" ? {} : { status } });
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [status]);
  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load, reload]);

  return <div className="container">
    <div className="admin-shell"><AdminNavigation /><main className="admin-content">
      <div className="page-header"><div><p className="eyebrow">Guest reservations</p><h1>Bookings</h1><p>Review stays and their current status. Reservation records are read-only here.</p></div></div>
      <div className="filter-tabs" role="group" aria-label="Filter bookings by status">{statuses.map((item) => <button type="button" key={item} aria-pressed={status === item} onClick={() => setStatus(item)}>{item === "all" ? "All bookings" : item[0].toUpperCase() + item.slice(1)}</button>)}</div>
      {loading && <Loading message="Loading reservations…" />}
      <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
      {!loading && !error && bookings.length === 0 && <div className="empty-state"><div className="empty-mark"><Icon name="bag" /></div><h2>No {status === "all" ? "" : `${status} `}bookings found</h2><p>Reservations matching this filter will appear here when guests make a booking.</p>{status !== "all" && <button type="button" className="btn" onClick={() => setStatus("all")}>View all bookings</button>}</div>}
      {!loading && !error && bookings.length > 0 && <div className="table-wrap"><table><thead><tr><th>Guest</th><th>Property / room</th><th>Stay dates</th><th>Guests</th><th>Total</th><th>Status</th></tr></thead><tbody>{bookings.map((booking) => {
        const user = booking.user || {};
        const hotel = booking.hotel || {};
        const room = booking.room || {};
        return <tr key={booking._id}>
          <td><strong>{user.name || "Guest"}</strong><br /><span className="muted">{user.email || "Email unavailable"}</span></td>
          <td><strong>{hotel.name || "Property unavailable"}</strong><br /><span className="muted">{room.roomType || "Room"}{room.roomNumber ? ` · #${room.roomNumber}` : ""}</span></td>
          <td>{dateLabel(booking.checkInDate)} — {dateLabel(booking.checkOutDate)}</td><td>{booking.numberOfGuests ?? "—"}</td>
          <td>₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")}</td><td><span className={`status-pill ${booking.status || ""}`}>{booking.status || "Unknown"}</span></td>
        </tr>;
      })}</tbody></table></div>}
    </main></div>
  </div>;
}

export default ManageBookings;