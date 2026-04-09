// pages/HistoryPage.js
// Reads scan history stored locally by XrayPage after each prediction.
// If your backend has a /history endpoint (like the polished version), swap
// the loadHistory() function to fetch from API instead.

import { useState, useEffect } from "react";

export default function HistoryPage() {
  const [records, setRecords] = useState([]);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("all");

  const loadHistory = () => {
    const stored = JSON.parse(localStorage.getItem("scanHistory") || "[]");
    setRecords(stored);
  };

  useEffect(() => { loadHistory(); }, []);

  const deleteRecord = (id) => {
    const updated = records.filter(r => r.id !== id);
    setRecords(updated);
    localStorage.setItem("scanHistory", JSON.stringify(updated));
  };

  const clearAll = () => {
    localStorage.removeItem("scanHistory");
    setRecords([]);
  };

  const filtered = records.filter(r => {
    const matchSearch = r.filename.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === "all" ||
      (filter === "normal"   && r.label === "No Finding") ||
      (filter === "abnormal" && r.label !== "No Finding");
    return matchSearch && matchFilter;
  });

  const isNormal = (label) => label === "No Finding";

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Scan History</h1>
          <p style={s.subtitle}>{records.length} total scan{records.length !== 1 ? "s" : ""}</p>
        </div>
        {records.length > 0 && (
          <button onClick={clearAll} style={s.clearBtn}>🗑 Clear All</button>
        )}
      </div>

      {/* Toolbar */}
      <div style={s.toolbar}>
        <div style={s.searchWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.search}
            placeholder="Search by filename..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div style={s.filters}>
          {["all", "normal", "abnormal"].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{ ...s.filterBtn, ...(filter === f ? s.filterActive : {}) }}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div style={s.table}>
        <div style={s.thead}>
          {["#", "Filename", "Result", "Confidence", "Date", ""].map((h, i) => (
            <div key={i} style={s.th}>{h}</div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div style={s.empty}>
            {records.length === 0
              ? "No scans yet. Analyse an X-ray to see history here."
              : "No records match your search."}
          </div>
        ) : (
          filtered.map((r, idx) => (
            <div key={r.id} style={s.row}>
              <div style={{ ...s.td, color: "var(--text3)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
                {idx + 1}
              </div>
              <div style={s.td} className="truncate" title={r.filename}>
                {r.filename}
              </div>
              <div style={s.td}>
                <span style={{
                  ...s.badge,
                  background: isNormal(r.label) ? "rgba(0,229,160,0.1)" : "rgba(255,77,106,0.1)",
                  color:      isNormal(r.label) ? "var(--green)" : "var(--red)",
                  border:     `1px solid ${isNormal(r.label) ? "rgba(0,229,160,0.3)" : "rgba(255,77,106,0.3)"}`,
                }}>
                  {isNormal(r.label) ? "✓" : "⚠"} {r.label}
                </span>
              </div>
              <div style={{ ...s.td, fontFamily: "var(--font-mono)", fontSize: 13 }}>
                <div style={s.miniBar}>
                  <div style={{
                    ...s.miniFill,
                    width: `${r.confidence * 100}%`,
                    background: isNormal(r.label) ? "var(--green)" : "var(--red)",
                  }} />
                </div>
                {(r.confidence * 100).toFixed(1)}%
              </div>
              <div style={{ ...s.td, color: "var(--text3)", fontSize: 12 }}>
                {new Date(r.date).toLocaleString()}
              </div>
              <div style={s.td}>
                <button onClick={() => deleteRecord(r.id)} style={s.deleteBtn} title="Delete">
                  🗑
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const s = {
  header:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 },
  title:    { fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 4 },
  subtitle: { color: "var(--text2)", fontSize: 14 },
  clearBtn: {
    padding: "7px 14px", borderRadius: 8, border: "1px solid rgba(255,77,106,0.3)",
    background: "rgba(255,77,106,0.08)", color: "var(--red)", fontSize: 12,
    fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
  },
  toolbar:    { display: "flex", gap: 12, marginBottom: 20, alignItems: "center" },
  searchWrap: { position: "relative", flex: 1 },
  searchIcon: { position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13 },
  search: {
    width: "100%", padding: "9px 12px 9px 36px",
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--text)", fontSize: 13,
    fontFamily: "var(--font-body)", outline: "none", boxSizing: "border-box",
  },
  filters:    { display: "flex", gap: 6 },
  filterBtn: {
    padding: "7px 14px", borderRadius: 7, border: "1px solid var(--border)",
    background: "var(--card)", color: "var(--text2)", fontSize: 12,
    fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
  },
  filterActive: { background: "rgba(0,212,255,0.1)", borderColor: "rgba(0,212,255,0.3)", color: "var(--accent)" },
  table: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", overflow: "hidden",
  },
  thead: {
    display: "grid", gridTemplateColumns: "40px 2fr 1.5fr 1fr 1.5fr 44px",
    padding: "10px 16px", borderBottom: "1px solid var(--border)",
  },
  th: { fontSize: 11, fontWeight: 600, color: "var(--text3)", textTransform: "uppercase", letterSpacing: "0.06em" },
  row: {
    display: "grid", gridTemplateColumns: "40px 2fr 1.5fr 1fr 1.5fr 44px",
    padding: "12px 16px", borderBottom: "1px solid var(--border)",
    alignItems: "center", transition: "background 0.1s",
  },
  td:        { fontSize: 13, color: "var(--text)", display: "flex", alignItems: "center", gap: 6 },
  badge:     { display: "flex", alignItems: "center", gap: 5, padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600 },
  miniBar:   { width: 40, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden", marginRight: 6 },
  miniFill:  { height: "100%", borderRadius: 2, transition: "width 0.3s" },
  deleteBtn: { background: "none", border: "none", cursor: "pointer", color: "var(--text3)", padding: 4, borderRadius: 4, fontSize: 13 },
  empty:     { padding: 48, textAlign: "center", color: "var(--text2)", fontSize: 14 },
};