function Loading({ message = "Loading..." }) {
  return (
    <div className="loading" role="status" aria-live="polite">
      <p>{message}</p>
      <div className="loading-skeletons" aria-hidden="true">
        <span className="skeleton-line skeleton-line-wide" />
        <span className="skeleton-line" />
        <span className="skeleton-line skeleton-line-short" />
      </div>
    </div>
  );
}

export default Loading;