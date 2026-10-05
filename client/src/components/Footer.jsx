function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span className="footer-brand">StayEasy</span>
        <p className="footer-note">Good stays start with the details.</p>
        <p>© {new Date().getFullYear()} StayEasy</p>
      </div>
    </footer>
  );
}

export default Footer;