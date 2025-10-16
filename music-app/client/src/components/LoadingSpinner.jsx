import PropTypes from "prop-types";

export default function LoadingSpinner({ message = "Loading..." }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
}

LoadingSpinner.propTypes = {
  message: PropTypes.string,
};
