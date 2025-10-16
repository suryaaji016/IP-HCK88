import { useState } from "react";
import PropTypes from "prop-types";

export default function AIMoodAnalyzer({ onResultsGenerated, loading }) {
  const [mood, setMood] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mood.trim()) {
      onResultsGenerated(mood); // ubah nama fungsinya di sini juga
    }
  };

  return (
    <div className="ai-mood-section">
      <h2 className="ai-mood-title">AI Mood Analyzer</h2>
      <p className="ai-mood-subtitle">
        Ceritakan mood atau situasi Anda, AI akan merekomendasikan lagu yang
        cocok!
      </p>
      <form onSubmit={handleSubmit} className="ai-input-group">
        <input
          type="text"
          placeholder="Contoh: lagi galau, semangat pagi, belajar, party mood..."
          value={mood}
          onChange={(e) => setMood(e.target.value)}
          className="ai-input"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !mood.trim()}
          className="ai-button"
        >
          {loading ? "Loading..." : "Generate Playlist"}
        </button>
      </form>
    </div>
  );
}

AIMoodAnalyzer.propTypes = {
  onResultsGenerated: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

AIMoodAnalyzer.defaultProps = {
  loading: false,
};
