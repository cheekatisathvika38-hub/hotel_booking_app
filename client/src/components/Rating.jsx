import Icon from "./Icon.jsx";

function Rating({ value }) {
  if (!value) return <span className="muted">Not yet rated</span>;

  return <span className="rating" aria-label={`Rated ${Number(value).toFixed(1)} out of 5`}><Icon name="sparkle" size={14} /> {Number(value).toFixed(1)}</span>;
}

export default Rating;