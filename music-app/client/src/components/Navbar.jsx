import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/slices/authSlice";
import SearchBar from "./SearchBar";

export default function Navbar() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

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
