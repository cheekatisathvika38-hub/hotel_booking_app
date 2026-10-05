import { useEffect, useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import AvailabilityForm from "../components/AvailabilityForm.jsx";
import RoomCard from "../components/RoomCard.jsx";
import Rating from "../components/Rating.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import getErrorMessage from "../utils/getErrorMessage.js";

function HotelDetails() {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guestCount = Number(searchParams.get("guests")) || 1;
  const hasDates = Boolean(checkIn && checkOut);

  const [hotel, setHotel] = useState(null);
  const [hotelError, setHotelError] = useState("");
  const [rooms, setRooms] = useState([]);
  const [roomsLoading, setRoomsLoading] = useState(true);
  const [roomsError, setRoomsError] = useState("");
  const [retryRooms, setRetryRooms] = useState(0);
  const [retryHotel, setRetryHotel] = useState(0);
  const [minimumPrice, setMinimumPrice] = useState("");
  const [maximumPrice, setMaximumPrice] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [roomSort, setRoomSort] = useState("price-low");

  // The hotel itself: fetched once per hotel id
  useEffect(() => {
    let ignore = false;

    const fetchHotel = async () => {
      setHotelError("");
      try {
        const res = await api.get(`/hotels/${id}`);
        if (!ignore) setHotel(res.data.hotel);
      } catch (err) {
        if (!ignore) setHotelError(getErrorMessage(err));
      }
    };

    fetchHotel();

    return () => {
      ignore = true;
    };
  }, [id, retryHotel]);

  // The rooms: fetched again whenever the dates change
  useEffect(() => {
    let ignore = false;

    const fetchRooms = async () => {
      setRoomsLoading(true);
      setRoomsError("");

      try {
        const params = hasDates ? { checkIn, checkOut } : {};
        const res = await api.get(`/hotels/${id}/rooms`, { params });
        if (!ignore) setRooms(res.data.rooms);
      } catch (err) {
        if (!ignore) setRoomsError(getErrorMessage(err));
      } finally {
        if (!ignore) setRoomsLoading(false);
      }
    };

    fetchRooms();

    return () => {
      ignore = true;
    };
  }, [id, hasDates, checkIn, checkOut, retryRooms]);

  const roomAmenities = useMemo(
    () => [...new Set(rooms.flatMap((room) => room.amenities || []))].sort((a, b) => a.localeCompare(b)),
    [rooms],
  );
  const visibleRooms = useMemo(() => {
    const matched = rooms.filter((room) => {
      const price = Number(room.pricePerNight);
      const roomFacilities = room.amenities || [];
      return Number(room.capacity) >= guestCount
        && (!minimumPrice || price >= Number(minimumPrice))
        && (!maximumPrice || price <= Number(maximumPrice))
        && selectedAmenities.every((amenity) => roomFacilities.includes(amenity));
    });
    return [...matched].sort((a, b) => {
      if (roomSort === "price-high") return Number(b.pricePerNight) - Number(a.pricePerNight);
      if (roomSort === "capacity") return Number(b.capacity) - Number(a.capacity);
      return Number(a.pricePerNight) - Number(b.pricePerNight);
    });
  }, [rooms, guestCount, minimumPrice, maximumPrice, selectedAmenities, roomSort]);

  const updateSearchParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    setSearchParams(next);
  };

  const handleCheckAvailability = (dates) => {
    const next = new URLSearchParams(searchParams);
    next.set("checkIn", dates.checkIn);
    next.set("checkOut", dates.checkOut);
    setSearchParams(next);
  };

  const handleClearDates = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("checkIn");
    next.delete("checkOut");
    setSearchParams(next);
  };

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((current) => current.includes(amenity)
      ? current.filter((item) => item !== amenity)
      : [...current, amenity]);
  };

  if (hotelError) {
    return (
      <div className="container">
        <ErrorMessage message={hotelError} onRetry={() => setRetryHotel((value) => value + 1)} />
        <Link to="/hotels" className="btn">Back to hotels</Link>
      </div>
    );
  }

  if (!hotel) return <Loading message="Loading hotel..." />;

  return (
    <div className="container detail-shell">
      <div className="breadcrumb"><Link to="/hotels">← All stays</Link><span>/</span><span>{hotel.city || hotel.name}</span></div>

      {hotel.images?.length > 0 && (
        <div className="gallery">
          {hotel.images.slice(0, 3).map((image) => (
            <img key={image} src={image} alt={hotel.name} />
          ))}
        </div>
      )}

      <div className="hotel-detail-heading">
        <div>
        <h1>{hotel.name}</h1>
        <p className="detail-address">{hotel.address}{hotel.city ? ` · ${hotel.city}` : ""}{hotel.location ? ` · ${hotel.location}` : ""}</p>
        </div>
        <Rating value={hotel.rating} />
      </div>
      <p className="hotel-description">{hotel.description}</p>

      <div className="tags detail-amenities">
        {(hotel.amenities || []).map((amenity) => (
          <span key={amenity} className="tag">{amenity}</span>
        ))}
      </div>

      <h2 className="section-title">Rooms</h2>

      {roomsLoading && <Loading message="Loading rooms..." />}
      <ErrorMessage message={roomsError} onRetry={() => setRetryRooms((value) => value + 1)} />

      {!roomsLoading && !roomsError && rooms.length === 0 && (
        <div className="empty-state">
          <p>
            {hasDates
              ? "No rooms are available for these dates. Try different dates."
              : "This hotel has no rooms yet."}
          </p>
        </div>
      )}

      {!roomsLoading && !roomsError && rooms.length > 0 && (
        <div className="rooms-layout">
          <aside className="room-filter-sidebar card" aria-label="Filter rooms">
            <div>
              <p className="eyebrow">Your stay</p>
              <h3>Check availability</h3>
              <AvailabilityForm
                key={`${checkIn}|${checkOut}`}
                initialCheckIn={checkIn}
                initialCheckOut={checkOut}
                onSubmit={handleCheckAvailability}
                onClear={handleClearDates}
              />
            </div>

            <div className="room-filter-group">
              <label htmlFor="room-guests">Guests</label>
              <select id="room-guests" value={guestCount} onChange={(event) => updateSearchParam("guests", Number(event.target.value) > 1 ? event.target.value : "")}>
                {[1, 2, 3, 4, 5, 6].map((count) => <option key={count} value={count}>{count} {count === 1 ? "guest" : "guests"}</option>)}
              </select>
            </div>

            <div className="room-filter-group">
              <p className="filter-label">Price per night</p>
              <div className="price-range-fields">
                <label><span>From</span><input aria-label="Minimum price per night" type="number" min="0" value={minimumPrice} onChange={(event) => setMinimumPrice(event.target.value)} placeholder="₹ Min" /></label>
                <label><span>To</span><input aria-label="Maximum price per night" type="number" min="0" value={maximumPrice} onChange={(event) => setMaximumPrice(event.target.value)} placeholder="₹ Max" /></label>
              </div>
            </div>

            {roomAmenities.length > 0 && <fieldset className="room-filter-group facility-filter">
              <legend className="filter-label">Room facilities</legend>
              {roomAmenities.map((amenity) => <label className="facility-option" key={amenity}>
                <input type="checkbox" checked={selectedAmenities.includes(amenity)} onChange={() => toggleAmenity(amenity)} />
                <span>{amenity}</span>
              </label>)}
            </fieldset>}
            <p className="filter-note">Filters use room information returned for this property. Availability is checked against your dates.</p>
          </aside>

          <section className="rooms-results" aria-label="Available rooms">
            <div className="sort-row">
              <div><p className="eyebrow">Choose your room</p><h3>{visibleRooms.length} {visibleRooms.length === 1 ? "room" : "rooms"} to compare</h3></div>
              <label className="form-group sort-control"><span>Sort by</span><select value={roomSort} onChange={(event) => setRoomSort(event.target.value)} aria-label="Sort rooms"><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="capacity">Most guests</option></select></label>
            </div>
            {visibleRooms.length === 0
              ? <div className="empty-state"><h3>No rooms match these filters</h3><p>Try a different guest count, price range, or facility selection.</p><button type="button" className="btn" onClick={() => { setMinimumPrice(""); setMaximumPrice(""); setSelectedAmenities([]); updateSearchParam("guests", ""); }}>Clear room filters</button></div>
              : <div className="room-list">
                {visibleRooms.map((room) => (
                  <RoomCard
                    key={room._id}
                    room={room}
                    hotelId={hotel._id}
                    checkIn={checkIn}
                    checkOut={checkOut}
                    guests={guestCount}
                  />
                ))}
              </div>}
          </section>
        </div>
      )}
    </div>
  );
}

export default HotelDetails;