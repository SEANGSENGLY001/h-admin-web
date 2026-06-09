import { useState, useEffect } from "react";
import { getSiteConfig, updateSection } from "../../services/siteconfig";
import "./SettingsPage.css";

export default function SettingsPage() {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getSiteConfig()
      .then((data) => setConfig(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  function setSection(section, field, value) {
    setConfig((prev) => ({
      ...prev,
      [section]: { ...(prev?.[section] || {}), [field]: value },
    }));
  }

  async function handleSave(section) {
    setSaving(true);
    try {
      await updateSection(section, config[section]);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <div className="table-loading">Loading settings...</div>;
  }

  return (
    <div className="settings-page">
      <div className="section-header">
        <h3>Site Configuration</h3>
        {saved && <span className="settings-saved">Saved!</span>}
      </div>

      <SectionCard
        title="Website"
        saving={saving}
        onSave={() => handleSave("website")}
        fields={[
          { label: "Title", value: config?.website?.title || "", onChange: (v) => setSection("website", "title", v) },
          { label: "Version", value: config?.website?.version || "", onChange: (v) => setSection("website", "version", v) },
          { label: "Logo URL", value: config?.website?.logoUrl || "", onChange: (v) => setSection("website", "logoUrl", v) },
          { label: "Favicon URL", value: config?.website?.faviconUrl || "", onChange: (v) => setSection("website", "faviconUrl", v) },
          { label: "Meta Title", value: config?.website?.metaTitle || "", onChange: (v) => setSection("website", "metaTitle", v) },
          { label: "Meta Description", value: config?.website?.metaDescription || "", onChange: (v) => setSection("website", "metaDescription", v), textarea: true },
          { label: "Maintenance Message", value: config?.website?.maintenanceMessage || "", onChange: (v) => setSection("website", "maintenanceMessage", v), textarea: true },
          { label: "Maintenance Mode", type: "checkbox", checked: config?.website?.maintenanceMode || false, onChange: (v) => setSection("website", "maintenanceMode", v) },
        ]}
      />

      <SectionCard
        title="Social Links"
        saving={saving}
        onSave={() => handleSave("social")}
        fields={[
          { label: "Email *", value: config?.social?.email || "", onChange: (v) => setSection("social", "email", v) },
          { label: "Phone *", value: config?.social?.phoneNumber || "", onChange: (v) => setSection("social", "phoneNumber", v) },
          { label: "Telegram", value: config?.social?.telegram || "", onChange: (v) => setSection("social", "telegram", v) },
          { label: "Instagram", value: config?.social?.instagram || "", onChange: (v) => setSection("social", "instagram", v) },
          { label: "Facebook", value: config?.social?.facebook || "", onChange: (v) => setSection("social", "facebook", v) },
          { label: "YouTube", value: config?.social?.youtube || "", onChange: (v) => setSection("social", "youtube", v) },
        ]}
      />

      <SectionCard
        title="About Us"
        saving={saving}
        onSave={() => handleSave("aboutus")}
        fields={[
          { label: "Description *", value: config?.aboutus?.description || "", onChange: (v) => setSection("aboutus", "description", v), textarea: true },
          { label: "Mission", value: config?.aboutus?.mission || "", onChange: (v) => setSection("aboutus", "mission", v), textarea: true },
          { label: "Vision", value: config?.aboutus?.vision || "", onChange: (v) => setSection("aboutus", "vision", v), textarea: true },
        ]}
      />
    </div>
  );
}

function SectionCard({ title, fields, onSave, saving }) {
  return (
    <div className="settings-section-card">
      <div className="settings-section-header">
        <h4>{title}</h4>
        <button className="section-btn" onClick={onSave} disabled={saving}>
          {saving ? "Saving..." : "Save"}
        </button>
      </div>
      <div className="settings-section-fields">
        {fields.map((f) => (
          <div key={f.label} className="settings-field">
            <label className="tf-label">{f.label}</label>
            {f.type === "checkbox" ? (
              <label className="settings-toggle">
                <input type="checkbox" checked={f.checked} onChange={(e) => f.onChange(e.target.checked)} />
                <span className="toggle-track" />
              </label>
            ) : f.textarea ? (
              <textarea className="tf-input" style={{ resize: "vertical", minHeight: 56 }} value={f.value} onChange={(e) => f.onChange(e.target.value)} rows={3} />
            ) : (
              <input className="tf-input" value={f.value} onChange={(e) => f.onChange(e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
