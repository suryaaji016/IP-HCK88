import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const [tracks, setTracks] = useState([]);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const [aiData, setAiData] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [mood, setMood] = useState("");

  // =====================================================
  // 🎧 Fetch Lagu Random (pagination by offset)
  // =====================================================
  async function fetchSongs(newOffset = 0) {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.get(
        `http://localhost:3001/api/home?offset=${newOffset}&limit=12`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (newOffset === 0) {
        setTracks(data.tracks);
      } else {
        setTracks((prev) => [...prev, ...data.tracks]);
      }
      setOffset(data.nextOffset);
      setHasMore(data.hasMore);
    } catch (err) {
      console.error("⚠️ Gagal ambil lagu:", err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSongs(0);
  }, []);

  // =====================================================
  // 📜 Infinite Scroll
  // =====================================================
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 500 &&
        !loading &&
        hasMore
      ) {
        fetchSongs(offset);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [offset, loading, hasMore]);

  // =====================================================
  // 🤖 Generate AI Playlist
  // =====================================================
  async function generateAIPlaylist() {
    if (!mood.trim()) return alert("Tulis suasana hati kamu dulu ya 🎧");
    setAiLoading(true);
    setAiData(null);
    try {
      const token = localStorage.getItem("access_token");
      const { data } = await axios.post(
        "http://localhost:3001/api/generate-ai",
        { prompt: mood },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAiData(data);
    } catch (err) {
      console.error("❌ Gagal generate playlist:", err);
      alert("AI gagal menebak mood kamu 😢");
    } finally {
      setAiLoading(false);
    }
  }

  // =====================================================
  // 🎵 Track Card
  // =====================================================
  function TrackCard({ track }) {
    return (
      <div className="track-card" key={track.id}>
        <img src={track.image} alt={track.name} className="track-image" />
        <h4 className="track-name">{track.name}</h4>
        <p className="track-artist">{track.artist}</p>
        <button
          onClick={() => navigate(`/detail/${track.id}`)}
          className="track-button"
        >
          Detail
        </button>
      </div>
    );
  }

  // =====================================================
  // 🖼️ UI Rendering
  // =====================================================
  return (
    <div className="home-container">
      <h1 className="home-title">🎵 Music Recommender</h1>

      {/* ========================= */}
      {/* 🤖 AI Mood Analyzer */}
      {/* ========================= */}
      <section className="ai-section">
        <div className="ai-header">
          <h2 className="ai-title">🤖 AI Mood Analyzer</h2>
          <p className="ai-description">
            Tulis suasana hati kamu, lalu biarkan AI memilih lagu yang cocok
            untukmu!
          </p>
        </div>

        <div className="ai-input-group">
          <input
            type="text"
            placeholder="contoh: galau malam hujan 🌧️"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            className="ai-input"
          />
          <button
            onClick={generateAIPlaylist}
            disabled={aiLoading}
            className="ai-button"
          >
            {aiLoading ? "⏳ Analisis..." : "Generate 🎶"}
          </button>
        </div>

        {aiData && (
          <div className="ai-results">
            <h3 className="ai-results-header">
              ✨ Mood: {aiData.mood} | Genre: {aiData.genre}
            </h3>
            <p className="ai-results-subtitle">
              🎧 5 Lagu terbaik untuk suasana hati kamu
            </p>
            <div className="track-grid">
              {aiData.tracks.map((track) => (
                <TrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ========================= */}
      {/* 🔄 Lagu Random + Infinite Scroll */}
      {/* ========================= */}
      <h2 className="section-title">🎸 Discover Music</h2>
      <div className="track-grid">
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>

      {loading && <p className="loading-message">⏳ Memuat lagu...</p>}
      {!hasMore && <p className="status-message">✅ Semua lagu telah dimuat</p>}
    </div>
  );
}
