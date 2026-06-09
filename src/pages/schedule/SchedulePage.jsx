import { useState, useEffect, useCallback } from "react";
import { getSchedule, createScheduleItem, updateScheduleItem, deleteScheduleItem } from "../../services/schedule";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import "../../components/EditForm.css";

function ScheduleForm({ item, onSaved, onCancel }) {
  const toast = useToast();
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
      toast("Schedule entry saved");
      onSaved();
    } catch { toast("Failed to save schedule", "error"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="ef-card">
        <div className="ef-card-title">Schedule Details</div>
        <div className="ef-grid">
          <div className="ef-field">
            <label>Air Date *</label>
            <input className="ef-input" type="date" value={airDate} onChange={(e) => setAirDate(e.target.value)} required />
          </div>
          <div className="ef-field">
            <label>Air Time</label>
            <input className="ef-input" type="time" value={airTime} onChange={(e) => setAirTime(e.target.value)} />
          </div>
          <div className="ef-field">
            <label>Episode Title</label>
            <input className="ef-input" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} placeholder="Episode title" />
          </div>
          <div className="ef-field">
            <label>Duration (min)</label>
            <input className="ef-input" type="number" min="1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} />
          </div>
          <div className="ef-field">
            <label>Episode #</label>
            <input className="ef-input" type="number" min="1" value={episodeNumber} onChange={(e) => setEpisodeNumber(Number(e.target.value))} />
          </div>
          <div className="ef-field">
            <label>Season #</label>
            <input className="ef-input" type="number" min="1" value={seasonNumber} onChange={(e) => setSeasonNumber(Number(e.target.value))} />
          </div>
          <div className="ef-field">
            <label>Priority</label>
            <input className="ef-input" type="number" min="0" value={priority} onChange={(e) => setPriority(Number(e.target.value))} />
          </div>
          <div className="ef-field">
            <label>Playlist ID</label>
            <input className="ef-input" value={playlistId} onChange={(e) => setPlaylistId(e.target.value)} placeholder="titleId" />
          </div>
          <div className="ef-field">
            <label>Video ID</label>
            <input className="ef-input" value={videoId} onChange={(e) => setVideoId(e.target.value)} placeholder="videoId" />
          </div>
        </div>
      </div>

      <div className="ef-card">
        <div className="ef-card-title">Options</div>
        <div className="ef-check-row">
          <input type="checkbox" id="isRepeat" checked={isRepeat} onChange={(e) => setIsRepeat(e.target.checked)} />
          <label htmlFor="isRepeat">Repeat</label>
        </div>
        <div className="ef-check-row">
          <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          <label htmlFor="isActive">Active</label>
        </div>
      </div>

      <div className="ef-actions">
        <button type="button" className="ef-btn cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="ef-btn save" disabled={saving}>{saving ? "Saving..." : item ? "Update Schedule" : "Create Schedule"}</button>
      </div>
    </form>
  );
}

export default function SchedulePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
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

  if (editItem !== null) {
    return (
      <div>
        <div className="ef-header">
          <h3>{editItem === true ? "Add Schedule" : "Edit Schedule"}</h3>
          <button className="ef-back" onClick={() => setEditItem(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to List
          </button>
        </div>
        <ScheduleForm
          item={editItem === true ? null : editItem}
          onSaved={() => { setEditItem(null); load(); }}
          onCancel={() => setEditItem(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h3>TV Schedule</h3>
        <button className="section-btn" onClick={() => setEditItem(true)}>+ Add Slot</button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} onEdit={(r) => setEditItem(r)} onDelete={setDeleteTarget} emptyMessage="No schedule entries" />
      <ConfirmDialog open={!!deleteTarget} title="Delete Schedule" message={`Delete this schedule entry?`} onConfirm={async () => { setDeleting(true); try { await deleteScheduleItem(deleteTarget.id); setDeleteTarget(null); await load(); toast("Schedule entry deleted"); } catch { toast("Failed to delete schedule", "error"); } finally { setDeleting(false); } }} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
