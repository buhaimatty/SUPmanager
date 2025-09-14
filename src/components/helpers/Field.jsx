// General wrapper for form fields (label + error + hint)
const Field = ({ label, hint, error, children }) => {
  return (
    <label className="block">
      <div className="mb-1 flex items-baseline justify-between">
        <span>{label}</span>
        {hint && <span className="hint">{hint}</span>}
      </div>
      {children}
      {error && <p className="error mt-1">{error}</p>}
    </label>
  );
};

export default Field;
