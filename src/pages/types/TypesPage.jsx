import { useState, useEffect, useCallback } from "react";
import { getTypes, createType, updateType, deleteType } from "../../services/types";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import "../../components/EditForm.css";

function TypeForm({ item, onSaved, onCancel }) {
  const toast = useToast();
  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [sortOrder, setSortOrder] = useState(item?.sortOrder ?? 0);
  const [isActive, setIsActive] = useState(item?.isActive ?? true);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, description, sortOrder: Number(sortOrder), isActive };
      if (item) await updateType(item.id, data);
      else await createType(data);
      toast("Type saved");
      onSaved();
    } catch { toast("Failed to save type", "error"); }
    finally { setSaving(false); }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="ef-card">
        <div className="ef-card-title">Basic Information</div>
        <div className="ef-grid">
          <div className="ef-field full">
            <label>Name *</label>
            <input className="ef-input" value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. Movie, Series" />
          </div>
          <div className="ef-field full">
            <label>Description</label>
            <textarea className="ef-input" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
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
        <button type="submit" className="ef-btn save" disabled={saving}>{saving ? "Saving..." : item ? "Update Type" : "Create Type"}</button>
      </div>
    </form>
  );
}

export default function TypesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await getTypes()); }
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

  if (editItem !== null) {
    return (
      <div>
        <div className="ef-header">
          <h3>{editItem === true ? "Add Type" : "Edit Type"}</h3>
          <button className="ef-back" onClick={() => setEditItem(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to List
          </button>
        </div>
        <TypeForm
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
        <h3>Types</h3>
        <button className="section-btn" onClick={() => setEditItem(true)}>+ Add Type</button>
      </div>
      <DataTable columns={columns} data={items} loading={loading} onEdit={(r) => setEditItem(r)} onDelete={setDeleteTarget} emptyMessage="No types" />
      <ConfirmDialog open={!!deleteTarget} title="Delete Type" message={`Delete "${deleteTarget?.name}"?`} onConfirm={async () => { setDeleting(true); try { await deleteType(deleteTarget.id); setDeleteTarget(null); await load(); toast("Type deleted"); } catch { toast("Failed to delete type", "error"); } finally { setDeleting(false); } }} onCancel={() => setDeleteTarget(null)} loading={deleting} />
    </div>
  );
}
