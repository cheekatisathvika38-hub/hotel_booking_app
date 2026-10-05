import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="container">
      <div className="empty-state" style={{ marginTop: 30 }}>
        <p className="eyebrow">This page is off the map</p>
        <h1 style={{ fontSize: "3rem", margin: "12px 0" }}>We couldn’t find that stay.</h1>
        <p>The link may be out of date, or the page may have moved. Let’s get you back to a familiar place.</p>
        <Link to="/" className="btn btn-primary">Return home</Link>
      </div>
    </div>
  );
}

export default NotFound;