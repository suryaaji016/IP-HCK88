import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setLoading,
  appendTracks,
  setTracksError,
} from "../store/slices/tracksSlice";
import tracksAPI from "../api/tracks";
import TrackGrid from "../components/TrackGrid";
import AIMoodAnalyzer from "../components/AIMoodAnalyzer";
import LoadingSpinner from "../components/LoadingSpinner";

export default function Home() {
  const dispatch = useDispatch();
  const { tracks, loading, hasMore, offset } = useSelector(
    (state) => state.tracks
  );
  const [aiData, setAiData] = useState(null);

  const fetchSongs = useCallback(
    async (newOffset = 0) => {
      if (loading || !hasMore) return;
      dispatch(setLoading(true));
      try {
        const data = await tracksAPI.getHome(newOffset, 12);
        dispatch(
          appendTracks({
            tracks: data.tracks,
            nextOffset: data.nextOffset,
            hasMore: data.hasMore,
          })
        );
      } catch (err) {
        dispatch(setTracksError(err.message));
        console.error("⚠️ Gagal ambil lagu:", err.message);
      } finally {
        dispatch(setLoading(false));
      }
    },
    [loading, hasMore, dispatch]
  );

  useEffect(() => {
    if (tracks.length === 0) {
      fetchSongs();
    }
  }, [fetchSongs, tracks.length]);

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
  }, [offset, loading, hasMore, fetchSongs]);

  const handleGeneratePlaylist = async (mood) => {
    try {
      const data = await tracksAPI.generateAI(mood);
      console.log("✅ Hasil AI:", data);
      setAiData(data);
    } catch (error) {
      console.error("❌ Gagal generate AI:", error);
    }
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Music Recommender</h1>

      <AIMoodAnalyzer onResultsGenerated={handleGeneratePlaylist} />

      {aiData && (
        <div className="ai-results">
          <p className="ai-results-subtitle">
            Lagu terbaik untuk suasana hati kamu
          </p>
          <TrackGrid tracks={aiData.tracks} />
        </div>
      )}

      <h2 className="section-title">Discover Music</h2>
      <TrackGrid tracks={tracks} />

      {loading && <LoadingSpinner message="Memuat lagu..." />}
      {!hasMore && <p className="status-message">✅ Semua lagu telah dimuat</p>}
    </div>
  );
}
