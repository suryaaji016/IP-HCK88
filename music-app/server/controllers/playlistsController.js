const { Playlist, MusicList } = require("../models");

class PlaylistsController {
  static async getPlaylists(req, res) {
    try {
      const playlists = await Playlist.findAll({
        where: { UserId: req.user.id },
        include: MusicList,
      });
      res.json(playlists);
    } catch (err) {
      console.error("❌ Error fetching playlists:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async createPlaylist(req, res) {
    try {
      console.log("📝 POST /api/playlists called");
      console.log("📦 Request body:", req.body);
      console.log("👤 User from token:", req.user);

      const { name } = req.body;

      if (!name || !name.trim()) {
        return res
          .status(400)
          .json({ message: "Nama playlist tidak boleh kosong" });
      }

      const playlist = await Playlist.create({ name, UserId: req.user.id });
      console.log("✅ Playlist created:", playlist.id);

      res.status(201).json(playlist);
    } catch (err) {
      console.error("❌ Error creating playlist:", err);
      res.status(400).json({ message: err.message });
    }
  }

  static async updatePlaylist(req, res) {
    try {
      const { name } = req.body;

      if (!name) {
        return res.status(400).json({ message: "Name is required" });
      }

      // First check if playlist exists
      const playlistExists = await Playlist.findByPk(req.params.id);
      if (!playlistExists) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      // Then check if user owns it
      const playlist = await Playlist.findOne({
        where: { id: req.params.id, UserId: req.user.id },
      });

      if (!playlist) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      playlist.name = name;
      await playlist.save();

      res.json({ message: "Playlist updated successfully" });
    } catch (err) {
      console.error("❌ Error updating playlist:", err);
      res.status(400).json({ message: err.message });
    }
  }

  static async deletePlaylist(req, res) {
    try {
      // First check if playlist exists
      const playlistExists = await Playlist.findByPk(req.params.id);
      if (!playlistExists) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      // Then check if user owns it
      const playlist = await Playlist.findOne({
        where: { id: req.params.id, UserId: req.user.id },
      });

      if (!playlist) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      await playlist.destroy();
      res.json({ message: "Playlist deleted" });
    } catch (err) {
      console.error("❌ Error deleting playlist:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async addMusicToPlaylist(req, res) {
    try {
      const { id } = req.params; // playlistId
      const userId = req.user.id;
      const { spotifyId, name, artist, album, image, spotify_url } = req.body;

      console.log("🎧 Add Music Request:", {
        userId,
        playlistId: id,
        body: req.body,
      });

      // ✅ Pastikan playlist milik user (check first before validation)
      const playlist = await Playlist.findOne({
        where: { id, UserId: userId },
      });
      if (!playlist) {
        console.log("🚫 Playlist not found or unauthorized");
        return res
          .status(404)
          .json({ message: "Playlist not found or unauthorized" });
      }

      // Validate required fields
      if (!spotifyId || !name || !artist || !album) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Check for duplicate
      const existing = await MusicList.findOne({
        where: { spotifyId, PlaylistId: id },
      });
      if (existing) {
        return res.status(400).json({ message: "Song already in playlist" });
      }

      // ✅ Tambahkan lagu ke MusicList
      const newSong = await MusicList.create({
        spotifyId,
        name,
        artist,
        album,
        image,
        spotify_url,
        PlaylistId: id, // penting!
      });

      console.log("✅ Lagu berhasil ditambahkan:", newSong.name);
      res.status(201).json(newSong);
    } catch (error) {
      console.error("❌ addMusicToPlaylist Error:", error);
      res
        .status(500)
        .json({ message: "Failed to add song", error: error.message });
    }
  }

  static async removeMusicFromPlaylist(req, res) {
    try {
      const { id, musicId } = req.params;
      const userId = req.user.id;

      // Check if playlist exists and belongs to user
      const playlist = await Playlist.findOne({
        where: { id, UserId: userId },
      });

      if (!playlist) {
        return res.status(403).json({ message: "Unauthorized" });
      }

      const music = await MusicList.findOne({
        where: { id: musicId, PlaylistId: id },
      });

      if (!music) {
        return res.status(404).json({ message: "Music not found" });
      }

      await music.destroy();
      res.json({ message: "Music deleted" });
    } catch (err) {
      console.error("❌ Error removing music:", err);
      res.status(500).json({ message: err.message });
    }
  }
}

module.exports = PlaylistsController;
