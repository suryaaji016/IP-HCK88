// =======================================================
// 🎵 MUSIC APP SERVER (Gemini AI + Spotify Integration)
// =======================================================
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

// =======================================================
// 🔑 Ambil Token Spotify
// =======================================================
async function getSpotifyToken() {
  const res = await axios.post(
    "https://accounts.spotify.com/api/token",
    new URLSearchParams({ grant_type: "client_credentials" }),
    {
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
  return res.data.access_token;
}

// =======================================================
// 🤖 Analisis Mood (Gemini AI)
// =======================================================
async function analyzeMood(prompt) {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const result = await model.generateContent(`
      Analisis kalimat berikut dan tentukan suasana hati serta genre musik yang cocok:
      "${prompt}"
      Jawab hanya dalam format JSON:
      {"mood":"sedih dan galau","genre":"romance"}
      - Jika marah → rock
      - Jika galau/sedih → romance
      - Jika belajar/fokus → study
      - Jika santai/tenang → chill
      - Jika semangat → pop
      - Jika tidur → sleep
    `);

    const raw = result.response
      .text()
      .replace(/```json|```/g, "")
      .trim();
    const parsed = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    return parsed;
  } catch (err) {
    console.error("⚠️ Gemini gagal:", err.message);
    const lower = prompt.toLowerCase();
    if (lower.includes("marah")) return { mood: "marah", genre: "rock" };
    if (lower.includes("galau") || lower.includes("sedih"))
      return { mood: "galau", genre: "romance" };
    if (lower.includes("belajar") || lower.includes("fokus"))
      return { mood: "fokus belajar", genre: "study" };
    if (lower.includes("santai") || lower.includes("tenang"))
      return { mood: "santai", genre: "chill" };
    if (lower.includes("tidur")) return { mood: "tenang", genre: "sleep" };
    if (lower.includes("senang") || lower.includes("bahagia"))
      return { mood: "ceria", genre: "pop" };
    return { mood: "netral", genre: "pop" };
  }
}

// =======================================================
// 🎧 AI Playlist (5 Lagu Acak Berdasarkan Mood)
// =======================================================
app.post("/api/generate-ai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt is required" });

  try {
    const { mood, genre } = await analyzeMood(prompt);
    const token = await getSpotifyToken();
    const offset = Math.floor(Math.random() * 400);

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=genre:${genre}&type=track&limit=5&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const tracks = response.data.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      image: t.album.images[0]?.url,
      spotify_url: t.external_urls?.spotify,
    }));

    res.json({ mood, genre, tracks });
  } catch (err) {
    console.error("❌ Error /api/generate-ai:", err.message);
    res.status(500).json({ message: "Gagal generate playlist AI" });
  }
});

// =======================================================
// 🏠 Home: Lagu Random + Infinite Scroll
// =======================================================
app.get("/api/home", async (req, res) => {
  try {
    const token = await getSpotifyToken();
    const genres = ["pop", "rock", "indie", "jazz", "romance", "chill"];
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    const offset = Math.floor(Math.random() * 200);

    const response = await axios.get(
      `https://api.spotify.com/v1/search?q=genre:${randomGenre}&type=track&limit=12&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const tracks = response.data.tracks.items.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      image: t.album.images[0]?.url,
      spotify_url: t.external_urls?.spotify,
    }));

    res.json({
      genre: randomGenre,
      tracks,
      nextOffset: offset + 12,
      hasMore: response.data.tracks.items.length > 0,
    });
  } catch (err) {
    console.error("⚠️ Error /api/home:", err.message);
    res.status(500).json({ message: "Failed to fetch home data" });
  }
});

// =======================================================
// 🎵 Detail Lagu
// =======================================================
app.get("/api/detail/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const token = await getSpotifyToken();
    const response = await axios.get(
      `https://api.spotify.com/v1/tracks/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const t = response.data;
    const track = {
      id: t.id,
      name: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      image: t.album.images[0]?.url,
      spotify_url: t.external_urls?.spotify,
    };

    res.json(track);
  } catch (err) {
    console.error("❌ Error /api/detail:", err.message);
    res.status(404).json({ message: "Track not found" });
  }
});

// =======================================================
// 🚀 Start Server
// =======================================================
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
