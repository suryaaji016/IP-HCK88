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
      const { data } = await axios.get(
        `http://localhost:3001/api/home?offset=${newOffset}&limit=12`
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
      const { data } = await axios.post(
        "http://localhost:3001/api/generate-ai",
        { prompt: mood }
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
      <div
        key={track.id}
        style={{
          border: "1px solid #ddd",
          borderRadius: 10,
          padding: 10,
          background: "#fff",
          textAlign: "center",
          boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
        }}
      >
        <img
          src={track.image}
          alt={track.name}
          style={{
            width: "100%",
            borderRadius: 10,
            height: 200,
            objectFit: "cover",
          }}
        />
        <h4 style={{ marginTop: 8 }}>{track.name}</h4>
        <p style={{ fontSize: 13, color: "#666" }}>{track.artist}</p>
        <button
          onClick={() => navigate(`/detail/${track.id}`)}
          style={{
            background: "#1db954",
            color: "white",
            padding: "6px 12px",
            borderRadius: 6,
            border: "none",
            cursor: "pointer",
          }}
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
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>🎧 Music Recommender</h1>

      {/* ========================= */}
      {/* 🤖 AI Mood Analyzer */}
      {/* ========================= */}
      <section
        style={{
          maxWidth: 900,
          margin: "0 auto",
          background: "#f9f9f9",
          border: "1px solid #ddd",
          padding: 20,
          borderRadius: 12,
        }}
      >
        <h2>
          AI Mood Analyzer <span>🧠</span>
        </h2>
        <p>
          Tulis suasana hati kamu, lalu biarkan AI memilih lagu yang cocok
          untukmu!
        </p>

        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="text"
            placeholder="contoh: galau malam hujan 🌧️"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={{ flex: 1, padding: 10 }}
          />
          <button
            onClick={generateAIPlaylist}
            disabled={aiLoading}
            style={{
              background: "#1db954",
              color: "white",
              padding: "10px 16px",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            {aiLoading ? "Analisis..." : "Generate 🎶"}
          </button>
        </div>

        {aiData && (
          <div style={{ marginTop: 20 }}>
            <h3>
              ✨ Mood: {aiData.mood} | Genre: {aiData.genre}
            </h3>
            <p style={{ color: "#666" }}>
              🎧 5 Lagu terbaik untuk suasana hati kamu.
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
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
      <h2 style={{ marginTop: 40, textAlign: "center" }}>
        🎲 Lagu Random Hari Ini
      </h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 20,
          marginTop: 10,
        }}
      >
        {tracks.map((track) => (
          <TrackCard key={track.id} track={track} />
        ))}
      </div>

      {loading && (
        <p style={{ textAlign: "center", marginTop: 20 }}>⏳ Memuat lagu...</p>
      )}
      {!hasMore && (
        <p style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
          ✅ Semua lagu telah dimuat.
        </p>
      )}
    </div>
  );
}
