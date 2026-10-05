import { useState } from "react";
import { addDays, getTodayString } from "../utils/dateUtils.js";

function SearchBar({ initialSearch, initialCity, initialMinRating, initialCheckIn, initialCheckOut, initialGuests, onSearch }) {
  const [search, setSearch] = useState(initialSearch);
  const [city, setCity] = useState(initialCity);
  const [minRating, setMinRating] = useState(initialMinRating);
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);
  const [guests, setGuests] = useState(initialGuests || "1");
  const [formError, setFormError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError("");
    if (Boolean(checkIn) !== Boolean(checkOut) || (checkIn && (checkIn < getTodayString() || checkOut <= checkIn))) {
      setFormError("Choose a valid check-in and check-out date, or leave both blank.");
      return;
    }
    onSearch({ search, city, minRating, checkIn, checkOut, guests });
  };

  const handleClear = () => {
    setSearch("");
    setCity("");
    setMinRating("");
    setCheckIn("");
    setCheckOut("");
    setGuests("1");
    setFormError("");
    onSearch({ search: "", city: "", minRating: "", checkIn: "", checkOut: "", guests: "1" });
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} noValidate>
      <div className="form-group search-grow">
        <label htmlFor="search">Destination or property</label>
        <input
          id="search"
          type="text"
          placeholder="Try a city, neighborhood or name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="city">City</label>
        <input
          id="city"
          type="text"
          placeholder="Any city"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label htmlFor="minRating">Minimum rating</label>
        <select
          id="minRating"
          value={minRating}
          onChange={(e) => setMinRating(e.target.value)}
        >
          <option value="">Any</option>
          <option value="3">3+ stars</option>
          <option value="4">4+ stars</option>
          <option value="4.5">4.5+ stars</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="search-checkin">Check-in</label>
        <input id="search-checkin" type="date" min={getTodayString()} value={checkIn} onChange={(event) => {
          const value = event.target.value;
          setCheckIn(value);
          if (checkOut && checkOut <= value) setCheckOut("");
        }} />
      </div>

      <div className="form-group">
        <label htmlFor="search-checkout">Check-out</label>
        <input id="search-checkout" type="date" min={addDays(checkIn || getTodayString(), 1)} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
      </div>

      <div className="form-group">
        <label htmlFor="search-guests">Guests</label>
        <select id="search-guests" value={guests} onChange={(event) => setGuests(event.target.value)}>
          {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Search</button>
        <button type="button" className="btn" onClick={handleClear}>Clear</button>
      </div>
      {formError && <p className="field-error" role="alert">{formError}</p>}
    </form>
  );
}

export default SearchBar;