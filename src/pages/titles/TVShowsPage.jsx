import { useState, useEffect, useCallback } from "react";
import { getTitles, deleteTitle } from "../../services/titles";
import DataTable from "../../components/DataTable";
import FormModal from "../../components/FormModal";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import TitleForm from "./TitleForm";

export default function TVShowsPage() {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTitles({ contentType: "series" });
      setShows(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function openCreate() {
    setEditItem(null);
    setFormOpen(true);
  }

  function openEdit(row) {
    setEditItem(row);
    setFormOpen(true);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTitle(deleteTarget.id);
      setDeleteTarget(null);
      await load();
    } catch {
      alert("Failed to delete");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: "title", label: "Title", render: (r) => <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{r.title}</span> },
    { key: "season", label: "Season" },
    { key: "rating", label: "Rating" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "isNew", label: "New", render: (r) => r.isNew ? "✓" : "—" },
    { key: "isTrending", label: "Trending", render: (r) => r.isTrending ? "✓" : "—" },
  ];

  return (
    <div>
      <div className="section-header">
        <h3>TV Shows</h3>
        <button className="section-btn" onClick={openCreate}>+ Add TV Show</button>
      </div>

      <DataTable
        columns={columns}
        data={shows}
        loading={loading}
        onEdit={openEdit}
        onDelete={setDeleteTarget}
        emptyMessage="No TV shows found"
      />

      <FormModal open={formOpen} onClose={() => setFormOpen(false)} title={editItem ? "Edit TV Show" : "Add TV Show"}>
        <TitleForm
          title={editItem}
          onSaved={() => { setFormOpen(false); load(); }}
          onCancel={() => setFormOpen(false)}
        />
      </FormModal>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete TV Show"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
