import { useState } from "react";
import { addDays, getTodayString } from "../utils/dateUtils.js";

function AvailabilityForm({ initialCheckIn, initialCheckOut, onSubmit, onClear }) {
  const [checkIn, setCheckIn] = useState(initialCheckIn);
  const [checkOut, setCheckOut] = useState(initialCheckOut);

  const handleCheckInChange = (e) => {
    const value = e.target.value;
    setCheckIn(value);
    // "YYYY-MM-DD" strings compare correctly with <=; drop an invalid check-out
    if (checkOut && checkOut <= value) setCheckOut("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ checkIn, checkOut });
  };

  return (
    <form className="availability-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="checkIn">Check-in</label>
        <input
          id="checkIn"
          type="date"
          value={checkIn}
          min={getTodayString()}
          onChange={handleCheckInChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="checkOut">Check-out</label>
        <input
          id="checkOut"
          type="date"
          value={checkOut}
          min={addDays(checkIn || getTodayString(), 1)}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Check availability</button>
        {initialCheckIn && (
          <button type="button" className="btn" onClick={onClear}>Show all rooms</button>
        )}
      </div>
    </form>
  );
}

export default AvailabilityForm;