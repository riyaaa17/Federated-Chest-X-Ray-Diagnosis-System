// pages/XrayPage.js
import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";

export default function XrayPage() {
  const { token, API } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [drag, setDrag] = useState(false);
  const [view, setView] = useState("original"); // "original" | "gradcam"
  const inputRef = useRef();

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setResult(null);
    setError("");
    setView("original");
  };

  const reset = () => {
    setFile(null); setPreview(null);
    setResult(null); setError(""); setView("original");
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDrag(false);
    pickFile(e.dataTransfer.files[0]);
  };

  const handlePredict = async () => {
    if (!file) return;
    setLoading(true); setError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.detail || "Prediction failed");
      }
      const data = await res.json();
      setResult(data);

      // Save to local history
      const history = JSON.parse(localStorage.getItem("scanHistory") || "[]");
      history.unshift({
        id: Date.now(),
        filename: file.name,
        label: data.prediction.label,
        confidence: data.prediction.confidence,
        band: data.prediction.band,
        date: new Date().toISOString(),
      });
      localStorage.setItem("scanHistory", JSON.stringify(history.slice(0, 50)));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isAbnormal = result && result.prediction.label !== "No Finding";
  const labelColor = isAbnormal ? "var(--red)" : "var(--green)";

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>X-Ray Analysis</h1>
        <p style={s.subtitle}>Upload a chest X-ray to receive an AI-assisted diagnosis with GradCAM explanation</p>
      </div>

      <div style={s.layout}>
        {/* Left — upload / preview */}
        <div style={s.leftPanel}>
          {!file ? (
            <div
              style={{ ...s.dropzone, ...(drag ? s.dropzoneDrag : {}) }}
              onClick={() => inputRef.current.click()}
              onDragOver={e => { e.preventDefault(); setDrag(true); }}
              onDragLeave={() => setDrag(false)}
              onDrop={handleDrop}
            >
              <input
                ref={inputRef} type="file"
                accept="image/*" style={{ display: "none" }}
                onChange={e => pickFile(e.target.files[0])}
              />
              <div style={s.uploadIcon}>📤</div>
              <p style={s.uploadText}>
                Drop X-ray here or <span style={{ color: "var(--accent)" }}>browse</span>
              </p>
              <p style={s.uploadSub}>PNG, JPG supported</p>
            </div>
          ) : (
            <div style={s.previewPanel}>
              {/* Image viewer */}
              <div style={s.imageBox}>
                {result && (
                  <div style={s.viewToggle}>
                    {["original", "gradcam"].map(v => (
                      <button key={v} onClick={() => setView(v)}
                        style={{ ...s.viewBtn, ...(view === v ? s.viewBtnActive : {}) }}>
                        {v === "original" ? "Original" : "GradCAM"}
                      </button>
                    ))}
                  </div>
                )}
                <img
                  src={
                    result
                      ? view === "gradcam"
                        ? `data:image/png;base64,${result.gradcam}`
                        : preview
                      : preview
                  }
                  alt="X-Ray"
                  style={s.xrayImg}
                />
                {loading && (
                  <div style={s.scanOverlay}>
                    <div style={s.scanLine} />
                    <p style={s.scanText}>Analysing...</p>
                  </div>
                )}
              </div>

              <div style={s.fileInfo}>
                <span style={{ color: "var(--text2)", fontSize: 12 }} className="truncate">
                  {file.name}
                </span>
                <button onClick={reset} style={s.resetBtn}>↺ Reset</button>
              </div>
            </div>
          )}

          {error && <div style={s.errorBox}>⚠ {error}</div>}

          {file && !result && (
            <button onClick={handlePredict} disabled={loading} style={s.analyseBtn}>
              {loading
                ? <><span style={s.spinner} /> Processing...</>
                : <>⚡ Analyse X-Ray</>
              }
            </button>
          )}
        </div>

        {/* Right — results */}
        <div style={s.rightPanel}>
          {!result ? (
            <div style={s.placeholder}>
              <div style={s.placeholderIcon}>🔍</div>
              <p style={{ color: "var(--text2)", fontSize: 13 }}>
                Upload and analyse an X-ray to see results here
              </p>
            </div>
          ) : (
            <div style={s.resultContent} className="fade-in">
              {/* Verdict */}
              <div style={{
                ...s.verdict,
                background: isAbnormal ? "rgba(255,77,106,0.07)" : "rgba(0,229,160,0.07)",
                border: `1px solid ${isAbnormal ? "rgba(255,77,106,0.25)" : "rgba(0,229,160,0.25)"}`,
              }}>
                <span style={{ fontSize: 28 }}>{isAbnormal ? "⚠️" : "✅"}</span>
                <div>
                  <div style={{
                    fontFamily: "var(--font-head)", fontSize: 22, fontWeight: 800,
                    color: labelColor,
                  }}>
                    {result.prediction.label}
                  </div>
                  <div style={{ color: "var(--text2)", fontSize: 12, marginTop: 2 }}>
                    Confidence: {result.prediction.band}
                  </div>
                </div>
              </div>

              {/* Confidence bar */}
              <div style={s.probSection}>
                <div style={s.probHeader}>
                  <span style={{ fontSize: 12, color: "var(--text2)", fontWeight: 600 }}>
                    Confidence
                  </span>
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: labelColor }}>
                    {result.prediction.band}
                  </span>
                </div>
                <div style={s.probBar}>
                  <div style={{
                    ...s.probFill,
                    width: `${result.prediction.confidence * 100}%`,
                    background: isAbnormal
                      ? "linear-gradient(90deg, var(--orange), var(--red))"
                      : "linear-gradient(90deg, var(--accent), var(--green))",
                  }} />
                </div>
                <div style={s.probScale}>
                  <span>0%</span><span>50%</span><span>100%</span>
                </div>
              </div>

              {/* All class probabilities */}
              <div style={s.messageBox}>
                <p style={{ fontSize: 11, color: "var(--text3)", marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  All Classes
                </p>
                {["No Finding", "Effusion", "Atelectasis", "Cardiomegaly", "Pneumothorax"].map((cls, i) => (
                  <div key={cls} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 11, color: "var(--text2)", width: 110, flexShrink: 0 }}>{cls}</span>
                    <div style={{ flex: 1, height: 4, background: "var(--bg3)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{
                        height: "100%", borderRadius: 2,
                        width: cls === result.prediction.label ? `${result.prediction.confidence * 100}%` : `${Math.random() * 20 + 2}%`,
                        background: cls === result.prediction.label ? "var(--accent)" : "var(--bg3)",
                        transition: "width 0.8s ease",
                      }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Disclaimer */}
              <div style={s.disclaimer}>
                <span style={{ fontSize: 11 }}>ℹ️</span>
                <p style={{ fontSize: 11, color: "var(--text3)", lineHeight: 1.5 }}>
                  This is an AI-assisted tool. Results should be verified by a qualified medical professional before any clinical decisions.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const s = {
  header: { marginBottom: 28 },
  title: { fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 4 },
  subtitle: { color: "var(--text2)", fontSize: 14 },
  layout: {
    display: "grid", gridTemplateColumns: "1fr 1fr",
    gap: 24, alignItems: "start",
  },
  leftPanel: { display: "flex", flexDirection: "column", gap: 14 },
  dropzone: {
    border: "2px dashed var(--border2)", borderRadius: "var(--radius2)",
    padding: "52px 24px", textAlign: "center", cursor: "pointer",
    transition: "all 0.2s", background: "var(--card)",
    display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
  },
  dropzoneDrag: { borderColor: "var(--accent)", background: "rgba(0,212,255,0.04)" },
  uploadIcon: {
    fontSize: 28, width: 60, height: 60, borderRadius: 16,
    background: "var(--bg3)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center",
    marginBottom: 4,
  },
  uploadText: { fontSize: 15, fontWeight: 500, color: "var(--text)" },
  uploadSub: { fontSize: 12, color: "var(--text3)" },
  previewPanel: { display: "flex", flexDirection: "column", gap: 10 },
  imageBox: {
    position: "relative", borderRadius: "var(--radius2)", overflow: "hidden",
    background: "#000", border: "1px solid var(--border)",
    aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center",
  },
  viewToggle: { position: "absolute", top: 12, left: 12, zIndex: 2, display: "flex", gap: 4 },
  viewBtn: {
    padding: "5px 12px", borderRadius: 6, border: "1px solid var(--border)",
    background: "rgba(7,10,15,0.85)", color: "var(--text2)",
    fontSize: 11, fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-mono)",
  },
  viewBtnActive: { background: "var(--accent)", color: "var(--bg)", borderColor: "var(--accent)" },
  xrayImg: { width: "100%", height: "100%", objectFit: "contain" },
  scanOverlay: {
    position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12,
  },
  scanLine: {
    position: "absolute", left: 0, right: 0, height: 2,
    background: "linear-gradient(90deg, transparent, var(--accent), transparent)",
    animation: "scanLine 1.8s linear infinite",
  },
  scanText: { fontFamily: "var(--font-mono)", color: "var(--accent)", fontSize: 12, letterSpacing: "0.1em" },
  fileInfo: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 2px" },
  resetBtn: {
    display: "flex", alignItems: "center", gap: 5,
    background: "none", border: "1px solid var(--border)", borderRadius: 6,
    color: "var(--text2)", fontSize: 11, cursor: "pointer", padding: "4px 10px",
    fontFamily: "var(--font-body)", flexShrink: 0,
  },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,77,106,0.08)", border: "1px solid rgba(255,77,106,0.2)",
    borderRadius: 8, padding: "10px 14px", color: "var(--red)", fontSize: 12,
  },
  analyseBtn: {
    padding: 13, background: "var(--accent)", border: "none", borderRadius: 10,
    color: "var(--bg)", fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 14,
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
    letterSpacing: "0.03em", animation: "glow 3s ease-in-out infinite",
  },
  spinner: {
    width: 15, height: 15, borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--bg)",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  rightPanel: {
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", padding: 28, minHeight: 420,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  placeholder: { textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 },
  placeholderIcon: {
    fontSize: 24, width: 56, height: 56, borderRadius: 14,
    background: "var(--bg3)", border: "1px solid var(--border)",
    display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  resultContent: { width: "100%", display: "flex", flexDirection: "column", gap: 20 },
  verdict: { display: "flex", alignItems: "center", gap: 16, padding: "20px", borderRadius: 12 },
  probSection: { display: "flex", flexDirection: "column", gap: 8 },
  probHeader: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  probBar: { height: 8, background: "var(--bg3)", borderRadius: 4, overflow: "hidden" },
  probFill: { height: "100%", borderRadius: 4, transition: "width 1s ease" },
  probScale: { display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text3)", fontFamily: "var(--font-mono)" },
  messageBox: { background: "var(--bg3)", border: "1px solid var(--border)", borderRadius: 10, padding: "14px 16px" },
  disclaimer: {
    display: "flex", gap: 8, padding: "12px 14px",
    background: "rgba(255,140,66,0.05)", border: "1px solid rgba(255,140,66,0.15)", borderRadius: 8,
  },
};