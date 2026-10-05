import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../../api/axios.js";
import AdminNavigation from "../../components/AdminNavigation.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import Icon from "../../components/Icon.jsx";
import getErrorMessage from "../../utils/getErrorMessage.js";
import useToast from "../../hooks/useToast.js";

const blankRoom = { roomNumber: "", roomType: "single", pricePerNight: "", capacity: "1", amenities: "", images: "", description: "" };
const toRoomForm = (room) => ({ roomNumber: room.roomNumber || "", roomType: room.roomType || "single", pricePerNight: room.pricePerNight ?? "", capacity: room.capacity ?? "1", amenities: (room.amenities || []).join(", "), images: (room.images || []).join("\n"), description: room.description || "" });
const parseList = (value) => value.split(/\n|,/).map((part) => part.trim()).filter(Boolean);

function ManageRooms() {
  const { showToast } = useToast();
  const { hotelId } = useParams();
  const [hotel, setHotel] = useState(null);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState(blankRoom);
  const [editing, setEditing] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [notice, setNotice] = useState("");
  const [reload, setReload] = useState(0);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [hotelRes, roomsRes] = await Promise.all([api.get(`/hotels/${hotelId}`), api.get(`/hotels/${hotelId}/rooms`)]);
      setHotel(hotelRes.data.hotel);
      setRooms(roomsRes.data.rooms || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [hotelId]);
  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load, reload]);
  const change = (event) => setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const editRoom = (room) => { setEditing(room._id); setForm(toRoomForm(room)); setActionError(""); setNotice(""); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const clear = () => { setEditing(""); setForm(blankRoom); };
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    setNotice("");
    const payload = {
      roomNumber: form.roomNumber.trim(), roomType: form.roomType, pricePerNight: Number(form.pricePerNight), capacity: Number(form.capacity),
      amenities: parseList(form.amenities), images: parseList(form.images), description: form.description.trim(),
    };
    try {
      if (editing) await api.put(`/rooms/${editing}`, payload);
      else await api.post(`/hotels/${hotelId}/rooms`, payload);
      setNotice(editing ? "Room details have been updated." : "Room added to this property.");
      showToast(editing ? "Room details have been updated." : "Room added to this property.");
      clear();
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const removeRoom = async (room) => {
    if (!window.confirm(`Delete room ${room.roomNumber}? This cannot be undone.`)) return;
    setActionError("");
    setNotice("");
    try {
      await api.delete(`/rooms/${room._id}`);
      setNotice(`Room ${room.roomNumber} was removed.`);
      showToast(`Room ${room.roomNumber} was removed.`);
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return <div className="container">
    <div className="admin-shell"><AdminNavigation /><main className="admin-content">
      <div className="breadcrumb"><Link to="/admin/hotels">← Properties</Link><span>/</span><span>Rooms</span></div>
      {hotel && <div className="page-header"><div><p className="eyebrow">{hotel.city || hotel.location}</p><h1>{hotel.name}</h1><p>Manage room details, capacity, and facilities for this property.</p></div></div>}
      {notice && <p className="notice" role="status">{notice}</p>}
      <ErrorMessage message={actionError} />
      {loading && <Loading message="Loading property rooms…" />}
      <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
      {!loading && !error && hotel && <>
        <form className="card admin-form" onSubmit={save}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}><div><p className="eyebrow">{editing ? "Update room" : "New room"}</p><h2>{editing ? `Room ${form.roomNumber}` : "Add a room"}</h2></div>{editing && <button type="button" className="btn" onClick={clear}>Cancel edit</button>}</div>
          <div className="admin-form-grid">
            <div className="form-group"><label htmlFor="room-number">Room number</label><input id="room-number" name="roomNumber" value={form.roomNumber} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="room-type">Room type</label><select id="room-type" name="roomType" value={form.roomType} onChange={change}><option value="single">Single</option><option value="double">Double</option><option value="deluxe">Deluxe</option><option value="suite">Suite</option></select></div>
            <div className="form-group"><label htmlFor="room-price">Price per night (₹)</label><input id="room-price" name="pricePerNight" type="number" min="0.01" step="0.01" value={form.pricePerNight} onChange={change} required /></div>
            <div className="form-group"><label htmlFor="room-capacity">Guest capacity</label><input id="room-capacity" name="capacity" type="number" min="1" step="1" value={form.capacity} onChange={change} required /></div>
            <div className="form-group wide"><label htmlFor="room-description">Description</label><textarea id="room-description" name="description" value={form.description} onChange={change} /></div>
            <div className="form-group"><label htmlFor="room-amenities">Facilities, separated by commas</label><input id="room-amenities" name="amenities" value={form.amenities} onChange={change} placeholder="Balcony, king bed" /></div>
            <div className="form-group"><label htmlFor="room-images">Image URLs, one per line</label><textarea id="room-images" name="images" value={form.images} onChange={change} /></div>
            <div className="form-actions wide"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : <><Icon name={editing ? "check" : "plus"} size={16} /> {editing ? "Save room" : "Add room"}</>}</button></div>
          </div>
        </form>
        <div className="section-heading" style={{ marginTop: 36 }}><div><p className="eyebrow">Room inventory</p><h2>Rooms at this property</h2></div><span className="muted">{rooms.length} total</span></div>
        {rooms.length === 0 ? <div className="empty-state"><div className="empty-mark"><Icon name="bed" /></div><h2>No rooms have been added</h2><p>Create a room above to make this property bookable.</p></div> : <div className="table-wrap"><table><thead><tr><th>Room</th><th>Type</th><th>Capacity</th><th>Price / night</th><th>Actions</th></tr></thead><tbody>{rooms.map((room) => <tr key={room._id}><td><strong>{room.roomNumber}</strong></td><td className="capitalize">{room.roomType}</td><td>{room.capacity}</td><td>₹{Number(room.pricePerNight).toLocaleString("en-IN")}</td><td><div className="table-actions"><button type="button" className="btn" onClick={() => editRoom(room)} aria-label={`Edit room ${room.roomNumber}`}><Icon name="edit" size={15} /> Edit</button><button type="button" className="btn btn-danger" onClick={() => removeRoom(room)} aria-label={`Delete room ${room.roomNumber}`}><Icon name="trash" size={15} /> Delete</button></div></td></tr>)}</tbody></table></div>}
      </>}
    </main></div>
  </div>;
}

export default ManageRooms;