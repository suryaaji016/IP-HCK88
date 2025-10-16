import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentTrack } from "../store/slices/tracksSlice";
import { setPlaylists } from "../store/slices/playlistsSlice";
import tracksAPI from "../api/tracks";
import playlistsAPI from "../api/playlists";
import Modal from "../components/Modal";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Detail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const track = useSelector((state) => state.tracks.currentTrack);
  const playlists = useSelector((state) => state.playlists.playlists);

  const [loading, setLoading] = useState(true);
  const [selectedPlaylist, setSelectedPlaylist] = useState("");
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [addingToPlaylist, setAddingToPlaylist] = useState(false);

  const fetchTrack = useCallback(async () => {
    try {
      const data = await tracksAPI.getDetail(id);
      dispatch(setCurrentTrack(data));
    } catch (err) {
      console.error("Error fetching track:", err);
    } finally {
      setLoading(false);
    }
  }, [id, dispatch]);

  const fetchPlaylists = useCallback(async () => {
    try {
      const data = await playlistsAPI.getAll();
      dispatch(setPlaylists(data));
    } catch (err) {
      console.error("Error fetching playlists:", err);
    }
  }, [dispatch]);

  async function addToPlaylist() {
    if (!selectedPlaylist) {
      alert("Pilih playlist terlebih dahulu!");
      return;
    }

    if (!track) {
      alert("Track data tidak tersedia!");
      return;
    }

    setAddingToPlaylist(true);
    try {
      console.log("🔄 Adding track to playlist...");
      console.log("📝 Playlist ID:", selectedPlaylist);
      console.log("🎵 Track data:", {
        id: track.id,
        name: track.name,
        artist: track.artist,
      });

      const musicData = {
        spotifyId: track.id,
        name: track.name,
        artist: track.artist,
        album: track.album,
        image: track.image,
        spotify_url: track.spotify_url,
      };

      console.log("📦 Sending data:", musicData);

      const response = await playlistsAPI.addMusic(selectedPlaylist, {
        spotifyId: track.id,
        name: track.name,
        artist: track.artist,
        album: track.album,
        image: track.image,
        spotify_url: track.spotify_url,
      });

      console.log("✅ Response from server:", response);
      alert("✅ Lagu berhasil ditambahkan ke playlist!");
      setShowPlaylistModal(false);
      setSelectedPlaylist("");
    } catch (err) {
      console.error("❌ Error adding to playlist:", err);
      console.error("❌ Error response:", err.response?.data);
      console.error("❌ Error status:", err.response?.status);

      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Gagal menambahkan ke playlist";
      alert(`❌ ${errorMessage}`);
    } finally {
      setAddingToPlaylist(false);
    }
  }

  useEffect(() => {
    fetchTrack();
    fetchPlaylists();
  }, [fetchTrack, fetchPlaylists]);

  if (loading) return <LoadingSpinner message="Loading..." />;
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
          className="detail-playlist-button"
          onClick={() => {
            console.log("🟢 Tombol Add to Playlist diklik");
            setShowPlaylistModal(true);
          }}
        >
          ➕ Add to Playlist
        </button>
      </div>

      <Modal
        show={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        title="Add to Playlist"
      >
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
      </Modal>
    </div>
  );
}
