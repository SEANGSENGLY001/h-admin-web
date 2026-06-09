import { useState, useEffect, useCallback } from "react";
import { getSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem } from "../../services/schedule";
import DataTable from "../../components/DataTable";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";

function ScheduleForm({ item, onSaved, onCancel }) {
  const [playlistId, setPlaylistId] = useState(item?.playlistId || "");
  const [videoId, setVideoId] = useState(item?.videoId || "");
  const [airDate, setAirDate] = useState(item?.airDate || "");
  const [airTime, setAirTime] = useState(item?.airTime || "");
  const [duration, setDuration] = useState(item?.duration ?? 60);
  const [episodeTitle, setEpisodeTitle] = useState(item?.episodeTitle || "");
  const [episodeNumber, setEpisodeNumber] = useState(item?.episodeNumber ?? 1);
  const [seasonNumber, setSeasonNumber] = useState(item?.seasonNumber ?? 1);
  const [isRepeat, setIsRepeat] = useState(item?.isRepeat || false);
  const [priority, setPriority] = useState(item?.priority ?? 0);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { playlistId, videoId, airDate, airTime, duration: Number(duration), episodeTitle, episodeNumber: Number(episodeNumber), seasonNumber: Number(seasonNumber), isRepeat, priority: Number(priority), isActive };
      if (item) await updateScheduleItem(item.id, data);
      else await createScheduleItem(data);
      onSaved();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label className="tf-label">Playlist ID</label>
          <input className="tf-input" value={playlistId} onChange={(e) => setPlaylistId(e.target.value)} placeholder="titleId" />
        </div>
        <div>
          <label className="tf-label">Video ID</label>
          <input className="tf-input" value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="videoId" />
        </div>
        <div>
          <label className="tf-label">Air Date *</label>
          <input className="tf-input" type="date" value={airDate} onChange={(e) => setAirDate(e.target.value)} required />
        </div>
        <div>
          <label className="tf-label">Air Time</label>
          <input className="tf-input" type="time" value={airTime} onChange={(e) => setAirTime(e.target.value)} />
        </div>
        <div>
          <label className="tf-label">Duration (min)</label>
          <input className="tf-input" type="number" min="1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
        </div>
        <div>
          <label className="tf-label">Priority</label>
          <input className="tf-input" type="number" min="0" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
        </div>
        <div>
          <label className="tf-label">Episode #</label>
          <input className="tf-input" type="number" min="1" value={episodeNumber} onChange={(e) => setEpisodeNumber(Number(e.target.value))} />
        </div>
        <div>
          <label className="tf-label">Season #</label>
          <input className="tf-input" type="number" min="1" value={seasonNumber} onChange={(e) => setSeasonNumber(Number(e.target.value))} />
        </div>
      </div>
      <div>
        <label className="tf-label">Episode Title</label>
        <input className="tf-input" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} placeholder="Episode title" />
      </div>
      <div style={{ display: "flex", gap: 16 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
          <input type="checkbox" checked={isRepeat} onChange={(e) => setIsRepeat(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
          Repeat
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
          <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
          Active
        </label>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <button type="button" className="tf-btn cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="tf-btn save" disabled={saving}>{saving ? "Saving..." : item ? "Update" : "Create"}</button>
      </div>
    </form>
  );
}

export default function SchedulePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getSchedule({ isActive: true })); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "episodeTitle", label: "Episode", render: (r) => <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{r.episodeTitle || "Untitled"}</span> },
    { key: "airDate", label: "Date", render: (r) => r.airDate || "—" },
    { key: "airTime", label: "Time", render: (r) => r.airTime || "—" },
    { key: "episodeNumber", label: "Ep#" },
    { key: "seasonNumber", label: "S#" },
    { key: "isRepeat", label: "Repeat", render: (r) => r.isRepeat ? "✓" : "—" },
    { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
  ];

  return (
    <div>
      <div className="section-header">
        <h3>TV Schedule</h3>
        <button className="section-btn" onClick={() => { setEditItem(null); setFormOpen(true); }}>+ Add Slot</button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} onEdit={(r) => { setEditItem(r); setFormOpen(true); }} onDelete={setDeleteTarget} emptyMessage="No schedule entries" />
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? "Edit Schedule" : "Add Schedule"}>
        <ScheduleForm item={editItem} onSaved={() => { setFormOpen(false); load(); }} onCancel={() => setFormOpen(false)} />
      </FormModal>
      <ConfirmDialog open={!!deleteTarget} title="Delete Schedule" message={`Delete this schedule entry?`} onConfirm={async () => { setDeleting(true); try { await deleteScheduleItem(deleteTarget.id); setDeleteTarget(null); await load(); } catch { alert("Failed"); } finally { setDeleting(false); } }} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
