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
      const playlist = await Playlist.findOne({
        where: { id: req.params.id, UserId: req.user.id },
      });

      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

      playlist.name = name;
      await playlist.save();

      res.json(playlist);
    } catch (err) {
      console.error("❌ Error updating playlist:", err);
      res.status(400).json({ message: err.message });
    }
  }

  static async deletePlaylist(req, res) {
    try {
      const playlist = await Playlist.findOne({
        where: { id: req.params.id, UserId: req.user.id },
      });

      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
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
      const { spotifyId, name, artist, album, image, spotify_url } = req.body;

      const playlist = await Playlist.findOne({
        where: { id: req.params.id, UserId: req.user.id },
      });

      if (!playlist) {
        return res.status(404).json({ message: "Playlist not found" });
      }

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
      console.error("❌ Error adding music:", err);
      res.status(500).json({ message: err.message });
    }
  }

  static async removeMusicFromPlaylist(req, res) {
    try {
      const music = await MusicList.findByPk(req.params.musicId);

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
