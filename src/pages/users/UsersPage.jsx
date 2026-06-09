import { useState, useEffect, useCallback } from "react";
import { getDocs } from "../../services/db";
import DataTable from "../../components/DataTable";
import StatusBadge from "../../components/StatusBadge";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getDocs("users", { orderBy: [{ field: "lastLogin", dir: "desc" }] });
      setUsers(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const columns = [
    { key: "email", label: "Email", render: (r) => <span style={{ color: "var(--text-h)", fontWeight: 500 }}>{r.email}</span> },
    { key: "lastLogin", label: "Last Login", render: (r) => r.lastLogin?.toDate?.()?.toLocaleDateString() || r.lastLogin || "—" },
    { key: "createdAt", label: "Joined", render: (r) => r.createdAt?.toDate?.()?.toLocaleDateString() || "—" },
    { key: "role", label: "Role", render: (r) => <StatusBadge status={r.role || "user"} /> },
  ];

  return (
    <div>
      <div className="section-header">
        <h3>Users</h3>
      </div>
      <DataTable columns={columns} data={users} loading={loading} onEdit={() => {}} onDelete={() => {}} emptyMessage="No users found" />
    </div>
  );
}
