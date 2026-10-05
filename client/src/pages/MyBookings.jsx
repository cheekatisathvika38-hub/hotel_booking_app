import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Icon from "../components/Icon.jsx";
import getErrorMessage from "../utils/getErrorMessage.js";
import useToast from "../hooks/useToast.js";

const readableDate = (date) => date ? new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—";

function MyBookings() {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");
  const [refresh, setRefresh] = useState(0);
  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/bookings/my-bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    Promise.resolve().then(() => loadBookings());
  }, [loadBookings, refresh]);

  const cancelBooking = async (booking) => {
    if (!window.confirm("Cancel this confirmed stay? This action cannot be undone.")) return;
    setBusyId(booking._id);
    setActionError("");
    setNotice("");
    try {
      await api.put(`/bookings/${booking._id}/cancel`);
      setNotice("Your booking has been cancelled.");
      showToast("Your booking has been cancelled.");
      setRefresh((value) => value + 1);
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setBusyId("");
    }
  };

  return (
    <div className="container">
      <div className="page-header"><div><p className="eyebrow">Your travel, together</p><h1>My stays</h1><p>Find the details for your upcoming plans, or revisit a trip you’ve taken.</p></div><Link to="/hotels" className="btn btn-primary"><Icon name="plus" size={17} /> Find a stay</Link></div>
      {notice && <p className="notice" role="status">{notice}</p>}
      <ErrorMessage message={actionError} />
      {loading && <Loading message="Loading your stays…" />}
      <ErrorMessage message={error} onRetry={loadBookings} />
      {!loading && !error && bookings.length === 0 && <div className="empty-state"><div className="empty-mark"><Icon name="bag" /></div><h2>Your next stay starts here.</h2><p>Once you’ve booked a room, all the important details will be waiting here.</p><Link to="/hotels" className="btn btn-primary">Explore stays <Icon name="arrow" size={16} /></Link></div>}
      {!loading && !error && bookings.length > 0 && <div className="booking-list">{bookings.map((booking) => {
        const hotel = booking.hotel || {};
        const room = booking.room || {};
        const image = hotel.images?.[0];
        return <article className="card booking-card" key={booking._id}>
          {image ? <img src={image} alt={`${hotel.name || "Hotel"} property`} /> : <div className="card-image card-image-empty">StayEasy</div>}
          <div className="booking-card-content">
            <div className="card-title-row"><h2 style={{ fontSize: "1.55rem" }}>{hotel.name || "Stay details"}</h2><span className={`status-pill ${booking.status || ""}`}>{booking.status || "Status unavailable"}</span></div>
            <p className="muted">{[hotel.address, hotel.city].filter(Boolean).join(" · ") || "Address unavailable"}</p>
            <p className="capitalize" style={{ marginTop: 8 }}>{room.roomType || "Room"}{room.roomNumber ? ` · Room ${room.roomNumber}` : ""}</p>
            <div className="booking-meta"><span><Icon name="calendar" size={15} /> {readableDate(booking.checkInDate)} — {readableDate(booking.checkOutDate)}</span><span><Icon name="guests" size={15} /> {booking.numberOfGuests} {booking.numberOfGuests === 1 ? "guest" : "guests"}</span><span>₹{Number(booking.totalPrice || 0).toLocaleString("en-IN")} total</span></div>
          </div>
          <div className="booking-card-actions">{booking.status === "confirmed" && <button type="button" className="btn btn-danger" disabled={busyId === booking._id} onClick={() => cancelBooking(booking)}>{busyId === booking._id ? "Cancelling…" : "Cancel stay"}</button>}</div>
        </article>;
      })}</div>}
    </div>
  );
}

export default MyBookings;
