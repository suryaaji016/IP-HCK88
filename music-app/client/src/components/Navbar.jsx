import { Link, useNavigate, useLocation } from "react-router";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <span className="navbar-logo-icon">
            <img src="/logo.png" alt="Logo" />
          </span>
          <span>Spotipy</span>
        </Link>

        {/* Search Bar */}
        <div className="navbar-search">
          <SearchBar />
        </div>

        <ul className="navbar-links">
          <li>
            <Link
              to="/"
              className={`navbar-link ${
                location.pathname === "/" ? "active" : ""
              }`}
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/playlist"
              className={`navbar-link ${
                location.pathname === "/playlist" ? "active" : ""
              }`}
            >
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
