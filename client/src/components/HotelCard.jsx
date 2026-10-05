import { Link } from "react-router-dom";
import Rating from "./Rating.jsx";

function HotelCard({ hotel, checkIn = "", checkOut = "", guests = "1" }) {
  const image = hotel.images?.[0];
  const detailParams = new URLSearchParams();
  if (checkIn && checkOut) {
    detailParams.set("checkIn", checkIn);
    detailParams.set("checkOut", checkOut);
  }
  if (guests && guests !== "1") detailParams.set("guests", guests);
  const detailUrl = `/hotels/${hotel._id}${detailParams.size ? `?${detailParams}` : ""}`;

  return (
    <article className="card hotel-card">
      {image ? (
        <img src={image} alt={hotel.name} className="card-image" />
      ) : (
        <div className="card-image card-image-empty">Images not provided</div>
      )}

      <div className="card-body">
        <div className="card-title-row">
          <h3>{hotel.name}</h3>
          <Rating value={hotel.rating} />
        </div>
        <p className="hotel-location">{hotel.location}{hotel.city ? ` · ${hotel.city}` : ""}</p>

        <div className="tags">
          {(hotel.amenities || []).slice(0, 3).map((amenity) => (
            <span key={amenity} className="tag">{amenity}</span>
          ))}
        </div>

        <Link to={detailUrl} className="btn btn-primary">
          View details
        </Link>
      </div>
    </article>
  );
}

export default HotelCard;