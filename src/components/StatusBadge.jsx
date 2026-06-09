import "./StatusBadge.css";

const statusColors = {
  active: { bg: "var(--success-bg)", color: "var(--success)" },
  inactive: { bg: "var(--danger-bg)", color: "var(--danger)" },
  draft: { bg: "var(--warning-bg)", color: "var(--warning)" },
  upcoming: { bg: "var(--accent-bg)", color: "var(--accent)" },
  published: { bg: "var(--success-bg)", color: "var(--success)" },
  processing: { bg: "var(--warning-bg)", color: "var(--warning)" },
};

export default function StatusBadge({ status }) {
  const colors = statusColors[status?.toLowerCase()] || { bg: "var(--bg-input)", color: "var(--text-muted)" };

  return (
    <span className="status-badge" style={{ background: colors.bg, color: colors.color }}>
      {status || "Unknown"}
    </span>
  );
}
