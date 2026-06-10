import { useState, useEffect } from "react";
import { getSiteConfig, updateSection } from "../../services/siteconfig";
import { useToast } from "../../components/Toast";
import "../../components/EditForm.css";
import "./SettingsPage.css";

function SectionGroup({ title, fields, onSave, saving }) {
  return (
    <div className="ef-card" style={{ padding: "18px 20px" }}>
      <div className="st-card-header">
        <h4>{title}</h4>
        <button onClick={onSave} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
      </div>
      <div className="ef-grid" style={{ gap: 10 }}>
        {fields.map((f) => (
          <div key={f.label} className={f.full ? "ef-field full" : "ef-field"}>
            <label>{f.label}</label>
            {f.type === "toggle" ? (
              <label className="st-toggle">
                <input type="checkbox" checked={f.checked} onChange={(e) => f.onChange(e.target.checked)} />
                <span className="st-track" />
              </label>
            ) : f.textarea ? (
              <textarea className="ef-input" value={f.value} onChange={(e) => f.onChange(e.target.value)} rows={2} />
            ) : (
              <input className="ef-input" value={f.value} onChange={(e) => f.onChange(e.target.value)} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const toast = useToast();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
      toast("Settings saved");
    } catch {
      toast("Failed to save settings", "error");
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
      </div>

      <SectionGroup
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
          { label: "Maintenance Mode", type: "toggle", checked: config?.website?.maintenanceMode || false, onChange: (v) => setSection("website", "maintenanceMode", v) },
        ]}
      />

      <SectionGroup
        title="Social Links"
        saving={saving}
        onSave={() => handleSave("social")}
        fields={[
          { label: "Email", value: config?.social?.email || "", onChange: (v) => setSection("social", "email", v) },
          { label: "Phone", value: config?.social?.phoneNumber || "", onChange: (v) => setSection("social", "phoneNumber", v) },
          { label: "Telegram", value: config?.social?.telegram || "", onChange: (v) => setSection("social", "telegram", v) },
          { label: "Instagram", value: config?.social?.instagram || "", onChange: (v) => setSection("social", "instagram", v) },
          { label: "Facebook", value: config?.social?.facebook || "", onChange: (v) => setSection("social", "facebook", v) },
          { label: "YouTube", value: config?.social?.youtube || "", onChange: (v) => setSection("social", "youtube", v) },
        ]}
      />

      <SectionGroup
        title="About Us"
        saving={saving}
        onSave={() => handleSave("aboutus")}
        fields={[
          { full: true, label: "Description", value: config?.aboutus?.description || "", onChange: (v) => setSection("aboutus", "description", v), textarea: true },
          { full: true, label: "Mission", value: config?.aboutus?.mission || "", onChange: (v) => setSection("aboutus", "mission", v), textarea: true },
          { full: true, label: "Vision", value: config?.aboutus?.vision || "", onChange: (v) => setSection("aboutus", "vision", v), textarea: true },
        ]}
      />
    </div>
  );
}
