require("dotenv").config();
const { User, Playlist, MusicList } = require("./models");
const { comparePassword } = require("./helpers/bcrypt");
const { signToken, verifyToken } = require("./helpers/jwt");
const authentication = require("./middlewares/authentication");
const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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

app.post("/login/google", async (req, res) => {
  const { id_token } = req.body;
  try {
    // Verifikasi token dari frontend
    const ticket = await client.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const { email } = ticket.getPayload();

    // Cari user berdasarkan email
    let [user, created] = await User.findOrCreate({
      where: { email },
      defaults: {
        email,
        password: Math.random().toString(36).slice(-8),
      },
    });

    // Buat token JWT lokal
    const access_token = signToken({ id: user.id });

    res.status(created ? 201 : 200).json({
      message: "Login Google sukses",
      access_token,
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: "Token Google tidak valid" });
  }
});

app.use(authentication);

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

async function analyzeMood(prompt) {
  try {
    console.log(
      "🔑 GEMINI API KEY:",
      process.env.GEMINI_API_KEY ? "ADA" : "TIDAK ADA"
    );

    const userPrompt =
      prompt?.trim() ||
      "Saya tidak menulis apa pun, tolong tentukan suasana hati umum dan genre musik yang cocok.";

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const detailedPrompt = `
      Kamu adalah seorang music therapist expert yang sangat memahami hubungan antara emosi manusia dan musik.

      Analisis kalimat/situasi berikut dengan cermat:
      "${userPrompt}"

      Tugasmu:
      1. Pahami konteks emosional dan situasi yang sedang dialami user
      2. Tentukan mood yang paling tepat menggambarkan perasaan tersebut
      3. Pilih 2-3 genre Spotify yang PALING COCOK untuk mood tersebut
      4. Tentukan kata kunci pencarian yang spesifik untuk Spotify API

      PENTING - Panduan Genre Spotify (gunakan genre yang valid di Spotify):
      - Sedih/Galau/Patah Hati → Genre: "sad", "acoustic", "indie" | Keywords: "heartbreak", "sad love songs", "melancholic"
      - Marah/Kesal/Frustrasi → Genre: "rock", "metal", "hard rock" | Keywords: "angry", "aggressive rock", "metal"
      - Santai/Relaks/Chill → Genre: "chill", "lo-fi", "ambient" | Keywords: "chill vibes", "relaxing", "lo-fi beats"
      - Belajar/Fokus → Genre: "study", "classical", "instrumental" | Keywords: "study music", "focus", "concentration"
      - Senang/Bahagia/Ceria → Genre: "pop", "happy", "dance" | Keywords: "happy songs", "feel good", "uplifting"
      - Semangat/Workout/Energik → Genre: "workout", "edm", "hip-hop" | Keywords: "workout", "pump up", "energetic"
      - Romantis/Jatuh Cinta → Genre: "romance", "r-n-b", "love" | Keywords: "love songs", "romantic", "r&b love"
      - Nostalgia/Kenangan → Genre: "indie", "alternative", "80s" | Keywords: "nostalgic", "throwback", "memories"
      - Hujan/Mendung → Genre: "jazz", "acoustic", "indie" | Keywords: "rainy day", "coffee shop", "mellow"
      - Malam/Mengantuk → Genre: "sleep", "ambient", "piano" | Keywords: "sleep music", "night time", "relaxing piano"
      - Pesta/Party → Genre: "party", "dance", "edm" | Keywords: "party songs", "dance hits", "club music"
      - Motivasi/Inspirasi → Genre: "motivational", "rock", "hip-hop" | Keywords: "motivational", "inspiring", "empowering"
      - Melankolis/Emosional → Genre: "classical", "sad", "piano" | Keywords: "emotional", "melancholic", "sad piano"
      - Produktif/Kerja → Genre: "instrumental", "electronic", "ambient" | Keywords: "productive", "work music", "background"

      Format JSON yang HARUS kamu kembalikan (HANYA JSON, tanpa teks lain):
      {
        "mood": "[deskripsi mood dalam bahasa Indonesia, max 30 karakter]",
        "genre": "[genre utama, pilih 1]",
        "genres": ["[genre1]", "[genre2]", "[genre3]"],
        "searchQuery": "[kata kunci pencarian untuk Spotify]",
        "audioFeatures": {
          "energy": [0.0-1.0],
          "valence": [0.0-1.0],
          "tempo": ["slow/medium/fast"]
        }
      }

      Contoh response untuk "galau habis di tinggalin pacar":
      {
        "mood": "sedih dan patah hati",
        "genre": "sad",
        "genres": ["sad", "acoustic", "indie"],
        "searchQuery": "heartbreak sad love songs",
        "audioFeatures": {
          "energy": 0.3,
          "valence": 0.2,
          "tempo": "slow"
        }
      }

      Contoh response untuk "semangat pagi mau olahraga":
      {
        "mood": "energik dan semangat",
        "genre": "workout",
        "genres": ["workout", "edm", "hip-hop"],
        "searchQuery": "workout pump up energetic",
        "audioFeatures": {
          "energy": 0.9,
          "valence": 0.8,
          "tempo": "fast"
        }
      }

      JAWAB SEKARANG dengan format JSON yang benar!
      `;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: detailedPrompt,
    });

    const text =
      (response.text || response.response?.text?.())?.toString() || "";
    const clean = text.replace(/```json|```/g, "").trim();

    const match = clean.match(/\{[\s\S]*\}/);
    const parsed = match
      ? JSON.parse(match[0])
      : {
          mood: "netral",
          genre: "pop",
          genres: ["pop", "indie", "acoustic"],
          searchQuery: "popular songs",
          audioFeatures: { energy: 0.5, valence: 0.5, tempo: "medium" },
        };

    console.log("Gemini result:", parsed);
    return parsed;
  } catch (err) {
    console.error("Gemini gagal:", err.message);
    const lower = (prompt || "").toLowerCase();
  }
}

app.post("/api/generate-ai", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: "Prompt is required" });

  try {
    const aiResult = await analyzeMood(prompt);
    const { mood, genre, genres, searchQuery, audioFeatures } = aiResult;
    const token = await getSpotifyToken();

    console.log("🎵 AI Analysis:", { mood, genre, searchQuery });

    let allTracks = [];

    try {
      const searchResponse = await axios.get(
        `https://api.spotify.com/v1/search`,
        {
          params: {
            q: searchQuery,
            type: "track",
            limit: 10,
            market: "US",
          },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (searchResponse.data.tracks?.items?.length > 0) {
        allTracks = allTracks.concat(searchResponse.data.tracks.items);
      }
    } catch (err) {
      console.log("⚠️ Search query failed, trying genre...");
    }

    if (allTracks.length < 10) {
      for (const g of genres || [genre]) {
        try {
          const genreResponse = await axios.get(
            `https://api.spotify.com/v1/search`,
            {
              params: {
                q: `genre:"${g}"`,
                type: "track",
                limit: 10,
                market: "US",
              },
              headers: { Authorization: `Bearer ${token}` },
            }
          );

          if (genreResponse.data.tracks?.items?.length > 0) {
            allTracks = allTracks.concat(genreResponse.data.tracks.items);
          }
        } catch (err) {
          console.log(`⚠️ Genre ${g} search failed`);
        }
      }
    }

    const uniqueTracks = Array.from(
      new Map(allTracks.map((t) => [t.id, t])).values()
    );

    const shuffled = uniqueTracks.sort(() => Math.random() - 0.5);
    const selectedTracks = shuffled.slice(0, Math.min(8, shuffled.length));

    const tracks = selectedTracks.map((t) => ({
      id: t.id,
      name: t.name,
      artist: t.artists.map((a) => a.name).join(", "),
      album: t.album.name,
      image: t.album.images[0]?.url || t.album.images[1]?.url,
      spotify_url: t.external_urls?.spotify,
    }));

    console.log(` Found ${tracks.length} tracks for mood: ${mood}`);

    res.json({
      mood,
      genre,
      genres: genres || [genre],
      searchQuery,
      audioFeatures,
      tracks,
      totalFound: uniqueTracks.length,
    });
  } catch (err) {
    console.error(" Error /api/generate-ai:", err.message);
    res.status(500).json({ message: "Gagal generate playlist AI" });
  }
});

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
    console.error(" Error /api/detail:", err.message);
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

app.put("/api/playlists/:id", async (req, res) => {
  try {
    const { name } = req.body;
    const playlist = await Playlist.findOne({
      where: { id: req.params.id, UserId: req.user.id },
    });
    if (!playlist)
      return res.status(404).json({ message: "Playlist not found" });

    playlist.name = name;
    await playlist.save();
    res.json(playlist);
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

app.listen(PORT, () =>
  console.log(` Server running at http://localhost:${PORT}`)
);
