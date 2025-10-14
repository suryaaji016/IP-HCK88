import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";

export default function Detail() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrack();
  }, [id]);

  async function fetchTrack() {
    try {
      const { data } = await axios.get(
        `http://localhost:3001/api/detail/${id}`
      );
      setTrack(data);
    } catch (err) {
      console.error("❌ Error fetching track:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p className="loading-message">⏳ Loading...</p>;
  if (!track) return <p className="status-message">⚠️ Track not found.</p>;

  return (
    <div className="detail-container">
      <Link to="/" className="detail-back-button">
        ← Back to Home
      </Link>

      <img src={track.image} alt={track.name} className="detail-image" />

      <h2 className="detail-title">{track.name}</h2>
      <p className="detail-artist">{track.artist}</p>
      <p className="detail-album">Album: {track.album}</p>

      <button
        onClick={() => {
          if (track.spotify_url) {
            console.log("Redirecting to:", track.spotify_url);
            window.open(track.spotify_url, "_blank", "noopener,noreferrer");
          } else {
            alert("Link Spotify tidak tersedia untuk lagu ini.");
          }
        }}
        className="detail-play-button"
      >
        🎵 Play on Spotify
      </button>
    </div>
  );
}
