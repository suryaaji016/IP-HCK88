import PropTypes from "prop-types";

export default function TrackGrid({ tracks, loading }) {
  if (loading) {
    return (
      <div className="loading-container">
        <p className="loading-message">⏳ Loading tracks...</p>
      </div>
    );
  }

  if (!tracks || tracks.length === 0) {
    return (
      <div className="empty-state">
        <p className="empty-message">🎵 No tracks found</p>
      </div>
    );
  }

  return (
    <div className="track-grid">
      {tracks.map((track, index) => (
        <TrackCard key={`${track.id}-${index}`} track={track} />
      ))}
    </div>
  );
}

TrackGrid.propTypes = {
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      artist: PropTypes.string.isRequired,
      image: PropTypes.string,
    })
  ).isRequired,
  loading: PropTypes.bool,
};

TrackGrid.defaultProps = {
  loading: false,
};

// Import TrackCard
import TrackCard from "./TrackCard";
