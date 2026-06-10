import { useState, useEffect, useCallback } from "react";
import { getTitles, getTitle, deleteTitle } from "../../services/titles";
import DataTable from "../../components/DataTable";
import ConfirmDialog from "../../components/ConfirmDialog";
import StatusBadge from "../../components/StatusBadge";
import { useToast } from "../../components/Toast";
import TitleForm from "./TitleForm";

export default function MoviesPage({ routeParams }) {
  const toast = useToast();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editItem, setEditItem] = useState(
    routeParams === "new" ? true : null
  );
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTitles({ contentType: "movie" });
      setMovies(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (routeParams?.startsWith("edit/")) {
      const id = routeParams.slice(5);
      getTitle(id).then(data => { if (data) setEditItem(data); });
    }
  }, []);

  useEffect(() => {
    if (editItem === true) {
      window.history.replaceState(null, "", "#movies/new");
    } else if (editItem && editItem.id) {
      window.history.replaceState(null, "", `#movies/edit/${editItem.id}`);
    } else if (editItem === null && window.location.hash.includes("/")) {
      window.history.replaceState(null, "", "#movies");
    }
  }, [editItem]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteTitle(deleteTarget.id);
      setDeleteTarget(null);
      await load();
      toast("Movie deleted");
    } catch {
      toast("Failed to delete movie", "error");
    } finally {
      setDeleting(false);
    }
  }

  const columns = [
    { key: "title", label: "Title", render: (r) => <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{r.title}</span> },
    { key: "year", label: "Year" },
    { key: "rating", label: "Rating" },
    { key: "status", label: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "isNew", label: "New", render: (r) => r.isNew ? "✓" : "—" },
    { key: "isTrending", label: "Trending", render: (r) => r.isTrending ? "✓" : "—" },
  ];

  if (editItem !== null) {
    return (
      <div>
        <div className="ef-header">
          <h3>{editItem === true ? "Add Movie" : "Edit Movie"}</h3>
          <button className="ef-back" onClick={() => setEditItem(null)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            Back to List
          </button>
        </div>
        <TitleForm
          title={editItem === true ? null : editItem}
          onSaved={() => { setEditItem(null); load(); }}
          onCancel={() => setEditItem(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="section-header">
        <h3>Movies</h3>
        <button className="section-btn" onClick={() => setEditItem(true)}>+ Add Movie</button>
      </div>

      <DataTable
        columns={columns}
        data={movies}
        loading={loading}
        onEdit={(r) => setEditItem(r)}
        onDelete={setDeleteTarget}
        emptyMessage="No movies found"
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Movie"
        message={`Are you sure you want to delete "${deleteTarget?.title}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
