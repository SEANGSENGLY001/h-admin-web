import { useState, useEffect, useRef } from "react";
import "./ImageUpload.css";

export default function ImageUpload({ label, value, onChange, placeholder = "https://example.com/image.jpg" }) {
  const [status, setStatus] = useState("idle");
  const imgRef = useRef(null);
  const prevValue = useRef(value);

  useEffect(() => {
    if (value !== prevValue.current) {
      prevValue.current = value;
      if (value) {
        if (imgRef.current?.complete) {
          setStatus(imgRef.current.naturalWidth > 0 ? "loaded" : "error");
        } else {
          setStatus("loading");
        }
      } else {
        setStatus("idle");
      }
    }
  }, [value]);

  function handleImgLoad() {
    setStatus("loaded");
  }

  function handleImgError() {
    setStatus("error");
  }

  return (
    <div className="img-upload">
      {label && <label className="img-label">{label}</label>}
      <input
        type="text"
        className="img-input"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      <div className={`img-preview-wrap${value && status !== "error" && status !== "idle" ? " has-image" : ""}`}>
        {!value && (
          <div className="img-placeholder">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
            <span>URL preview will appear here</span>
          </div>
        )}
        {value && (status === "loading" || status === "idle") && (
          <div className="img-loading">
            <div className="img-spinner" />
            <span>Loading preview...</span>
          </div>
        )}
        {value && status === "error" && (
          <div className="img-error">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="15" y1="9" x2="9" y2="15"/>
              <line x1="9" y1="9" x2="15" y2="15"/>
            </svg>
            <span>Failed to load image — check the URL</span>
          </div>
        )}
        {value && (
          <img
            ref={imgRef}
            src={value}
            alt="Preview"
            className={status === "loaded" ? "loaded" : ""}
            style={{ display: status === "error" ? "none" : "block" }}
            onLoad={handleImgLoad}
            onError={handleImgError}
          />
        )}
      </div>
    </div>
  );
}
