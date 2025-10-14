import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">🎵</span>
          <span>MusicApp</span>
        </Link>

        <ul className="navbar-links">
          <li>
            <Link to="/" className="navbar-link active">
              Home
            </Link>
          </li>
          <li>
            <Link to="/playlist" className="navbar-link">
              My Playlist
            </Link>
          </li>
          <li>
            <button className="navbar-logout">Logout</button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
