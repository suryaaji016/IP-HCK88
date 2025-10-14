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

  if (loading) return <p style={{ textAlign: "center" }}>⏳ Loading...</p>;
  if (!track) return <p style={{ textAlign: "center" }}>⚠️ Track not found.</p>;

  return (
    <div style={{ padding: "40px", maxWidth: "600px", margin: "0 auto" }}>
      <button>
        <Link to="/">Back to Home</Link>
      </button>
      <img
        src={track.image}
        alt={track.name}
        style={{ width: "100%", borderRadius: "12px" }}
      />
      <h2 style={{ marginTop: "20px" }}>{track.name}</h2>
      <p style={{ color: "#444" }}>{track.artist}</p>
      <p style={{ fontStyle: "italic" }}>Album: {track.album}</p>

      <button
        onClick={() => {
          if (track.spotify_url) {
            console.log("Redirecting to:", track.spotify_url);
            window.open(track.spotify_url, "_blank", "noopener,noreferrer");
          } else {
            alert("Link Spotify tidak tersedia untuk lagu ini.");
          }
        }}
        style={{
          marginTop: "15px",
          padding: "10px 20px",
          fontSize: "16px",
          borderRadius: "8px",
          background: "#1db954",
          color: "white",
          border: "none",
          cursor: "pointer",
        }}
      >
        🎵 Play on Spotify
      </button>
    </div>
  );
}
