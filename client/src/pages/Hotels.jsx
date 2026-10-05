import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../api/axios.js";
import SearchBar from "../components/SearchBar.jsx";
import HotelList from "../components/HotelList.jsx";
import Loading from "../components/Loading.jsx";
import ErrorMessage from "../components/ErrorMessage.jsx";
import getErrorMessage from "../utils/getErrorMessage.js";

function Hotels() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get("search") || "";
  const city = searchParams.get("city") || "";
  const minRating = searchParams.get("minRating") || "";
  const checkIn = searchParams.get("checkIn") || "";
  const checkOut = searchParams.get("checkOut") || "";
  const guests = searchParams.get("guests") || "1";

  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reload, setReload] = useState(0);

  // Re-fetch whenever the filters in the URL change
  useEffect(() => {
    let ignore = false; // set to true if this effect is replaced before it finishes

    const fetchHotels = async () => {
      setLoading(true);
      setError("");

      const params = {};
      if (search) params.search = search;
      if (city) params.city = city;
      if (minRating) params.minRating = minRating;

      try {
        const res = await api.get("/hotels", { params });
        if (!ignore) setHotels(res.data.hotels);
      } catch (err) {
        if (!ignore) setError(getErrorMessage(err));
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    fetchHotels();

    return () => {
      ignore = true;
    };
  }, [search, city, minRating, reload]);

  const handleSearch = (values) => {
    const params = {};
    if (values.search.trim()) params.search = values.search.trim();
    if (values.city.trim()) params.city = values.city.trim();
    if (values.minRating) params.minRating = values.minRating;
    if (values.checkIn) params.checkIn = values.checkIn;
    if (values.checkOut) params.checkOut = values.checkOut;
    if (values.guests && values.guests !== "1") params.guests = values.guests;
    setSearchParams(params);
  };

  return (
    <div className="container">
      <div className="page-header"><div><p className="eyebrow">Find your next stay</p><h1>Explore stays</h1><p>Browse property details, compare rooms, and check availability for the dates that work for you.</p></div></div>

      {/* key: when the URL filters change (e.g. Back button), the bar restarts with the right values */}
      <SearchBar
        key={`${search}|${city}|${minRating}|${checkIn}|${checkOut}|${guests}`}
        initialSearch={search}
        initialCity={city}
        initialMinRating={minRating}
        initialCheckIn={checkIn}
        initialCheckOut={checkOut}
        initialGuests={guests}
        onSearch={handleSearch}
      />

      {loading && <Loading message="Loading hotels..." />}
      <ErrorMessage message={error} onRetry={() => setReload((value) => value + 1)} />
      {!loading && !error && <HotelList hotels={hotels} checkIn={checkIn} checkOut={checkOut} guests={guests} />}
    </div>
  );
}

export default Hotels;