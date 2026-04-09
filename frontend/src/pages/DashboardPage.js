// pages/DashboardPage.js
// Reads scan history from localStorage (saved by XrayPage after each prediction).
// If you later add a /stats and /history backend endpoint, just swap
// the loadData() function to fetch from API instead — no other changes needed.

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function DashboardPage() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    setRecords(stored);
  }, []);

  // Compute stats
  const total     = records.length;
  const abnormal  = records.filter(r => r.label !== "No Finding").length;
  const normal    = total - abnormal;
  const rate      = total > 0 ? Math.round((abnormal / total) * 100) : 0;
  const recent    = records.slice(0, 5);

  const cards = [
    { label: "Total Scans",    value: total,        icon: "🕐", color: "var(--accent)"  },
    { label: "Abnormal",       value: abnormal,     icon: "⚠️", color: "var(--red)"     },
    { label: "Normal",         value: normal,       icon: "✅", color: "var(--green)"   },
    { label: "Detection Rate", value: `${rate}%`,   icon: "📈", color: "var(--orange)"  },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>
            {greeting},{" "}
            <span style={{ color: "var(--accent)" }}>
              {user?.email?.split("@")[0] ?? "Doctor"}
            </span>
          </h1>
          <p style={s.subtitle}>Here's your diagnostic overview</p>
        </div>
        <Link to="/" style={s.ctaBtn}>
          ⚡ New Analysis
        </Link>
      </div>

      {/* Stat cards */}
      <div style={s.statsGrid}>
        {cards.map(({ label, value, icon, color }) => (
          <div key={label} style={s.statCard}>
            <div style={{
              ...s.statIcon,
              background: `${color}15`,
              border: `1px solid ${color}30`,
            }}>
              <span style={{ fontSize: 16 }}>{icon}</span>
            </div>
            <div style={s.statValue}>{value}</div>
            <div style={s.statLabel}>{label}</div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div style={s.actionsRow}>
        {[
          { to: "/",          icon: "📤", label: "Analyse X-Ray",    desc: "Upload and diagnose a chest X-ray" },
          { to: "/chat",      icon: "💬", label: "AI Chatbot",        desc: "Ask medical questions via RAG"    },
          { to: "/history",   icon: "🕐", label: "Scan History",      desc: "Browse all past predictions"      },
          { to: "/federated", icon: "🔗", label: "Federated Learning", desc: "View distributed training results" },
        ].map(({ to, icon, label, desc }) => (
          <Link key={to} to={to} style={s.actionCard}>
            <span style={s.actionIcon}>{icon}</span>
            <div style={s.actionLabel}>{label}</div>
            <div style={s.actionDesc}>{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent scans */}
      <div style={s.section}>
        <div style={s.sectionHeader}>
          <h2 style={s.sectionTitle}>Recent Scans</h2>
          <Link to="/history" style={s.seeAll}>View all →</Link>
        </div>

        {recent.length === 0 ? (
          <div style={s.empty}>
            <span style={{ fontSize: 32 }}>📤</span>
            <p>No scans yet</p>
            <Link to="/" style={s.emptyLink}>Upload your first X-ray →</Link>
          </div>
        ) : (
          <div style={s.table}>
            <div style={s.tableHead}>
              {["Filename", "Result", "Confidence", "Date"].map(h => (
                <div key={h} style={s.th}>{h}</div>
              ))}
            </div>
            {recent.map(r => {
              const isNormal = r.label === "No Finding";
              return (
                <div key={r.id} style={s.tableRow}>
                  <div style={s.td} className="truncate">{r.filename}</div>
                  <div style={s.td}>
                    <span style={{
                      ...s.badge,
                      background: isNormal ? "rgba(0,229,160,0.12)" : "rgba(255,77,106,0.12)",
                      color:      isNormal ? "var(--green)" : "var(--red)",
                      border:     `1px solid ${isNormal ? "rgba(0,229,160,0.3)" : "rgba(255,77,106,0.3)"}`,
                    }}>
                      {isNormal ? "✓" : "⚠"} {r.label}
                    </span>
                  </div>
                  <div style={{ ...s.td, fontFamily: "var(--font-mono)", fontSize: 12 }}>
                    {(r.confidence * 100).toFixed(1)}%
                  </div>
                  <div style={{ ...s.td, color: "var(--text3)", fontSize: 12 }}>
                    {new Date(r.date).toLocaleDateString()}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  header: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 32,
  },
  title: {
    fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 4,
  },
  subtitle: { color: "var(--text2)", fontSize: 14 },
  ctaBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "var(--accent)", color: "var(--bg)",
    padding: "10px 18px", borderRadius: 8, textDecoration: "none",
    fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 13,
    letterSpacing: "0.03em",
  },
  statsGrid: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16, marginBottom: 20,
  },
  statCard: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", padding: "20px",
  },
  statIcon: {
    width: 36, height: 36, borderRadius: 9,
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 14,
  },
  statValue: {
    fontFamily: "var(--font-head)", fontSize: 28, fontWeight: 800, marginBottom: 4,
  },
  statLabel: { color: "var(--text2)", fontSize: 12, fontWeight: 500 },
  actionsRow: {
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
    gap: 14, marginBottom: 24,
  },
  actionCard: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", padding: "18px 16px",
    textDecoration: "none", display: "flex", flexDirection: "column", gap: 6,
    transition: "border-color 0.15s",
  },
  actionIcon:  { fontSize: 22, marginBottom: 2 },
  actionLabel: { fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700, color: "var(--text)" },
  actionDesc:  { fontSize: 12, color: "var(--text2)", lineHeight: 1.4 },
  section: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", padding: 24,
  },
  sectionHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    marginBottom: 20,
  },
  sectionTitle: { fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700 },
  seeAll: {
    color: "var(--accent)", fontSize: 12, textDecoration: "none", fontWeight: 600,
  },
  table:     { display: "flex", flexDirection: "column" },
  tableHead: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr",
    padding: "8px 12px", marginBottom: 4,
  },
  th: {
    fontSize: 11, fontWeight: 600, color: "var(--text3)",
    textTransform: "uppercase", letterSpacing: "0.06em",
  },
  tableRow: {
    display: "grid", gridTemplateColumns: "2fr 1.5fr 1fr 1fr",
    padding: "11px 12px", borderRadius: 8,
    borderBottom: "1px solid var(--border)", alignItems: "center",
  },
  td: {
    fontSize: 13, color: "var(--text)",
    display: "flex", alignItems: "center",
  },
  badge: {
    display: "flex", alignItems: "center", gap: 5,
    padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
  },
  empty: {
    textAlign: "center", padding: "40px 20px", color: "var(--text2)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
  },
  emptyLink: { color: "var(--accent)", textDecoration: "none", fontSize: 13, fontWeight: 600 },
};