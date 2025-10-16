import PropTypes from "prop-types";

export default function PlaylistCard({ playlist, onEdit, onDelete, onClick }) {
  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(playlist);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(playlist.id);
  };

  return (
    <div className="playlist-card" onClick={() => onClick(playlist)}>
      <div className="playlist-icon">🎵</div>
      <h3 className="playlist-name" title={playlist.name}>
        {playlist.name}
      </h3>
      <p className="playlist-songs-count">
        {playlist.MusicLists?.length || 0} songs
      </p>
      <div className="playlist-actions">
        <button
          className="playlist-edit-btn"
          onClick={handleEdit}
          title="Edit Playlist"
        >
          ✏️ Edit
        </button>
        <button
          className="playlist-delete-btn"
          onClick={handleDelete}
          title="Delete Playlist"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}

PlaylistCard.propTypes = {
  playlist: PropTypes.shape({
    id: PropTypes.number.isRequired,
    name: PropTypes.string.isRequired,
    MusicLists: PropTypes.array,
  }).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onClick: PropTypes.func.isRequired,
};
