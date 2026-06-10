import { useState, useEffect, useCallback, useRef } from "react";
import { getSchedule, getScheduleItem, createScheduleItem, updateScheduleItem, deleteScheduleItem } from "../../services/schedule";
import { getTitles } from "../../services/titles";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import "../../components/EditForm.css";
import "./SchedulePage.css";

function ScheduleForm({ item, onSaved, onCancel }) {
  const toast = useToast();
  const [titles, setTitles] = useState([]);
  const [titleSearch, setTitleSearch] = useState("");
  const [selectedTitle, setSelectedTitle] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
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
  const searchRef = useRef(null);

  useEffect(() => {
    getTitles().then((all) => {
      setTitles(all);
      if (item?.playlistId) {
        const found = all.find((t) => t.id === item.playlistId);
        if (found) {
          setSelectedTitle(found);
          setTitleSearch(found.title);
        }
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    function handleClick(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function handleSelectTitle(title) {
    setSelectedTitle(title);
    setTitleSearch(title.title);
    setShowDropdown(false);
  }

  const filteredTitles = titles.filter(
    (t) => t.title.toLowerCase().includes(titleSearch.toLowerCase())
  ).slice(0, 20);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = {
        playlistId: selectedTitle?.id || "",
        airDate,
        airTime,
        duration: Number(duration),
        episodeTitle,
        episodeNumber: Number(episodeNumber),
        seasonNumber: Number(seasonNumber),
        isRepeat,
        priority: Number(priority),
        isActive,
      };
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
          <div className="ef-field full">
            <label>Movie / TV Series *</label>
            <div className="st-search" ref={searchRef}>
              <input
                className={`ef-input${selectedTitle ? " st-search-input" : ""}`}
                value={titleSearch}
                onChange={(e) => { setTitleSearch(e.target.value); setShowDropdown(true); }}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search by title..."
                required
              />
              {selectedTitle && (
                <span className="st-badge">
                  {selectedTitle.contentType === "movie" ? "Movie" : "Series"}
                </span>
              )}
              {showDropdown && filteredTitles.length > 0 && (
                <div className="st-dropdown">
                  {filteredTitles.map((t) => (
                    <div
                      key={t.id}
                      className={`st-option${selectedTitle?.id === t.id ? " selected" : ""}`}
                      onClick={() => handleSelectTitle(t)}
                    >
                      {t.posterUrl && <img className="st-opt-thumb" src={t.posterUrl} alt="" />}
                      <div className="st-opt-info">
                        <span className="st-opt-title">{t.title}</span>
                        <div className="st-opt-meta">
                          <span className="st-opt-type">{t.contentType === "movie" ? "Movie" : "Series"}</span>
                          {t.year && <span className="st-opt-year">{t.year}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {showDropdown && titleSearch && filteredTitles.length === 0 && (
                <div className="st-dropdown st-empty">No titles found</div>
              )}
            </div>
          </div>

          <div className="ef-field full">
            <label>Air Date & Time</label>
            <div className="st-input-group">
              <input className="ef-input" type="date" value={airDate} onChange={(e) => setAirDate(e.target.value)} required />
              <span className="st-group-label">at</span>
              <input className="ef-input" type="time" value={airTime} onChange={(e) => setAirTime(e.target.value)} />
            </div>
          </div>

          <div className="ef-field full">
            <label>Episode Title</label>
            <input className="ef-input" value={episodeTitle} onChange={(e) => setEpisodeTitle(e.target.value)} placeholder="Episode title" />
          </div>

          <div className="ef-field full">
            <label>Details</label>
            <div className="st-input-group">
              <input className="ef-input" type="number" min="1" value={duration} onChange={(e) => setDuration(Number(e.target.value))} placeholder="Duration" />
              <span className="st-group-label">min</span>
              <input className="ef-input" type="number" min="1" value={episodeNumber} onChange={(e) => setEpisodeNumber(Number(e.target.value))} placeholder="Ep#" style={{ maxWidth: 100 }} />
              <span className="st-group-label">Ep</span>
              <input className="ef-input" type="number" min="1" value={seasonNumber} onChange={(e) => setSeasonNumber(Number(e.target.value))} placeholder="S#" style={{ maxWidth: 100 }} />
              <span className="st-group-label">S</span>
              <input className="ef-input" type="number" min="0" value={priority} onChange={(e) => setPriority(Number(e.target.value))} placeholder="Priority" style={{ maxWidth: 110 }} />
              <span className="st-group-label">prio</span>
            </div>
          </div>

          <div className="ef-field full">
            <div className="st-inline-checks">
              <label>
                <input type="checkbox" checked={isRepeat} onChange={(e) => setIsRepeat(e.target.checked)} />
                Repeat
              </label>
              <label>
                <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                Active
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="ef-actions">
        <button type="button" className="ef-btn cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="ef-btn save" disabled={saving}>{saving ? "Saving..." : item ? "Update Schedule" : "Create Schedule"}</button>
      </div>
    </form>
  );
}

export default function SchedulePage({ routeParams }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(
    routeParams === "new" ? true : null
  );
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getSchedule()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (routeParams?.startsWith("edit/")) {
      const id = routeParams.slice(5);
      getScheduleItem(id).then(data => { if (data) setEditItem(data); });
    }
  }, []);

  useEffect(() => {
    if (editItem === true) {
      window.history.replaceState(null, "", "#schedule/new");
    } else if (editItem && editItem.id) {
      window.history.replaceState(null, "", `#schedule/edit/${editItem.id}`);
    } else if (editItem === null && window.location.hash.includes("/")) {
      window.history.replaceState(null, "", "#schedule");
    }
  }, [editItem]);

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
