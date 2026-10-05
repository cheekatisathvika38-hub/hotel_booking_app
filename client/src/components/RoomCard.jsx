import { useState } from "react";
import { Link } from "react-router-dom";

function RoomCard({ room, hotelId, checkIn, checkOut, guests = 1 }) {
  const hasDates = Boolean(checkIn && checkOut);
  const image = room.images?.[0];
  const [detailsOpen, setDetailsOpen] = useState(false);
  const bookingParams = new URLSearchParams({ checkIn, checkOut });
  if (Number(guests) > 1) bookingParams.set("guests", guests);
  const bookingUrl = `/hotels/${hotelId}/book/${room._id}?${bookingParams}`;

  return (
    <article className="card room-card">
      {image ? (
        <img src={image} alt={`${room.roomType} room`} className="room-image" />
      ) : (
        <div className="room-image card-image-empty">No image</div>
      )}

      <div className="room-info">
        <h3 className="capitalize">
          {room.roomType} room <span className="muted">#{room.roomNumber}</span>
        </h3>
        <p className="muted">
          Up to {room.capacity} {room.capacity === 1 ? "guest" : "guests"}
        </p>
        {room.description && <p>{detailsOpen ? room.description : `${room.description.slice(0, 115)}${room.description.length > 115 ? "…" : ""}`}</p>}
        <div className="tags">
          {(room.amenities || []).slice(0, detailsOpen ? undefined : 3).map((amenity) => (
            <span key={amenity} className="tag">{amenity}</span>
          ))}
        </div>
        <button type="button" className="text-button" aria-expanded={detailsOpen} onClick={() => setDetailsOpen((value) => !value)}>
          {detailsOpen ? "Show less" : "More details"}
        </button>
      </div>

      <div className="room-booking">
        <p className="price">
          ₹{Number(room.pricePerNight).toLocaleString("en-IN")} <span>/ night</span>
        </p>
        {hasDates ? (
          <Link to={bookingUrl} className="btn btn-primary">Book now</Link>
        ) : (
          <button className="btn" disabled>Select dates to book</button>
        )}
      </div>
    </article>
  );
}

export default RoomCard;