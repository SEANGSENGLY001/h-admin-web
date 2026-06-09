import { useState, useEffect, useCallback } from "react";
import { getGenres, createGenre, updateGenre, deleteGenre } from "../../services/genres";
import DataTable from "../../components/DataTable";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";

function GenreForm({ item, onSaved, onCancel }) {
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
      onSaved();
    } catch { alert("Failed to save"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label className="tf-label">Name *</label>
        <input className="tf-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Action, Drama" />
      </div>
      <div>
        <label className="tf-label">Description</label>
        <textarea className="tf-input" style={{ resize: "vertical", minHeight: 56 }} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" rows={3} />
      </div>
      <div>
        <label className="tf-label">Thumbnail URL</label>
        <input className="tf-input" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="https://..." />
      </div>
      <div style={{ display: "flex", gap: 14 }}>
        <div style={{ flex: 1 }}>
          <label className="tf-label">Sort Order</label>
          <input className="tf-input" type="number" min="0" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
        </div>
        <div style={{ flex: 1, display: "flex", alignItems: "flex-end", paddingBottom: 4 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text)", cursor: "pointer" }}>
            <input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} style={{ accentColor: "var(--accent)" }} />
            Active
          </label>
        </div>
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", borderTop: "1px solid var(--border)", paddingTop: 14 }}>
        <button type="button" className="tf-btn cancel" onClick={onCancel} disabled={saving}>Cancel</button>
        <button type="submit" className="tf-btn save" disabled={saving}>{saving ? "Saving..." : item ? "Update" : "Create"}</button>
      </div>
    </form>
  );
}

export default function GenresPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getGenres()); }
    catch { /* silent */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "name", label: "Name", render: (r) => <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{r.name}</span> },
    { key: "description", label: "Description", render: (r) => r.description || "—" },
    { key: "sortOrder", label: "Order" },
    { key: "isActive", label: "Status", render: (r) => <StatusBadge status={r.isActive ? "active" : "inactive"} /> },
  ];

  return (
    <div>
      <div className="section-header">
        <h3>Genres</h3>
        <button className="section-btn" onClick={() => { setEditItem(null); setFormOpen(true); }}>+ Add Genre</button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} onEdit={(r) => { setEditItem(r); setFormOpen(true); }} onDelete={setDeleteTarget} emptyMessage="No genres" />
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? "Edit Genre" : "Add Genre"}>
        <GenreForm item={editItem} onSaved={() => { setFormOpen(false); load(); }} onCancel={() => setFormOpen(false)} />
      </FormModal>
      <ConfirmDialog open={!!deleteTarget} title="Delete Genre" message={`Delete "${deleteTarget?.name}"?`} onConfirm={async () => { setDeleting(true); try { await deleteGenre(deleteTarget.id); setDeleteTarget(null); await load(); } catch { alert("Failed"); } finally { setDeleting(false); } }} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
