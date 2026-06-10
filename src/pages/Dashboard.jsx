import { useState, useEffect, useMemo } from "react";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import { getTitleStats, getTitles } from "../services/titles";

import MoviesPage from "./titles/MoviesPage";
import TVShowsPage from "./titles/TVShowsPage";
import CategoriesPage from "./categories/CategoriesPage";
import TypesPage from "./types/TypesPage";
import GenresPage from "./genres/GenresPage";
import UsersPage from "./users/UsersPage";
import SchedulePage from "./schedule/SchedulePage";
import SettingsPage from "./settings/SettingsPage";
import "./Dashboard.css";

const Svg = ({ children }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
);

const navItems = [
  { id: "overview", label: "Overview", icon: <Svg><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></Svg> },
  { id: "movies", label: "Movies", icon: <Svg><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" /></Svg> },
  { id: "tvshows", label: "TV Shows", icon: <Svg><rect x="2" y="2" width="20" height="20" rx="2" ry="2" /><path d="M8.5 14.5v-5l4 2.5z" /></Svg> },
  { id: "categories", label: "Categories", icon: <Svg><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></Svg> },
  { id: "types", label: "Types", icon: <Svg><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><polyline points="10 9 9 9 8 9" /></Svg> },
  { id: "genres", label: "Genres", icon: <Svg><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></Svg> },
  { id: "users", label: "Users", icon: <Svg><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></Svg> },
  { id: "schedule", label: "Schedule", icon: <Svg><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></Svg> },
  { id: "settings", label: "Settings", icon: <Svg><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></Svg> },
];

function parseHash() {
  const hash = window.location.hash.replace(/^#/, "");
  const parts = hash.split("/").filter(Boolean);
  const page = parts[0] || "overview";
  const valid = ["movies","tvshows","categories","types","genres","users","schedule","settings"];
  return valid.includes(page) ? { page, params: parts.slice(1).join("/") } : { page: "overview", params: "" };
}

export default function Dashboard() {
  const init = parseHash();
  const [activeNav, setActiveNav] = useState(init.page);
  const [routeParams, setRouteParams] = useState(init.params);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentUploads, setRecentUploads] = useState([]);
  const [statsLoading, setStatsLoading] = useState(true);

  const [allTitles, setAllTitles] = useState([]);

  useEffect(() => {
    const onHash = () => {
      const { page, params } = parseHash();
      setActiveNav(page);
      setRouteParams(params);
      setSidebarOpen(false);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    async function loadStats() {
      try {
        const [s, recent, all] = await Promise.all([
          getTitleStats(),
          getTitles({ limit: 6 }),
          getTitles(),
        ]);
        setStats(s);
        setRecentUploads(recent);
        setAllTitles(all);
      } catch {
        // silent
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

  const chartData = useMemo(() => {
    const months = {};
    for (const t of allTitles) {
      let d = t.createdAt;
      if (!d) continue;
      if (typeof d === "object" && d.seconds) d = new Date(d.seconds * 1000);
      else d = new Date(d);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      months[key] = (months[key] || 0) + 1;
    }
    return Object.entries(months).sort().slice(-6).map(([m, c]) => ({
      month: m,
      count: c,
    }));
  }, [allTitles]);

  const pieData = useMemo(() => [
    { name: "Movies", value: stats?.movies || 0, color: "#6366f1" },
    { name: "TV Series", value: stats?.series || 0, color: "#f59e0b" },
  ], [stats]);

  const COLORS = ["#6366f1", "#f59e0b", "#3b82f6", "#10b981"];

  async function handleLogout() {
    try { await signOut(auth); } catch { /* silent */ }
  }

  function setNav(id) {
    setActiveNav(id);
    setRouteParams("");
    const hash = id === "overview" ? "" : id;
    window.history.replaceState(null, "", `#${hash}`);
  }

  function fmtDate(ts) {
    if (!ts) return "";
    if (typeof ts === "object" && ts.seconds) return new Date(ts.seconds * 1000).toLocaleDateString();
    try { return new Date(ts).toLocaleDateString(); } catch { return ""; }
  }

  function renderContent() {
    switch (activeNav) {
      case "overview":
        return (
          <>
            <div className="stats-grid">
              {statsLoading ? (
                [1, 2, 3, 4].map((i) => (
                  <div key={i} className="stat-card">
                    <div className="stat-icon" style={{ opacity: 0.2 }} />
                    <div className="stat-label">&nbsp;</div>
                    <div className="stat-value" style={{ opacity: 0.2 }}>...</div>
                  </div>
                ))
              ) : (
                <>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
                      </svg>
                    </div>
                    <div className="stat-label">Total Titles</div>
                    <div className="stat-value">{stats?.total || 0}</div>
                    <div className="stat-change up">{stats?.active || 0} active</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" /><line x1="17" y1="17" x2="22" y2="17" /><line x1="17" y1="7" x2="22" y2="7" />
                      </svg>
                    </div>
                    <div className="stat-label">Movies</div>
                    <div className="stat-value">{stats?.movies || 0}</div>
                    <div className="stat-change up">{((stats?.movies / (stats?.total || 1)) * 100).toFixed(0)}% of catalog</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="2" ry="2" /><path d="M8.5 14.5v-5l4 2.5z" />
                      </svg>
                    </div>
                    <div className="stat-label">TV Series</div>
                    <div className="stat-value">{stats?.series || 0}</div>
                    <div className="stat-change up">{((stats?.series / (stats?.total || 1)) * 100).toFixed(0)}% of catalog</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                      </svg>
                    </div>
                    <div className="stat-label">Active</div>
                    <div className="stat-value">{stats?.active || 0}</div>
                    <div className="stat-change up">currently published</div>
                  </div>
                </>
              )}
            </div>

            <div className="charts-row">
              <div className="chart-card">
                <div className="chart-header">
                  <h4>Content Distribution</h4>
                  <span className="chart-hint">{stats?.total || 0} total</span>
                </div>
                {statsLoading ? (
                  <div className="chart-skeleton" />
                ) : (
                  <svg viewBox="0 0 200 200" style={{ width: "100%", height: 200, display: "block" }}>
                    <g transform="translate(100,100)">
                      {(() => {
                        const total = pieData.reduce((s, d) => s + d.value, 0) || 1;
                        let offset = 0;
                        const R = 75, r = 55;
                        return pieData.map((d, i) => {
                          const angle = (d.value / total) * 360;
                          if (angle === 0) return null;
                          const largeArc = angle > 180 ? 1 : 0;
                          const x1 = R * Math.sin((offset * Math.PI) / 180);
                          const y1 = -R * Math.cos((offset * Math.PI) / 180);
                          const x2 = R * Math.sin(((offset + angle) * Math.PI) / 180);
                          const y2 = -R * Math.cos(((offset + angle) * Math.PI) / 180);
                          const el = (
                            <path key={i} d={`M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2} L ${(x2 * r) / R} ${(y2 * r) / R} A ${r} ${r} 0 ${largeArc} 0 ${(x1 * r) / R} ${(y1 * r) / R} Z`} fill={d.color} />
                          );
                          offset += angle;
                          return el;
                        });
                      })()}
                    </g>
                  </svg>
                )}
                <div className="chart-legend">
                  {pieData.map((d) => (
                    <div key={d.name} className="chart-legend-item">
                      <span className="chart-dot" style={{ background: d.color }} />
                      <span className="chart-label">{d.name}</span>
                      <span className="chart-val">{d.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="chart-card">
                <div className="chart-header">
                  <h4>Monthly Uploads</h4>
                  <span className="chart-hint">last 6 months</span>
                </div>
                {statsLoading ? (
                  <div className="chart-skeleton" />
                ) : chartData.length === 0 ? (
                  <div className="chart-empty">No data yet</div>
                ) : (
                  <svg viewBox="0 0 300 200" style={{ width: "100%", height: 200, display: "block" }}>
                    {(() => {
                      const max = Math.max(...chartData.map(d => d.count), 1);
                      const pad = { t: 10, r: 10, b: 30, l: 35 };
                      const w = 300 - pad.l - pad.r;
                      const h = 200 - pad.t - pad.b;
                      const bw = w / chartData.length * 0.65;
                      const gap = w / chartData.length * 0.35;
                      return (
                        <g transform={`translate(${pad.l},${pad.t})`}>
                          {/* Y axis */}
                          <line x1="0" y1="0" x2="0" y2={h} stroke="var(--border)" strokeWidth="1" />
                          {/* Y ticks */}
                          {[0, Math.round(max / 2), max].filter(v => v > 0 || max > 0).map((v, i) => (
                            <g key={i}>
                              <line x1="-4" y1={h - (v / max) * h} x2="0" y2={h - (v / max) * h} stroke="var(--border)" strokeWidth="1" />
                              <text x="-8" y={h - (v / max) * h + 4} textAnchor="end" fill="var(--text-muted)" fontSize="10">{v}</text>
                            </g>
                          ))}
                          {/* Bars */}
                          {chartData.map((d, i) => {
                            const x = i * (bw + gap) + gap / 2;
                            const bh = (d.count / max) * h;
                            return (
                              <g key={i}>
                                <rect x={x} y={h - bh} width={bw} height={bh} rx="3" ry="3" fill="#6366f1" opacity="0.85" />
                                <text x={x + bw / 2} y={h + 16} textAnchor="middle" fill="var(--text-muted)" fontSize="9" transform={`rotate(-25,${x + bw / 2},${h + 16})`}>{d.month.slice(5)}</text>
                                <text x={x + bw / 2} y={h - bh - 4} textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="600">{d.count}</text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </svg>
                )}
              </div>
            </div>

            <div className="quick-actions">
              <button className="qa-card" onClick={() => { setNav("movies"); }}>
                <div className="qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" /><line x1="12" y1="6" x2="12" y2="18" /><line x1="6" y1="12" x2="18" y2="12" />
                  </svg>
                </div>
                <div className="qa-text">
                  <strong>Add Movie</strong>
                  <span>Add a new movie to catalog</span>
                </div>
              </button>
              <button className="qa-card" onClick={() => { setNav("tvshows"); }}>
                <div className="qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="2" ry="2" /><path d="M8.5 14.5v-5l4 2.5z" /><line x1="12" y1="6" x2="12" y2="18" />
                  </svg>
                </div>
                <div className="qa-text">
                  <strong>Add TV Series</strong>
                  <span>Add a new series to catalog</span>
                </div>
              </button>
              <button className="qa-card" onClick={() => { setNav("schedule"); }}>
                <div className="qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /><line x1="12" y1="14" x2="12" y2="18" />
                  </svg>
                </div>
                <div className="qa-text">
                  <strong>Schedule Slot</strong>
                  <span>Add air time to schedule</span>
                </div>
              </button>
              <button className="qa-card" onClick={() => { setNav("users"); }}>
                <div className="qa-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="qa-text">
                  <strong>Manage Users</strong>
                  <span>View and manage users</span>
                </div>
              </button>
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
                    <span />
                  </div>
                  {recentUploads.map((item) => (
                    <div key={item.id} className="uploads-row">
                      <div className="uploads-info">
                        {item.posterUrl ? (
                          <img className="uploads-thumb" src={item.posterUrl} alt="" />
                        ) : (
                          <div className="uploads-thumb" style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 10 }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                          </div>
                        )}
                        <div className="uploads-meta">
                          <span className="uploads-title">{item.title}</span>
                          <span className="uploads-date">{item.createdAt ? fmtDate(item.createdAt) : ""}</span>
                        </div>
                      </div>
                      <span className="uploads-type">{item.contentType === "movie" ? "Movie" : "Series"}</span>
                      <span className={`uploads-status status-${item.status?.toLowerCase() || "draft"}`}>{item.status}</span>
                      <div className="uploads-actions">
                        <button title="Edit" onClick={(e) => { e.stopPropagation(); setNav(item.contentType === "movie" ? "movies" : "tvshows"); }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        );
        case "movies":
        return <MoviesPage routeParams={routeParams} />;
      case "tvshows":
        return <TVShowsPage routeParams={routeParams} />;
      case "categories":
        return <CategoriesPage routeParams={routeParams} />;
      case "types":
        return <TypesPage routeParams={routeParams} />;
      case "genres":
        return <GenresPage routeParams={routeParams} />;
      case "users":
        return <UsersPage routeParams={routeParams} />;
      case "schedule":
        return <SchedulePage routeParams={routeParams} />;
      case "settings":
        return <SettingsPage routeParams={routeParams} />;
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
          <span>Stream<span>Admin</span></span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`sidebar-link${activeNav === item.id ? " active" : ""}`}
              onClick={() => setNav(item.id)}
            >
              {item.icon}
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="sidebar-link" onClick={() => setNav("settings")}>
            <Svg><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></Svg>
            <span className="sidebar-label">Settings</span>
          </button>
          <button className="sidebar-link" onClick={handleLogout}>
            <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Svg>
            <span className="sidebar-label">Sign Out</span>
          </button>
        </div>
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
            <button className="topbar-btn" title="Go to Settings" onClick={() => setNav("settings")}>
              <Svg><circle cx="12" cy="12" r="3" /><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></Svg>
            </button>
            <button className="topbar-btn logout-btn" title="Sign Out" onClick={handleLogout}>
              <Svg><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></Svg>
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
