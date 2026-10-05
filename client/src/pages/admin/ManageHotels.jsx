import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../../api/axios.js";
import AdminNavigation from "../../components/AdminNavigation.jsx";
import Loading from "../../components/Loading.jsx";
import ErrorMessage from "../../components/ErrorMessage.jsx";
import Icon from "../../components/Icon.jsx";
import getErrorMessage from "../../utils/getErrorMessage.js";
import useToast from "../../hooks/useToast.js";

const blankHotel = { name: "", description: "", location: "", address: "", city: "", images: "", amenities: "", rating: "" };
const listField = (value) => value.split(/\n|,/).map((item) => item.trim()).filter(Boolean);
const hotelFields = (hotel) => ({ name: hotel.name || "", description: hotel.description || "", location: hotel.location || "", address: hotel.address || "", city: hotel.city || "", images: (hotel.images || []).join("\n"), amenities: (hotel.amenities || []).join(", "), rating: hotel.rating ?? "" });

function ManageHotels() {
  const { showToast } = useToast();
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState(blankHotel);
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
      const res = await api.get("/hotels");
      setHotels(res.data.hotels || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    Promise.resolve().then(() => load());
  }, [load, reload]);
  const startEdit = (hotel) => {
    setEditing(hotel._id);
    setForm(hotelFields(hotel));
    setActionError("");
    setNotice("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const resetForm = () => { setEditing(""); setForm(blankHotel); setActionError(""); };
  const change = (event) => setForm((value) => ({ ...value, [event.target.name]: event.target.value }));
  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    setActionError("");
    setNotice("");
    const payload = {
      name: form.name.trim(), description: form.description.trim(), location: form.location.trim(), address: form.address.trim(), city: form.city.trim(),
      images: listField(form.images), amenities: listField(form.amenities), rating: Number(form.rating),
    };
    try {
      if (editing) await api.put(`/hotels/${editing}`, payload);
      else await api.post("/hotels", payload);
      setNotice(editing ? "Property details have been updated." : "Property added to StayEasy.");
      showToast(editing ? "Property details have been updated." : "Property added to StayEasy.");
      resetForm();
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const remove = async (hotel) => {
    if (!window.confirm(`Delete ${hotel.name} and all of its rooms? This cannot be undone.`)) return;
    setActionError("");
    setNotice("");
    try {
      await api.delete(`/hotels/${hotel._id}`);
      setNotice(`${hotel.name} was removed.`);
      showToast(`${hotel.name} was removed.`);
      await load();
    } catch (err) {
      setActionError(getErrorMessage(err));
    }
  };

  return <div className="container">
    <div className="admin-shell"><AdminNavigation /><main className="admin-content">
      <div className="page-header"><div><p className="eyebrow">Inventory</p><h1>Properties</h1><p>Keep property details accurate and inviting for every traveler.</p></div></div>
      {notice && <p className="notice" role="status">{notice}</p>}
      <ErrorMessage message={actionError} />
      <form className="card admin-form" onSubmit={save}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 16 }}>
          <div><p className="eyebrow">{editing ? "Edit listing" : "New listing"}</p><h2>{editing ? "Update property" : "Add a property"}</h2></div>
          {editing && <button type="button" className="btn" onClick={resetForm}>Cancel edit</button>}
        </div>
        <div className="admin-form-grid">
          <div className="form-group"><label htmlFor="hotel-name">Property name</label><input id="hotel-name" name="name" value={form.name} onChange={change} required /></div>
          <div className="form-group"><label htmlFor="hotel-city">City</label><input id="hotel-city" name="city" value={form.city} onChange={change} required /></div>
          <div className="form-group"><label htmlFor="hotel-location">Area or location</label><input id="hotel-location" name="location" value={form.location} onChange={change} required /></div>
          <div className="form-group"><label htmlFor="hotel-address">Street address</label><input id="hotel-address" name="address" value={form.address} onChange={change} required /></div>
          <div className="form-group"><label htmlFor="hotel-rating">Rating (0–5)</label><input id="hotel-rating" name="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={change} required /></div>
          <div className="form-group"><label htmlFor="hotel-amenities">Amenities, separated by commas</label><input id="hotel-amenities" name="amenities" value={form.amenities} onChange={change} placeholder="Pool, breakfast, Wi-Fi" /></div>
          <div className="form-group wide"><label htmlFor="hotel-description">Description</label><textarea id="hotel-description" name="description" value={form.description} onChange={change} required /></div>
          <div className="form-group wide"><label htmlFor="hotel-images">Image URLs, one per line</label><textarea id="hotel-images" name="images" value={form.images} onChange={change} placeholder="https://…" /></div>
          <div className="form-actions wide"><button className="btn btn-primary" type="submit" disabled={saving}>{saving ? "Saving…" : <><Icon name={editing ? "check" : "plus"} size={16} /> {editing ? "Save changes" : "Add property"}</>}</button></div>
        </div>
      </form>
      <div className="section-heading" style={{ marginTop: 36 }}><div><p className="eyebrow">Current inventory</p><h2>Property listings</h2></div>{!loading && !error && <span className="muted">{hotels.length} total</span>}</div>
      {loading && <Loading message="Loading properties…" />}
      <ErrorMessage message={error} onRetry={() => setReload((n) => n + 1)} />
      {!loading && !error && hotels.length === 0 && <div className="empty-state"><div className="empty-mark"><Icon name="hotel" /></div><h2>No properties yet</h2><p>Add the first property using the form above. Hotel details are saved to the StayEasy listing service.</p></div>}
      {!loading && !error && hotels.length > 0 && <div className="table-wrap"><table><thead><tr><th>Property</th><th>Location</th><th>Rating</th><th>Rooms</th><th>Actions</th></tr></thead><tbody>{hotels.map((hotel) => <tr key={hotel._id}>
        <td><strong>{hotel.name}</strong></td><td>{[hotel.location, hotel.city].filter(Boolean).join(", ")}</td><td>{hotel.rating ?? "—"}</td>
        <td><Link to={`/admin/hotels/${hotel._id}/rooms`} className="btn">Manage rooms <Icon name="chevron" size={14} /></Link></td>
        <td><div className="table-actions"><button type="button" className="btn" onClick={() => startEdit(hotel)} aria-label={`Edit ${hotel.name}`}><Icon name="edit" size={15} /> Edit</button><button type="button" className="btn btn-danger" onClick={() => remove(hotel)} aria-label={`Delete ${hotel.name}`}><Icon name="trash" size={15} /> Delete</button></div></td>
      </tr>)}</tbody></table></div>}
    </main></div>
  </div>;
}

export default ManageHotels;