import HotelCard from "./HotelCard.jsx";
import Icon from "./Icon.jsx";

function HotelList({ hotels, checkIn = "", checkOut = "", guests = "1" }) {
  if (hotels.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-mark"><Icon name="search" /></div>
        <h2>No stays found</h2>
        <p>Try a different place or loosen your filters to see more options.</p>
      </div>
    );
  }

  return (
    <>
      <p className="muted">{hotels.length} {hotels.length === 1 ? "hotel" : "hotels"} found</p>
      <div className="grid">
        {hotels.map((hotel) => (
          <HotelCard key={hotel._id} hotel={hotel} checkIn={checkIn} checkOut={checkOut} guests={guests} />
        ))}
      </div>
    </>
  );
}

export default HotelList;