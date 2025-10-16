const express = require("express");
const router = express.Router();
const TracksController = require("../controllers/tracksController");

router.get("/home", TracksController.getHomeTracks);
router.get("/detail/:id", TracksController.getTrackDetail);
router.get("/search", TracksController.searchTracks);
router.post("/generate-ai", TracksController.generateAIPlaylist);

module.exports = router;
