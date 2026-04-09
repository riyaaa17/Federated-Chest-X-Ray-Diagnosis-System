// pages/FederatedPage.js
import { useState } from "react";

// Static federated learning round data
const ROUNDS = [
  { round: 1, auc: 0.71, loss: 0.58, samples: 1200 },
  { round: 2, auc: 0.76, loss: 0.49, samples: 1200 },
  { round: 3, auc: 0.80, loss: 0.43, samples: 1200 },
  { round: 4, auc: 0.83, loss: 0.38, samples: 1200 },
  { round: 5, auc: 0.86, loss: 0.34, samples: 1200 },
];

const HOSPITALS = [
  { name: "City General",  patients: 480, color: "var(--accent)",  privacy: "ε=0.8" },
  { name: "St. Mary's",    patients: 360, color: "var(--green)",   privacy: "ε=1.0" },
  { name: "Regional Med",  patients: 360, color: "var(--orange)",  privacy: "ε=0.9" },
];

const PROPS = [
  {
    icon: "🔐",
    title: "Data Privacy",
    color: "var(--green)",
    desc: "Raw patient data never leaves the hospital. Only model gradients are shared with the aggregation server.",
  },
  {
    icon: "🌐",
    title: "Distributed Training",
    color: "var(--accent)",
    desc: "Each hospital trains locally on its own dataset. Updates are averaged using FedAvg aggregation.",
  },
  {
    icon: "📈",
    title: "Continuous Improvement",
    color: "var(--orange)",
    desc: "The global model improves with each round, benefiting all participating hospitals.",
  },
];

const maxAuc = Math.max(...ROUNDS.map(r => r.auc));

export default function FederatedPage() {
  const [activeRound,   setActiveRound]   = useState(5);
  const [simulating,    setSimulating]    = useState(false);
  const [simProgress,   setSimProgress]   = useState(100);

  const runSimulation = () => {
    setSimulating(true);
    setSimProgress(0);
    setActiveRound(1);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setSimProgress((step / ROUNDS.length) * 100);
      setActiveRound(step);
      if (step >= ROUNDS.length) {
        clearInterval(interval);
        setSimulating(false);
      }
    }, 700);
  };

  const activeData = ROUNDS.find(r => r.round === activeRound) || ROUNDS[4];

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <div>
          <h1 style={s.title}>Federated Learning</h1>
          <p style={s.subtitle}>Collaborative AI training across hospitals — without sharing patient data</p>
        </div>
        <button onClick={runSimulation} disabled={simulating} style={s.simBtn}>
          {simulating
            ? <><span style={s.spinner} /> Simulating...</>
            : <>▶ Run Simulation</>
          }
        </button>
      </div>

      {/* Architecture diagram */}
      <div style={s.diagram}>
        {/* Central server */}
        <div style={s.serverCol}>
          <div style={s.serverCard}>
            <div style={s.serverIcon}>🖥️</div>
            <div style={s.serverName}>Global Server</div>
            <div style={s.serverSub}>FedAvg Aggregator</div>
            <div style={s.serverBadge}>Round {activeRound}/5</div>
          </div>
          <div style={{ fontSize: 12, color: "var(--text3)", textAlign: "center", lineHeight: 1.5 }}>
            <div style={{ color: activeData.auc >= 0.83 ? "var(--green)" : "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700 }}>
              {activeData.auc.toFixed(2)}
            </div>
            <div>AUC Score</div>
            <div style={{ marginTop: 4, fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text3)" }}>
              Loss: {activeData.loss.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Hospitals */}
        <div style={s.hospitalsCol}>
          {HOSPITALS.map((h, i) => (
            <div key={h.name} style={s.hospitalRow}>
              <div style={{ ...s.arrowWrap }}>
                <div style={{
                  ...s.arrow,
                  color: h.color, opacity: simulating ? 1 : 0.4,
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: h.color }}>
                    gradients ⟶
                  </div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text3)" }}>
                    ⟵ model update
                  </div>
                </div>
              </div>
              <div style={{
                ...s.hospitalCard,
                borderColor: simulating ? h.color : "var(--border)",
                boxShadow: simulating ? `0 0 12px ${h.color}20` : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ ...s.hospitalIcon, background: `${h.color}15`, border: `1px solid ${h.color}30` }}>
                    🏥
                  </div>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{h.name}</div>
                    <div style={{ fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" }}>
                      {h.patients} scans
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{
                    fontSize: 10, padding: "2px 8px", borderRadius: 20,
                    border: `1px solid ${h.color}40`, color: h.color,
                    fontFamily: "var(--font-mono)",
                  }}>
                    🔒 {h.privacy}
                  </span>
                  {simulating && (
                    <div style={{ width: 60, height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${simProgress}%`, background: h.color, borderRadius: 2, transition: "width 0.5s" }} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Properties */}
      <div style={s.propsGrid}>
        {PROPS.map(p => (
          <div key={p.title} style={s.propCard}>
            <div style={{ ...s.propIcon, background: `${p.color}15`, border: `1px solid ${p.color}30` }}>
              <span style={{ fontSize: 16 }}>{p.icon}</span>
            </div>
            <div style={s.propTitle}>{p.title}</div>
            <div style={s.propDesc}>{p.desc}</div>
          </div>
        ))}
      </div>

      {/* Training rounds */}
      <div style={s.resultsCard}>
        <div style={s.resultsTitle}>Training Rounds — Click to Inspect</div>
        <div style={s.roundsGrid}>
          {ROUNDS.map(r => (
            <div
              key={r.round}
              onClick={() => setActiveRound(r.round)}
              style={{
                ...s.roundCard,
                borderColor: activeRound === r.round ? "var(--accent)" : "var(--border)",
                background:  activeRound === r.round ? "rgba(0,212,255,0.05)" : "var(--bg3)",
                cursor: "pointer",
              }}
            >
              <div style={s.roundNum}>Round {r.round}</div>
              <div style={{ ...s.roundAuc, color: r.auc >= 0.83 ? "var(--green)" : "var(--accent)" }}>
                {r.auc.toFixed(2)}
              </div>
              <div style={s.roundLabel}>AUC</div>
              <div style={s.roundBar}>
                <div style={{
                  ...s.roundFill,
                  height: `${(r.auc / maxAuc) * 100}%`,
                  background: r.auc >= 0.83 ? "var(--green)" : "var(--accent)",
                }} />
              </div>
              {activeRound === r.round && (
                <div style={s.roundDetail}>
                  Loss: <span style={{ color: "var(--orange)", fontFamily: "var(--font-mono)" }}>{r.loss.toFixed(2)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div style={s.fedNote}>
          <span>🛡️</span>
          <span>
            Model improved from AUC 0.71 → 0.86 over 5 rounds without any hospital sharing raw patient data.
          </span>
        </div>
      </div>
    </div>
  );
}

const s = {
  header:   { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 },
  title:    { fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 4 },
  subtitle: { color: "var(--text2)", fontSize: 14 },
  simBtn: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.3)",
    borderRadius: 8, color: "var(--accent)", padding: "9px 16px",
    fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-body)",
  },
  spinner: {
    width: 13, height: 13, borderRadius: "50%",
    border: "2px solid rgba(0,212,255,0.3)", borderTopColor: "var(--accent)",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  diagram: {
    display: "grid", gridTemplateColumns: "180px 1fr",
    gap: 0, background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", padding: 28, marginBottom: 20, alignItems: "center",
  },
  serverCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  serverCard: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: 14, padding: "18px", textAlign: "center", width: "100%",
  },
  serverIcon: {
    fontSize: 22, width: 46, height: 46, borderRadius: 12,
    background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px",
  },
  serverName:  { fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14, marginBottom: 3 },
  serverSub:   { fontSize: 11, color: "var(--text3)", marginBottom: 10 },
  serverBadge: {
    display: "inline-block", padding: "3px 10px", borderRadius: 20,
    background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
    fontSize: 10, color: "var(--accent)", fontFamily: "var(--font-mono)",
  },
  hospitalsCol: { display: "flex", flexDirection: "column", gap: 14, paddingLeft: 16 },
  hospitalRow:  { display: "grid", gridTemplateColumns: "1fr 1.4fr", alignItems: "center", gap: 0 },
  arrowWrap: { display: "flex", alignItems: "center", justifyContent: "center" },
  arrow: { display: "flex", flexDirection: "column", alignItems: "center", gap: 3 },
  hospitalCard: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: 10, padding: "12px 14px",
    display: "flex", flexDirection: "column", gap: 8, transition: "all 0.4s",
  },
  hospitalIcon: { width: 30, height: 30, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 },
  propsGrid: { display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 20 },
  propCard:  { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 14, padding: "18px" },
  propIcon:  { width: 34, height: 34, borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12 },
  propTitle: { fontFamily: "var(--font-head)", fontSize: 13, fontWeight: 700, marginBottom: 6 },
  propDesc:  { fontSize: 12, color: "var(--text2)", lineHeight: 1.6 },
  resultsCard:  { background: "var(--card)", border: "1px solid var(--border)", borderRadius: "var(--radius2)", padding: "24px" },
  resultsTitle: { fontFamily: "var(--font-head)", fontSize: 15, fontWeight: 700, marginBottom: 20 },
  roundsGrid:   { display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12, marginBottom: 16 },
  roundCard: {
    border: "1px solid", borderRadius: 10, padding: "14px 12px", textAlign: "center",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 4, transition: "all 0.2s",
  },
  roundNum:   { fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" },
  roundAuc:   { fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800 },
  roundLabel: { fontSize: 10, color: "var(--text3)" },
  roundBar:   { width: "100%", height: 40, background: "var(--bg)", borderRadius: 4, overflow: "hidden", display: "flex", alignItems: "flex-end", marginTop: 6 },
  roundFill:  { width: "100%", borderRadius: 4, transition: "height 0.5s ease" },
  roundDetail:{ fontSize: 11, color: "var(--text2)", marginTop: 2 },
  fedNote: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(0,229,160,0.06)", border: "1px solid rgba(0,229,160,0.15)",
    borderRadius: 8, padding: "10px 14px", fontSize: 12, color: "var(--text2)",
  },
};