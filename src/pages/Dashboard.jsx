import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getTitleStats, getTitles } from "../services/titles";
import { getDocs } from "../services/db";
import MoviesPage from "./titles/MoviesPage";
import TVShowsPage from "./titles/TVShowsPage";
import CategoriesPage from "./categories/CategoriesPage";
import TypesPage from "./types/TypesPage";
import GenresPage from "./genres/GenresPage";
import UsersPage from "./users/UsersPage";
import SchedulePage from "./schedule/SchedulePage";
import SettingsPage from "./settings/SettingsPage";
import "./Dashboard.css";

const navItems = [
  {
    id: "overview",
    label: "Overview",
    icon: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></>,
  },
  {
    id: "movies",
    label: "Movies",
    icon: <><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></>,
  },
  {
    id: "tvshows",
    label: "TV Shows",
    icon: <><rect x="2" y="2" width="20" height="20" rx="2" ry="2" /><path d="M8.5 14.5v-5l4 2.5z" /></>,
  },
  {
    id: "categories",
    label: "Categories",
    icon: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></>,
  },
  {
    id: "types",
    label: "Types",
    icon: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></>,
  },
  {
    id: "genres",
    label: "Genres",
    icon: <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  },
  {
    id: "users",
    label: "Users",
    icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  },
  {
    id: "schedule",
    label: "Schedule",
    icon: <><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></>,
  },
  {
    id: "settings",
    label: "Settings",
    icon: <><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></>,
  },
];

function DashboardIcon({ children }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}

export default function Dashboard() {
  const [activeNav, setActiveNav] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [s, recent] = await Promise.all([
          getTitleStats(),
          getTitles({ limit: 5 }),
        ]);
        setStats(s);
        setRecentUploads(recent);
      } catch {
        // silent
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  async function handleLogout() {
    try {
      await signOut(auth);
    } catch {
      // silently fail
    }
  }

  function renderContent() {
    switch (activeNav) {
      case "overview":
        return (
          <>
            <div className="stats-grid">
              {statsLoading ? (
                <>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="stat-card">
                      <div className="stat-label">&nbsp;</div>
                      <div className="stat-value" style={{ opacity: 0.3 }}>...</div>
                      <div className="stat-change" style={{ opacity: 0.2 }}>&nbsp;</div>
                    </div>
                  ))}
                </>
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-label">Total Titles</div>
                    <div className="stat-value">{stats?.total || 0}</div>
                    <div className="stat-change up">{stats?.active || 0} active</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Movies</div>
                    <div className="stat-value">{stats?.movies || 0}</div>
                    <div className="stat-change up">{((stats?.movies / (stats?.total || 1)) * 100).toFixed(0)}% of catalog</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">TV Series</div>
                    <div className="stat-value">{stats?.series || 0}</div>
                    <div className="stat-change up">{((stats?.series / (stats?.total || 1)) * 100).toFixed(0)}% of catalog</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-label">Active</div>
                    <div className="stat-value">{stats?.active || 0}</div>
                    <div className="stat-change up">currently published</div>
                  </div>
                </>
              )}
            </div>

            <div className="section">
              <div className="section-header">
                <h3>Recent Uploads</h3>
              </div>
              {recentUploads.length === 0 ? (
                <div className="table-empty">No titles added yet</div>
              ) : (
                <div className="uploads-table">
                  <div className="uploads-row header">
                    <span>Title</span>
                    <span>Type</span>
                    <span>Status</span>
                  </div>
                  {recentUploads.map((item) => (
                    <div key={item.id} className="uploads-row">
                      <span className="uploads-title">{item.title}</span>
                      <span className="uploads-type">{item.contentType === "movie" ? "Movie" : "Series"}</span>
                      <span className={`uploads-status status-${item.status?.toLowerCase() || "draft"}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
      case "movies":
        return <MoviesPage />;
      case "tvshows":
        return <TVShowsPage />;
      case "categories":
        return <CategoriesPage />;
      case "types":
        return <TypesPage />;
      case "genres":
        return <GenresPage />;
      case "users":
        return <UsersPage />;
      case "schedule":
        return <SchedulePage />;
      case "settings":
        return <SettingsPage />;
      default:
        return null;
    }
  }

  const currentLabel = navItems.find((n) => n.id === activeNav)?.label || "Overview";

  return (
    <div className="dashboard">
      <aside className={`sidebar${sidebarOpen ? "" : " collapsed"}`}>
        <div className="sidebar-brand">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
          <span>StreamAdmin</span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link${activeNav === item.id ? " active" : ""}`}
              onClick={() => setActiveNav(item.id)}
            >
              <DashboardIcon>{item.icon}</DashboardIcon>
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <button className="hamburger" onClick={() => setSidebarOpen((o) => !o)} title="Toggle sidebar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                {sidebarOpen ? (
                  <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                ) : (
                  <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>
                )}
              </svg>
            </button>
            <h2>{currentLabel}</h2>
          </div>
          <div className="topbar-actions">
            <button className="topbar-btn" title="Settings" onClick={() => setActiveNav("settings")}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
              </svg>
            </button>
            <button className="topbar-btn logout-btn" title="Sign Out" onClick={handleLogout}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </header>

        <main className="content">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
