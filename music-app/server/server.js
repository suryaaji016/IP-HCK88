require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authentication = require("./middlewares/authentication");

// Import routes
const authRoutes = require("./routes/authRoutes");
const tracksRoutes = require("./routes/tracksRoutes");
const playlistsRoutes = require("./routes/playlistsRoutes");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public routes (no authentication)
app.use("/", authRoutes);

// Protected routes (with authentication)
app.use("/api", authentication, tracksRoutes);
app.use("/api/playlists", authentication, playlistsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ message: "🎵 Music App API is running!" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);
  res.status(500).json({ message: "Internal server error" });
});

app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
