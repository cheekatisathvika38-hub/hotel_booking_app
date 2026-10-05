import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import Icon from "../components/Icon.jsx";
import getErrorMessage from "../utils/getErrorMessage.js";
import { addDays, getTodayString } from "../utils/dateUtils.js";
import useToast from "../hooks/useToast.js";

function Booking() {
  const { showToast } = useToast();
  const { hotelId, roomId } = useParams();
  const [searchParams] = useSearchParams();
  const checkInQuery = searchParams.get("checkIn") || "";
  const checkOutQuery = searchParams.get("checkOut") || "";
  const [hotel, setHotel] = useState(null);
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadedKey, setLoadedKey] = useState("");
  const [error, setError] = useState("");
  const [checkInDate, setCheckInDate] = useState(checkInQuery);
  const [checkOutDate, setCheckOutDate] = useState(checkOutQuery);
  const [guests, setGuests] = useState(searchParams.get("guests") || "1");
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState(null);
  const [notice, setNotice] = useState("");
  const [validation, setValidation] = useState("");
  const requestKey = `${hotelId}:${roomId}:${checkInQuery}:${checkOutQuery}`;
  const datesValid = Boolean(checkInDate && checkOutDate && checkInDate >= getTodayString() && checkOutDate > checkInDate);
  const nights = useMemo(() => {
    if (!datesValid) return 0;
    return Math.round((new Date(`${checkOutDate}T00:00:00Z`) - new Date(`${checkInDate}T00:00:00Z`)) / 86400000);
  }, [checkInDate, checkOutDate, datesValid]);

  useEffect(() => {
    let active = true;
    Promise.all([
      api.get(`/hotels/${hotelId}`),
      api.get(`/hotels/${hotelId}/rooms`, { params: checkInQuery && checkOutQuery ? { checkIn: checkInQuery, checkOut: checkOutQuery } : {} }),
    ]).then(([hotelRes, roomsRes]) => {
      if (!active) return;
      setHotel(hotelRes.data.hotel);
      setRoom((roomsRes.data.rooms || []).find((item) => item._id === roomId) || null);
      setError("");
      if (checkInQuery && checkOutQuery) {
        setCheckInDate(checkInQuery);
        setCheckOutDate(checkOutQuery);
      }
    }).catch((err) => {
      if (active) setError(getErrorMessage(err));
    }).finally(() => {
      if (active) {
        setLoadedKey(requestKey);
        setLoading(false);
      }
    });
    return () => { active = false; };
  }, [hotelId, roomId, checkInQuery, checkOutQuery, requestKey]);

  const submitBooking = async (event) => {
    event.preventDefault();
    setValidation("");
    setNotice("");
    setError("");
    if (!datesValid) {
      setValidation("Choose a check-in date today or later and a check-out date after check-in.");
      return;
    }
    if (Number(guests) > Number(room.capacity)) {
      setValidation(`This room accommodates up to ${room.capacity} ${Number(room.capacity) === 1 ? "guest" : "guests"}.`);
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post("/bookings", { roomId, checkInDate, checkOutDate, numberOfGuests: Number(guests) });
      setConfirmation(res.data.booking);
      setNotice("Your reservation is confirmed.");
      showToast("Your reservation is confirmed.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || loadedKey !== requestKey) return <div className="container"><Loading message="Preparing your stay…" /></div>;
  if (error && !hotel) return <div className="container"><ErrorMessage message={error} onRetry={() => window.location.reload()} /><Link to="/hotels" className="btn">Browse stays</Link></div>;
  if (!room) return <div className="container"><div className="empty-state"><div className="empty-mark"><Icon name="bed" /></div><h2>This room is not available</h2><p>It may no longer be available for the dates you selected. Return to the property to choose another room or dates.</p><Link to={`/hotels/${hotelId}`} className="btn btn-primary">Return to property</Link></div></div>;

  const roomImage = room.images?.[0];
  if (confirmation) {
    return <div className="container">
      <div className="page-header"><div><p className="eyebrow">Reservation complete</p><h1>It’s all set.</h1><p>Your stay at {hotel.name} is confirmed and ready for you.</p></div></div>
      <div className="card" style={{ maxWidth: 720 }}>
        <div className="empty-mark"><Icon name="check" /></div>
        <h2>{confirmation.hotel?.name || hotel.name}</h2>
        <p className="muted" style={{ margin: "8px 0 18px" }}>{confirmation.hotel?.address || hotel.address}{hotel.city ? ` · ${hotel.city}` : ""}</p>
        <div className="summary-row"><span className="muted">Room</span><strong className="capitalize">{confirmation.room?.roomType || room.roomType} · #{confirmation.room?.roomNumber || room.roomNumber}</strong></div>
        <div className="summary-row"><span className="muted">Dates</span><strong>{checkInDate} — {checkOutDate}</strong></div>
        <div className="summary-row"><span className="muted">Guests</span><strong>{guests}</strong></div>
        <div className="summary-row total"><span>Total</span><strong>₹{Number(confirmation.totalPrice).toLocaleString("en-IN")}</strong></div>
        <Link to="/my-bookings" className="btn btn-primary" style={{ marginTop: 22 }}>View my stays <Icon name="arrow" size={16} /></Link>
      </div>
    </div>;
  }

  return (
    <div className="container">
      <div className="breadcrumb"><Link to={`/hotels/${hotelId}`}>← {hotel.name}</Link><span>/</span><span>Complete booking</span></div>
      <div className="page-header"><div><p className="eyebrow">One last step</p><h1>Make it a stay.</h1><p>Review the details before confirming your reservation.</p></div></div>
      <div className="booking-layout">
        <form className="card" onSubmit={submitBooking}>
          <h2 style={{ fontSize: "1.8rem", marginBottom: 23 }}>Your trip details</h2>
          <ErrorMessage message={error} />
          {notice && <p className="notice" role="status">{notice}</p>}
          {validation && <p className="error-message" role="alert">{validation}</p>}
          <div className="form-group"><label htmlFor="booking-checkin">Check-in</label><input id="booking-checkin" type="date" min={getTodayString()} value={checkInDate} onChange={(e) => { const value = e.target.value; setCheckInDate(value); if (checkOutDate && checkOutDate <= value) setCheckOutDate(""); }} required /></div>
          <div className="form-group"><label htmlFor="booking-checkout">Check-out</label><input id="booking-checkout" type="date" min={addDays(checkInDate || getTodayString(), 1)} value={checkOutDate} onChange={(e) => setCheckOutDate(e.target.value)} required /></div>
          <div className="form-group"><label htmlFor="booking-guests">Number of guests</label><select id="booking-guests" value={guests} onChange={(e) => setGuests(e.target.value)}>{Array.from({ length: Number(room.capacity) || 1 }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? "guest" : "guests"}</option>)}</select></div>
          <p className="muted" style={{ fontSize: ".85rem", marginBottom: 22 }}>Payment options are not part of this booking flow. Your reservation will be created when you confirm.</p>
          <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>{submitting ? "Confirming reservation…" : <>Confirm reservation <Icon name="arrow" size={16} /></>}</button>
        </form>
        <aside className="card booking-summary">
          {roomImage ? <img src={roomImage} alt={`${room.roomType} room at ${hotel.name}`} /> : <div className="card-image card-image-empty">Room images not provided</div>}
          <div className="booking-summary-content">
            <p className="eyebrow">{hotel.city || hotel.location}</p><h2 style={{ fontSize: "1.7rem", margin: "6px 0" }}>{hotel.name}</h2>
            <p className="capitalize muted">{room.roomType} room · #{room.roomNumber}</p>
            <div className="summary-row"><span className="muted">Nightly rate</span><strong>₹{Number(room.pricePerNight).toLocaleString("en-IN")}</strong></div>
            <div className="summary-row"><span className="muted">Nights</span><strong>{datesValid ? nights : "Choose dates"}</strong></div>
            <div className="summary-row"><span className="muted">Maximum guests</span><strong>{room.capacity}</strong></div>
            <p className="muted" style={{ fontSize: ".82rem", marginTop: 14 }}>The final total is calculated by the hotel service when you confirm.</p>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default Booking;
