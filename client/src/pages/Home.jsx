import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Icon from "../components/Icon.jsx";
import heroImage from "../assets/coastal-stay.jpg";
import { addDays, getTodayString } from "../utils/dateUtils.js";

function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("1");
  const [searchError, setSearchError] = useState("");
  const handleSearch = (event) => {
    event.preventDefault();
    setSearchError("");
    if (Boolean(checkIn) !== Boolean(checkOut) || (checkIn && (checkIn < getTodayString() || checkOut <= checkIn))) {
      setSearchError("Choose a valid check-in and check-out date, or leave both blank.");
      return;
    }
    const params = new URLSearchParams();
    if (search.trim()) params.set("search", search.trim());
    if (checkIn && checkOut) {
      params.set("checkIn", checkIn);
      params.set("checkOut", checkOut);
    }
    if (guests !== "1") params.set("guests", guests);
    navigate(`/hotels${params.size ? `?${params}` : ""}`);
  };
  return (
    <>
      <section className="home-hero">
        <img className="home-hero-photo" src={heroImage} alt="Sunlit coastal hotel terrace overlooking the sea" />
        <div className="hero-content">
          <p className="eyebrow">A better way to get away</p>
          <h1>Find your<br /><em>somewhere.</em></h1>
          <p>Thoughtful stays, clear details, and a little more room to enjoy the journey.</p>
          <div className="hero-actions">
            <Link to="/hotels" className="btn btn-primary">Explore all stays <Icon name="arrow" size={17} /></Link>
            <Link to="/my-bookings" className="btn">Manage a booking</Link>
          </div>
        </div>
        <span className="hero-footnote">Places to pause · room to explore</span>
      </section>
      <form className="home-search-wrap home-search" onSubmit={handleSearch} noValidate>
        <div className="form-group search-grow">
          <label htmlFor="home-destination"><Icon name="pin" size={15} /> Find a place</label>
          <input id="home-destination" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="City, neighborhood or hotel" />
        </div>
        <div className="form-group">
          <label htmlFor="home-checkin">Check-in</label>
          <input id="home-checkin" type="date" min={getTodayString()} value={checkIn} onChange={(event) => {
            const value = event.target.value;
            setCheckIn(value);
            if (checkOut && checkOut <= value) setCheckOut("");
          }} />
        </div>
        <div className="form-group">
          <label htmlFor="home-checkout">Check-out</label>
          <input id="home-checkout" type="date" min={addDays(checkIn || getTodayString(), 1)} value={checkOut} onChange={(event) => setCheckOut(event.target.value)} />
        </div>
        <div className="form-group">
          <label htmlFor="home-guests">Guests</label>
          <select id="home-guests" value={guests} onChange={(event) => setGuests(event.target.value)}>
            {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" type="submit"><Icon name="search" /> Find a stay</button>
        {searchError && <p className="field-error" role="alert">{searchError}</p>}
      </form>
      <div className="container">
        <section className="home-intro">
          <span className="eyebrow">The StayEasy difference</span>
          <div><h2>Travel feels better when the stay feels right.</h2><p>Compare real rooms, understand what is included, and choose a place that fits the way you want to travel. No guesswork between you and your next check-in.</p></div>
        </section>
        <section aria-label="Stay inspiration" className="home-destination-strip">
          <Link to="/hotels" className="destination-tile" style={{ "--tile-image": `url(${heroImage})` }}>
            <span className="tile-index">01 / TAKE YOUR TIME</span><h3>Arrive somewhere memorable.</h3><p>Find a stay worth slowing down for.</p>
          </Link>
          <Link to="/hotels" className="destination-tile">
            <span className="tile-index">02 / MAKE IT YOURS</span><h3>Room for your kind of trip.</h3><p>Browse by place, compare the details, and book when it feels right.</p>
          </Link>
        </section>
        <section className="home-note">
          <div><p className="eyebrow">From search to check-in</p><h2>Clear choices. Better stays.</h2><p>Availability is checked against your dates, room capacity is easy to compare, and your bookings stay together in one place.</p></div>
          <Link to="/hotels" className="btn btn-primary">Start exploring <Icon name="arrow" size={17} /></Link>
        </section>
      </div>
    </>
  );
}

export default Home;