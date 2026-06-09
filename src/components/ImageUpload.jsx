import "./ImageUpload.css";

export default function ImageUpload({ label, value, onChange, placeholder = "https://example.com/image.jpg" }) {
  return (
    <div className="img-upload">
      {label && <label className="img-label">{label}</label>}
      <div className="img-input-row">
        <input
          type="text"
          className="img-input"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      {value && (
        <div className="img-preview">
          <img src={value} alt="Preview" onError={(e) => { e.target.style.display = "none"; }} />
        </div>
      )}
    </div>
  );
}
