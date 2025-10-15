import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Playlist() {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState(null);
  const [editName, setEditName] = useState("");

  // Get fresh token every time
  const getToken = () => {
    const token = localStorage.getItem("access_token");
    console.log("🔑 Getting token:", token ? "EXISTS" : "MISSING");
    if (!token) {
      console.error("❌ No token found, redirecting to login");
      navigate("/login");
      return null;
    }
    return token;
  };

  async function fetchPlaylists() {
    const token = getToken();
    if (!token) return;

    try {
      console.log("📡 Fetching playlists with token...");
      const { data } = await axios.get("http://localhost:3001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("✅ Playlists fetched:", data.length);
      setPlaylists(data);
    } catch (err) {
      console.error(
        "❌ Gagal ambil playlist:",
        err.response?.data || err.message
      );
      if (err.response?.status === 401) {
        alert("Session expired, please login again");
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }

  async function createPlaylist() {
    if (!newName.trim()) {
      alert("⚠️ Nama playlist tidak boleh kosong!");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      console.log("📝 Creating playlist:", newName);
      console.log(
        "🔐 Authorization header:",
        `Bearer ${token.substring(0, 20)}...`
      );

      const response = await axios.post(
        "http://localhost:3001/api/playlists",
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Playlist created successfully:", response.data);
      setNewName("");
      fetchPlaylists();
      alert("✅ Playlist berhasil dibuat!");
    } catch (err) {
      console.error(
        "❌ Error creating playlist:",
        err.response?.data || err.message
      );
      alert(err.response?.data?.message || "Gagal buat playlist");

      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }

  async function updatePlaylist() {
    if (!editName.trim()) {
      alert("Nama playlist tidak boleh kosong!");
      return;
    }

    const token = getToken();
    if (!token) return;

    try {
      await axios.put(
        `http://localhost:3001/api/playlists/${editingPlaylist.id}`,
        { name: editName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowEditModal(false);
      setEditingPlaylist(null);
      setEditName("");
      fetchPlaylists();
      alert("✅ Playlist berhasil diupdate!");
    } catch (err) {
      console.error("❌ Gagal update playlist:", err);
      alert("Gagal update playlist");
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }

  function openEditModal(playlist, e) {
    e.stopPropagation();
    setEditingPlaylist(playlist);
    setEditName(playlist.name);
    setShowEditModal(true);
  }

  async function deletePlaylist(id) {
    if (!confirm("Hapus playlist ini?")) return;

    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(`http://localhost:3001/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
      if (selectedPlaylist?.id === id) {
        setShowDetailModal(false);
        setSelectedPlaylist(null);
      }
      alert("✅ Playlist berhasil dihapus!");
    } catch (err) {
      console.log("🚀 ~ deletePlaylist ~ err:", err);
      alert("Gagal hapus playlist");
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }

  async function deleteSongFromPlaylist(playlistId, musicId) {
    if (!confirm("Hapus lagu ini dari playlist?")) return;

    const token = getToken();
    if (!token) return;

    try {
      await axios.delete(
        `http://localhost:3001/api/playlists/${playlistId}/music/${musicId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchPlaylists();
      // Update selected playlist
      if (selectedPlaylist) {
        const updatedPlaylist = {
          ...selectedPlaylist,
          MusicLists: selectedPlaylist.MusicLists.filter(
            (m) => m.id !== musicId
          ),
        };
        setSelectedPlaylist(updatedPlaylist);
      }
      alert("✅ Lagu berhasil dihapus dari playlist!");
    } catch (err) {
      console.error("❌ Gagal hapus lagu:", err);
      alert("Gagal hapus lagu dari playlist");
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        navigate("/login");
      }
    }
  }

  function openPlaylistDetail(playlist) {
    setSelectedPlaylist(playlist);
    setShowDetailModal(true);
  }

  useEffect(() => {
    fetchPlaylists();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">🎶 My Playlists</h1>

      {/* Create Playlist Section */}
      <div className="playlist-create-section">
        <h3 style={{ marginBottom: "1rem", fontSize: "1.25rem" }}>
          ➕ Create New Playlist
        </h3>
        <div className="ai-input-group">
          <input
            type="text"
            placeholder="Nama playlist baru... 🎵"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="ai-input"
            onKeyPress={(e) => e.key === "Enter" && createPlaylist()}
          />
          <button onClick={createPlaylist} className="ai-button">
            ➕ Add Playlist
          </button>
        </div>
      </div>

      {/* Playlists Grid */}
      {playlists.length === 0 ? (
        <div className="playlist-empty">
          <div className="playlist-empty-icon">🎵</div>
          <p className="playlist-empty-text">Belum ada playlist</p>
          <p className="playlist-empty-subtext">
            Buat playlist pertama kamu sekarang!
          </p>
        </div>
      ) : (
        <div className="track-grid">
          {playlists.map((p) => (
            <div key={p.id} className="playlist-card">
              <div
                className="playlist-info"
                onClick={() => openPlaylistDetail(p)}
              >
                <div className="playlist-icon">🎵</div>
                <h4 className="track-name">{p.name}</h4>
                <span className="playlist-count">
                  {p.MusicLists?.length || 0} lagu
                </span>
              </div>
              <div className="playlist-actions">
                <button
                  onClick={(e) => openEditModal(p, e)}
                  className="track-button playlist-edit-btn"
                  title="Edit Playlist"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deletePlaylist(p.id);
                  }}
                  className="track-button playlist-delete-btn"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Playlist Modal */}
      {showEditModal && editingPlaylist && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">✏️ Edit Playlist</h3>
            <p className="modal-subtitle">
              Update nama playlist "{editingPlaylist.name}"
            </p>

            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="modal-input"
              placeholder="Nama playlist baru..."
              onKeyPress={(e) => e.key === "Enter" && updatePlaylist()}
              autoFocus
            />

            <div className="modal-actions">
              <button
                onClick={() => setShowEditModal(false)}
                className="modal-cancel-btn"
              >
                Cancel
              </button>
              <button onClick={updatePlaylist} className="modal-add-btn">
                💾 Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Playlist Detail Modal */}
      {showDetailModal && selectedPlaylist && (
        <div
          className="modal-overlay"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="modal-content playlist-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="modal-title">{selectedPlaylist.name}</h3>
            <p className="modal-subtitle">
              {selectedPlaylist.MusicLists?.length || 0} lagu dalam playlist
            </p>

            {!selectedPlaylist.MusicLists ||
            selectedPlaylist.MusicLists.length === 0 ? (
              <div className="modal-empty">
                <p>Playlist masih kosong</p>
                <p style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                  Tambahkan lagu dari halaman detail lagu
                </p>
              </div>
            ) : (
              <div className="playlist-songs-list">
                {selectedPlaylist.MusicLists.map((music) => (
                  <div key={music.id} className="playlist-song-item">
                    <img
                      src={music.image}
                      alt={music.name}
                      className="playlist-song-image"
                    />
                    <div className="playlist-song-info">
                      <h4 className="playlist-song-name">{music.name}</h4>
                      <p className="playlist-song-artist">{music.artist}</p>
                    </div>
                    <div className="playlist-song-actions">
                      <button
                        onClick={() => navigate(`/detail/${music.spotifyId}`)}
                        className="playlist-song-detail-btn"
                        title="Lihat Detail"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() =>
                          deleteSongFromPlaylist(selectedPlaylist.id, music.id)
                        }
                        className="playlist-song-delete-btn"
                        title="Hapus dari Playlist"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="modal-actions" style={{ marginTop: "1.5rem" }}>
              <button
                onClick={() => setShowDetailModal(false)}
                className="modal-cancel-btn"
                style={{ width: "100%" }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
