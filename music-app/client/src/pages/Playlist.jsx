import { useEffect, useState } from "react";
import axios from "axios";

export default function Playlist() {
  const [playlists, setPlaylists] = useState([]);
  const [newName, setNewName] = useState("");
  const token = localStorage.getItem("access_token");

  async function fetchPlaylists() {
    try {
      const { data } = await axios.get("http://localhost:3001/api/playlists", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlaylists(data);
    } catch (err) {
      console.error("❌ Gagal ambil playlist:", err);
    }
  }

  async function createPlaylist() {
    if (!newName.trim()) return;
    try {
      await axios.post(
        "http://localhost:3001/api/playlists",
        { name: newName },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewName("");
      fetchPlaylists();
    } catch (err) {
      console.log("🚀 ~ createPlaylist ~ err:", err);
      alert("Gagal buat playlist");
    }
  }

  async function deletePlaylist(id) {
    if (!confirm("Hapus playlist ini?")) return;
    try {
      await axios.delete(`http://localhost:3001/api/playlists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPlaylists();
    } catch (err) {
      console.log("🚀 ~ deletePlaylist ~ err:", err);
      alert("Gagal hapus playlist");
    }
  }

  useEffect(() => {
    fetchPlaylists();
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">🎶 My Playlists</h1>

      <div className="ai-input-group" style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Nama playlist baru..."
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="ai-input"
        />
        <button onClick={createPlaylist} className="ai-button">
          ➕ Add Playlist
        </button>
      </div>

      <div className="track-grid">
        {playlists.map((p) => (
          <div key={p.id} className="track-card">
            <h4 className="track-name">{p.name}</h4>
            <p className="track-artist">{p.MusicLists?.length || 0} lagu</p>
            <button
              onClick={() => deletePlaylist(p.id)}
              className="track-button"
            >
              🗑️ Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
