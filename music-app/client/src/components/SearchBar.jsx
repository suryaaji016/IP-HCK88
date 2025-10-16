import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  setSearchQuery,
  setSearchResults,
  setSearchLoading,
  clearSearch,
  selectSearchQuery,
  selectSearchResults,
  selectSearchLoading,
} from "../store/slices/searchSlice";
import tracksAPI from "../api/tracks";

export default function SearchBar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const searchQuery = useSelector(selectSearchQuery);
  const searchResults = useSelector(selectSearchResults);
  const isLoading = useSelector(selectSearchLoading);
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearch = useCallback(
    async (query) => {
      try {
        dispatch(setSearchLoading(true));
        dispatch(setSearchQuery(query));

        const result = await tracksAPI.searchTracks(query);
        dispatch(setSearchResults(result.tracks || result || []));
        setShowDropdown(true);
      } catch (err) {
        console.error("❌ Search error:", err);
        dispatch(setSearchResults([]));
      } finally {
        dispatch(setSearchLoading(false));
      }
    },
    [dispatch]
  );

  // Debounce search - Live search as you type
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (localQuery.trim().length >= 2) {
        handleSearch(localQuery);
      } else if (localQuery.trim().length === 0) {
        dispatch(clearSearch());
        setShowDropdown(false);
      }
    }, 300); // Wait 300ms after user stops typing

    return () => clearTimeout(delayDebounce);
  }, [localQuery, handleSearch, dispatch]);

  const handleTrackClick = (trackId) => {
    setShowDropdown(false);
    setLocalQuery("");
    dispatch(clearSearch());
    navigate(`/detail/${trackId}`);
  };

  const handleClear = () => {
    setLocalQuery("");
    dispatch(clearSearch());
    setShowDropdown(false);
  };

  const handleInputFocus = () => {
    if (searchResults.length > 0) {
      setShowDropdown(true);
    }
  };

  const handleInputBlur = () => {
    // Delay to allow click on dropdown items
    setTimeout(() => setShowDropdown(false), 200);
  };

  return (
    <div className="search-bar-container">
      <div className="search-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search for songs or artists..."
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            onFocus={handleInputFocus}
            onBlur={handleInputBlur}
            className="search-input"
          />
          {localQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={handleClear}
            >
              ✕
            </button>
          )}
          {isLoading && <span className="search-loading">⏳</span>}
        </div>
      </div>

      {/* Dropdown Results */}
      {showDropdown && searchResults.length > 0 && (
        <div className="search-dropdown">
          <div className="search-dropdown-list">
            {searchResults.slice(0, 8).map((track) => (
              <div
                key={track.id}
                className="search-dropdown-item"
                onClick={() => handleTrackClick(track.id)}
              >
                <img
                  src={track.image || "https://via.placeholder.com/50"}
                  alt={track.name}
                  className="search-item-image"
                />
                <div className="search-item-info">
                  <div className="search-item-name">{track.name}</div>
                  <div className="search-item-artist">{track.artist}</div>
                </div>
                <span className="search-item-arrow">→</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {showDropdown &&
        localQuery.trim().length >= 2 &&
        searchResults.length === 0 &&
        !isLoading && (
          <div className="search-dropdown">
            <div className="search-no-results">
              <span className="search-no-results-icon">🔍</span>
              <p>No results found for "{localQuery}"</p>
              <span className="search-no-results-hint">
                Try different keywords
              </span>
            </div>
          </div>
        )}
    </div>
  );
}

SearchBar.propTypes = {};
