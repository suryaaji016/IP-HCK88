import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import axios from "axios";

export default function Detail() {
  const { id } = useParams();
  const [track, setTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playlists, setPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);

  useEffect(() => {
    fetchTrack();
    fetchPlaylists();
  }, [id]);

  async function fetchTrack() {
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.get(
        `http://localhost:3001/api/detail/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTrack(data);
    } catch (err) {
      console.error("Error fetching track:", err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPlaylists() {
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.get("http://localhost:3001/api/playlists", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPlaylists(data);
    } catch (err) {
      console.error("Error fetching playlists:", err);
    }
  }

  async function addToPlaylist() {
    if (!selectedPlaylist) {
      alert("Pilih playlist terlebih dahulu!");
      return;
    }

    setAddingToPlaylist(true);
    try {
      const token = localStorage.getItem("access_token");
      await axios.post(
        `http://localhost:3001/api/playlists/${selectedPlaylist}/music`,
        {
          spotifyId: track.id,
          name: track.name,
          artist: track.artist,
          album: track.album,
          image: track.image,
          spotify_url: track.spotify_url,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      alert("Lagu berhasil ditambahkan ke playlist!");
      setShowPlaylistModal(false);
      setSelectedPlaylist("");
    } catch (err) {
      console.error("Error adding to playlist:", err);
      alert(err.response?.data?.message || "Gagal menambahkan ke playlist");
    } finally {
      setAddingToPlaylist(false);
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

      <div className="detail-actions">
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

        <button
          onClick={() => setShowPlaylistModal(true)}
          className="detail-playlist-button"
        >
          ➕ Add to Playlist
        </button>
      </div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowPlaylistModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Add to Playlist</h3>
            <p className="modal-subtitle">
              Pilih playlist untuk menambahkan "{track.name}"
            </p>

            {playlists.length === 0 ? (
              <div className="modal-empty">
                <p>Kamu belum punya playlist.</p>
                <Link to="/playlist" className="modal-link">
                  Buat Playlist Baru
                </Link>
              </div>
            ) : (
              <>
                <select
                  value={selectedPlaylist}
                  onChange={(e) => setSelectedPlaylist(e.target.value)}
                  className="modal-select"
                >
                  <option value="">-- Pilih Playlist --</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name} ({playlist.MusicLists?.length || 0} lagu)
                    </option>
                  ))}
                </select>

                <div className="modal-actions">
                  <button
                    onClick={() => setShowPlaylistModal(false)}
                    className="modal-cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addToPlaylist}
                    disabled={addingToPlaylist}
                    className="modal-add-btn"
                  >
                    {addingToPlaylist ? "Adding..." : "Add to Playlist"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
