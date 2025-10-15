import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("access_token");
    navigate("/login");
  }

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
            <button className="navbar-logout" onClick={handleLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}
