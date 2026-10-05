// Renders nothing when there is no error, so pages can always include it
function ErrorMessage({ message, onRetry }) {
  if (!message) return null;

  return (
    <div className="error-message" role="alert">
      <span>{message}</span>
      {onRetry && <button type="button" className="btn btn-danger" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export default ErrorMessage;