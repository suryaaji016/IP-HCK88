require("dotenv").config();
const { User, Playlist, MusicList } = require("./models");
const { comparePassword } = require("./helpers/bcrypt");
const { signToken, verifyToken } = require("./helpers/jwt");
const authentication = require("./middlewares/authentication");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 3001;

app.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email & password wajib diisi" });

    const existing = await User.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email sudah digunakan" });

    const user = await User.create({ email, password });
    res.status(201).json({ id: user.id, email: user.email });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user || !comparePassword(password, user.password))
      return res.status(401).json({ message: "Email atau password salah" });

    const access_token = signToken({ id: user.id });
    res.json({ access_token });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// =======================================================
// 🧱 Middleware Authentication (JWT)
// =======================================================
app.use(authentication);

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
    console.log(
      "🔑 GEMINI API KEY:",
      process.env.GEMINI_API_KEY ? "ADA" : "TIDAK ADA"
    );

    // 🔹 Default prompt jika user tidak mengisi apa pun
    const userPrompt =
      prompt?.trim() ||
      "Saya tidak menulis apa pun, tolong tentukan suasana hati umum dan genre musik yang cocok.";

    // 🔹 Buat instance Gemini AI
    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    // 🔹 Prompt utama untuk AI
    const detailedPrompt = `
      Analisis kalimat berikut dan tentukan suasana hati serta genre musik yang cocok:
      "${userPrompt}"

      Berikan jawaban dalam format JSON seperti contoh:
      {"mood":"sedih dan galau","genre":"romance"}

      Panduan pemetaan suasana hati:
      - Jika marah → rock
      - Jika galau/sedih → romance
      - Jika belajar/fokus → study
      - Jika santai/tenang → chill
      - Jika semangat → pop
      - Jika tidur → sleep
      - Jika tidak jelas → netral dan genre pop
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: detailedPrompt,
    });

    // 🔹 Ambil hasil teks dari AI
    const text =
      (response.text || response.response?.text?.())?.toString() || "";
    const clean = text.replace(/```json|```/g, "").trim();

    // 🔹 Ambil hanya JSON-nya
    const match = clean.match(/\{[\s\S]*\}/);
    const parsed = match
      ? JSON.parse(match[0])
      : { mood: "netral", genre: "pop" };

    console.log("✅ Gemini result:", parsed);
    return parsed;
  } catch (err) {
    console.error("⚠️ Gemini gagal:", err.message);

    const lower = (prompt || "").toLowerCase();
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

app.get("/api/playlists", async (req, res) => {
  try {
    const playlists = await Playlist.findAll({
      where: { UserId: req.user.id },
      include: MusicList,
    });
    res.json(playlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.post("/api/playlists", async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = await Playlist.create({ name, UserId: req.user.id });
    res.status(201).json(playlist);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

app.delete("/api/playlists/:id", async (req, res) => {
  try {
    const playlist = await Playlist.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });
    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    await playlist.destroy();
    res.json({ message: "Playlist deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// 🎶 MUSICLIST CRUD (Lagu per Playlist)
// =======================================================
app.post("/api/playlists/:id/music", async (req, res) => {
  try {
    const { spotifyId, name, artist, album, image, spotify_url } = req.body;

    const playlist = await Playlist.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });
    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    const music = await MusicList.create({
      PlaylistId: playlist.id,
      spotifyId,
      name,
      artist,
      album,
      image,
      spotify_url,
    });
    res.status(201).json(music);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

app.delete("/api/playlists/:id/music/:musicId", async (req, res) => {
  try {
    const music = await MusicList.findByPk(req.params.musicId);
    if (!music) return res.status(404).json({ message: "Music not found" });

    await music.destroy();
    res.json({ message: "Music deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// =======================================================
// 🚀 Start Server
// =======================================================
app.listen(PORT, () =>
  console.log(`✅ Server running at http://localhost:${PORT}`)
);
