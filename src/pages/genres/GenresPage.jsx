import { useState, useEffect, useCallback } from "react";
import { getGenres, getGenre, createGenre, updateGenre, deleteGenre } from "../../services/genres";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import "../../components/EditForm.css";

function GenreForm({ item, onSaved, onCancel }) {
  const toast = useToast();
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [thumbnailUrl, setThumbnailUrl] = useState(item?.thumbnailUrl || "");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, description, thumbnailUrl, sortOrder: Number(sortOrder), isActive };
      if (item) await updateGenre(item.id, data);
      else await createGenre(data);
      toast("Genre saved");
      onSaved();
    } catch { toast("Failed to save genre", "error"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="ef-card">
        <div className="ef-card-title">Basic Information</div>
        <div className="ef-grid">
          <div className="ef-field full">
            <label>Name *</label>
            <input className="ef-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Action, Drama" />
          </div>
          <div className="ef-field full">
            <label>Description</label>
            <textarea className="ef-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <div className="ef-field full">
            <label>Thumbnail URL</label>
            <input className="ef-input" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div className="ef-field">
            <label>Sort Order</label>
            <input className="ef-input" type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
          </div>
          <div className="ef-field">
            <label>Status</label>
            <div className="ef-check-row">
              <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              <label htmlFor="isActive">Active</label>
            </div>
          </div>
        </div>
      </div>

      <div className="ef-actions">
        <button type="button" className="ef-btn cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="ef-btn save" disabled={saving}>{saving ? "Saving..." : item ? "Update Genre" : "Create Genre"}</button>
      </div>
    </form>
  );
}

export default function GenresPage({ routeParams }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(
    routeParams === "new" ? true : null
  );
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getGenres()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (routeParams?.startsWith("edit/")) {
      const id = routeParams.slice(5);
      getGenre(id).then(data => { if (data) setEditItem(data); });
    }
  }, []);

  useEffect(() => {
    if (editItem === true) {
      window.history.replaceState(null, "", "#genres/new");
    } else if (editItem && editItem.id) {
      window.history.replaceState(null, "", `#genres/edit/${editItem.id}`);
    } else if (editItem === null && window.location.hash.includes("/")) {
      window.history.replaceState(null, "", "#genres");
    }
  }, [editItem]);

  const columns = [
    { key: "name", label: "Name", render: (r) => <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{r.name}</span> },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
    { key: "sortOrder", label: "Order" },
    { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
  ];

  if (editItem !== null) {
    return (
      <div>
        <div className="ef-header">
          <h3>{editItem === true ? "Add Genre" : "Edit Genre"}</h3>
          <button className="ef-back" onClick={() => setEditItem(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to List
          </button>
        </div>
        <GenreForm
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
        <h3>Genres</h3>
        <button className="section-btn" onClick={() => setEditItem(true)}>+ Add Genre</button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} onEdit={(r) => setEditItem(r)} onDelete={setDeleteTarget} emptyMessage="No genres" />
      <ConfirmDialog open={!!deleteTarget} title="Delete Genre" message={`Delete "${deleteTarget?.name}"?`} onConfirm={async () => { setDeleting(true); try { await deleteGenre(deleteTarget.id); setDeleteTarget(null); await load(); toast("Genre deleted"); } catch { toast("Failed to delete genre", "error"); } finally { setDeleting(false); } }} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
