// components/Layout.js
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/",          icon: "⚡", label: "Dashboard",      end: true  },
  { to: "/xray",      icon: "🫁", label: "X-Ray Analysis", end: false },
  { to: "/chat",      icon: "💬", label: "AI Chatbot",     end: false },
  { to: "/history",   icon: "🕐", label: "History",        end: false },
  { to: "/federated", icon: "🔗", label: "Federated",      end: false },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate("/login"); };

  return (
    <div style={s.shell}>
      <aside style={s.sidebar}>
        {/* Logo */}
        <div style={s.logo}>
          <div style={s.logoIcon}>🧠</div>
          <div>
            <div style={s.logoText}>MedAI</div>
            <div style={s.logoSub}>Diagnostic AI</div>
          </div>
        </div>

        {/* Nav links */}
        <nav style={s.nav}>
          {NAV.map(({ to, icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              style={({ isActive }) => ({
                ...s.navItem,
                ...(isActive ? s.navActive : {}),
              })}
            >
              {({ isActive }) => (
                <>
                  <span style={s.navIcon}>{icon}</span>
                  <span style={{ color: isActive ? "var(--text)" : "var(--text2)" }}>
                    {label}
                  </span>
                  {isActive && <div style={s.indicator} />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div style={s.userSection}>
          <div style={s.userCard}>
            <div style={s.avatar}>
              {user?.email?.[0]?.toUpperCase() ?? "U"}
            </div>
            <div style={{ flex: 1, overflow: "hidden" }}>
              <div style={s.userEmail} className="truncate">
                {user?.email ?? "User"}
              </div>
              <div style={s.userRole}>Clinician</div>
            </div>
            <button onClick={handleLogout} style={s.logoutBtn} title="Logout">
              ↩
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        <Outlet />
      </main>
    </div>
  );
}

const s = {
  shell: {
    display: "flex", height: "100vh", overflow: "hidden",
    background: "var(--bg)",
  },
  sidebar: {
    width: 220, flexShrink: 0,
    background: "var(--bg2)",
    borderRight: "1px solid var(--border)",
    display: "flex", flexDirection: "column",
    padding: "24px 0",
  },
  logo: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "0 20px 24px",
    borderBottom: "1px solid var(--border)",
    marginBottom: 16,
  },
  logoIcon: {
    width: 34, height: 34, borderRadius: 9,
    background: "rgba(0,212,255,0.08)",
    border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 16,
  },
  logoText: {
    fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14,
    color: "var(--text)", letterSpacing: "0.02em",
  },
  logoSub: {
    fontFamily: "var(--font-mono)", fontSize: 10,
    color: "var(--accent)", letterSpacing: "0.08em",
  },
  nav: {
    flex: 1, padding: "0 12px",
    display: "flex", flexDirection: "column", gap: 2,
  },
  navItem: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "9px 12px", borderRadius: 8,
    textDecoration: "none", fontSize: 13, fontWeight: 500,
    position: "relative", transition: "background 0.15s",
    color: "var(--text2)",
  },
  navActive: { background: "rgba(0,212,255,0.07)" },
  navIcon: { fontSize: 14, width: 18, textAlign: "center" },
  indicator: {
    position: "absolute", right: 0, top: "50%",
    transform: "translateY(-50%)",
    width: 3, height: 18, borderRadius: "2px 0 0 2px",
    background: "var(--accent)",
  },
  userSection: {
    padding: "16px 12px 0",
    borderTop: "1px solid var(--border)", marginTop: 8,
  },
  userCard: {
    display: "flex", alignItems: "center", gap: 10,
    padding: "10px", borderRadius: 8,
    background: "var(--bg3)",
  },
  avatar: {
    width: 30, height: 30, borderRadius: 8,
    background: "linear-gradient(135deg, var(--accent2), var(--accent))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13,
    color: "var(--bg)", flexShrink: 0,
  },
  userEmail: { fontSize: 11, fontWeight: 600, color: "var(--text)" },
  userRole:  { fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" },
  logoutBtn: {
    background: "none", border: "none", cursor: "pointer",
    padding: 4, borderRadius: 4, flexShrink: 0,
    color: "var(--text3)", fontSize: 15,
  },
  main: { flex: 1, overflow: "auto", padding: "32px 36px" },
};