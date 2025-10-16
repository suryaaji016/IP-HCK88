const axios = require("axios");
const { GoogleGenAI } = require("@google/genai");

class TracksController {
  static async getSpotifyToken() {
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

  static async getHomeTracks(req, res) {
    try {
      const token = await TracksController.getSpotifyToken();
      const genres = ["pop", "rock", "indie", "jazz", "romance", "chill"];
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      const offset =
        parseInt(req.query.offset) || Math.floor(Math.random() * 200);

      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        params: {
          q: `genre:${randomGenre}`,
          type: "track",
          limit: 12,
          offset: offset,
          market: "US",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

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
  }

  static async getTrackDetail(req, res) {
    try {
      const { id } = req.params;
      const token = await TracksController.getSpotifyToken();

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
  }

  static async searchTracks(req, res) {
    try {
      const { q } = req.query;

      if (!q || !q.trim()) {
        return res.status(400).json({ message: "Search query required" });
      }

      const token = await TracksController.getSpotifyToken();

      const response = await axios.get(`https://api.spotify.com/v1/search`, {
        params: {
          q: q,
          type: "track",
          limit: 20,
          market: "US",
        },
        headers: { Authorization: `Bearer ${token}` },
      });

      const tracks = response.data.tracks.items.map((t) => ({
        id: t.id,
        name: t.name,
        artist: t.artists.map((a) => a.name).join(", "),
        album: t.album.name,
        image: t.album.images[0]?.url,
        spotify_url: t.external_urls?.spotify,
      }));

      res.json({
        query: q,
        tracks,
        total: response.data.tracks.total,
      });
    } catch (err) {
      console.error("❌ Error /api/search:", err.message);
      res.status(500).json({ message: "Search failed" });
    }
  }

  static async analyzeMood(prompt) {
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

      console.log("✅ Gemini result:", parsed);
      return parsed;
    } catch (err) {
      console.error("❌ Gemini gagal:", err.message);
      return {
        mood: "netral",
        genre: "pop",
        genres: ["pop"],
        searchQuery: "popular music",
        audioFeatures: { energy: 0.5, valence: 0.5, tempo: "medium" },
      };
    }
  }

  static async generateAIPlaylist(req, res) {
    try {
      const { prompt } = req.body;

      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }

      const aiResult = await TracksController.analyzeMood(prompt);
      const { mood, genre, genres, searchQuery, audioFeatures } = aiResult;
      const token = await TracksController.getSpotifyToken();

      console.log("🎵 AI Analysis:", { mood, genre, searchQuery });

      let allTracks = [];

      // Try search query first
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

      // Try genres if not enough tracks
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

      console.log(`✅ Found ${tracks.length} tracks for mood: ${mood}`);

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
      console.error("❌ Error /api/generate-ai:", err.message);
      res.status(500).json({ message: "Gagal generate playlist AI" });
    }
  }
}

module.exports = TracksController;
