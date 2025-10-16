import PropTypes from "prop-types";
import { useNavigate } from "react-router";

export default function TrackCard({ track }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/detail/${track.id}`);
  };

  return (
    <div className="track-card" onClick={handleClick}>
      <div className="track-image-wrapper">
        <img
          src={track.image || "https://via.placeholder.com/180"}
          alt={track.name}
          className="track-image"
        />
      </div>
      <div className="track-info">
        <h3 className="track-name" title={track.name}>
          {track.name}
        </h3>
        <p className="track-artist" title={track.artist}>
          {track.artist}
        </p>
      </div>
    </div>
  );
}

TrackCard.propTypes = {
  track: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    artist: PropTypes.string.isRequired,
    image: PropTypes.string,
  }).isRequired,
};
