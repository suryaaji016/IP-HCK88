const express = require("express");
const router = express.Router();
const PlaylistsController = require("../controllers/playlistsController");

router.get("/", PlaylistsController.getPlaylists);
router.post("/", PlaylistsController.createPlaylist);
router.put("/:id", PlaylistsController.updatePlaylist);
router.delete("/:id", PlaylistsController.deletePlaylist);
router.post("/:id/music", PlaylistsController.addMusicToPlaylist);
router.delete(
  "/:id/music/:musicId",
  PlaylistsController.removeMusicFromPlaylist
);

module.exports = router;
