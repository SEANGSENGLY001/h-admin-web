import "./ConfirmDialog.css";

export default function ConfirmDialog({ open, title, message, onConfirm, onCancel, loading }) {
  if (!open) return null;

  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <h4>{title || "Confirm"}</h4>
        <p>{message || "Are you sure?"}</p>
        <div className="confirm-actions">
          <button className="confirm-btn cancel" onClick={onCancel} disabled={loading}>
            Cancel
          </button>
          <button className="confirm-btn danger" onClick={onConfirm} disabled={loading}>
            {loading ? "Deleting..." : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
