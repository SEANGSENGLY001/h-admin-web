import { useState, useEffect, useCallback } from "react";
import { getCategories, createCategory, updateCategory, deleteCategory } from "../../services/categories";
import DataTable from "../../components/DataTable";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";

function CategoryForm({ item, onSaved, onCancel }) {
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
      if (item) {
        await updateCategory(item.id, { name, description, thumbnailUrl, sortOrder: Number(sortOrder), isActive });
      } else {
        await createCategory({ name, description, thumbnailUrl, sortOrder: Number(sortOrder), isActive });
      }
      onSaved();
    } catch {
      alert("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Field label="Name *" value={name} onChange={setName} required placeholder="Category name" />
      <Field label="Description" value={description} onChange={setDescription} textarea placeholder="Optional description" />
      <Field label="Thumbnail URL" value={thumbnailUrl} onChange={setThumbnailUrl} placeholder="https://..." />
      <div style={{ display: "flex", gap: 14 }}>
        <Field label="Sort Order" value={String(sortOrder)} onChange={(v) => setSortOrder(Number(v))} type="number" style={{ flex: 1 }} />
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

function Field({ label, value, onChange, placeholder, required, textarea, type, style }) {
  const Cmp = textarea ? "textarea" : "input";
  return (
    <div style={style}>
      <label className="tf-label">{label}</label>
      <Cmp
        className="tf-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        type={type || "text"}
        rows={textarea ? 3 : undefined}
        style={textarea ? { resize: "vertical", minHeight: 56 } : undefined}
      />
    </div>
  );
}

export default function CategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getCategories()); }
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
        <h3>Categories</h3>
        <button className="section-btn" onClick={() => { setEditItem(null); setFormOpen(true); }}>+ Add Category</button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} onEdit={(r) => { setEditItem(r); setFormOpen(true); }} onDelete={setDeleteTarget} emptyMessage="No categories" />
      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? "Edit Category" : "Add Category"}>
        <CategoryForm item={editItem} onSaved={() => { setFormOpen(false); load(); }} onCancel={() => setFormOpen(false)} />
      </FormModal>
      <ConfirmDialog open={!!deleteTarget} title="Delete Category" message={`Delete "${deleteTarget?.name}"?`} onConfirm={async () => { setDeleting(true); try { await deleteCategory(deleteTarget.id); setDeleteTarget(null); await load(); } catch { alert("Failed"); } finally { setDeleting(false); } }} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
