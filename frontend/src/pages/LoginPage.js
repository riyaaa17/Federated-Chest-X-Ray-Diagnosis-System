// pages/LoginPage.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(err.message || "Login failed. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div className="bg-grid" />
      <div style={s.card} className="fade-up">
        {/* Header */}
        <div style={s.header}>
          <div style={s.logoIcon}>🧠</div>
          <h1 style={s.title}>MedAI</h1>
          <p style={s.subtitle}>Sign in to your diagnostic dashboard</p>
        </div>

        {error && <div style={s.errorBox}>⚠ {error}</div>}

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Email</label>
            <input
              style={s.input}
              type="email"
              placeholder="doctor@hospital.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required autoFocus
            />
          </div>

          <div style={s.field}>
            <label style={s.label}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...s.input, paddingRight: 44 }}
                type={showPw ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPw(p => !p)}
                style={s.eyeBtn}
              >
                {showPw ? "🙈" : "👁"}
              </button>
            </div>
          </div>

          <button type="submit" style={s.btn} disabled={loading}>
            {loading ? <span style={s.spinner} /> : "Sign In"}
          </button>
        </form>

        <p style={s.footer}>
          Don't have an account?{" "}
          <Link to="/signup" style={s.link}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh", display: "flex", alignItems: "center",
    justifyContent: "center", background: "var(--bg)",
    position: "relative", padding: 20,
  },
  card: {
    position: "relative", zIndex: 1,
    width: "100%", maxWidth: 400,
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", padding: "40px 36px",
    boxShadow: "var(--glow2)",
  },
  header: { textAlign: "center", marginBottom: 28 },
  logoIcon: {
    fontSize: 28, width: 52, height: 52, borderRadius: 14,
    margin: "0 auto 14px",
    background: "rgba(0,212,255,0.08)", border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  title:    { fontFamily: "var(--font-head)", fontSize: 24, fontWeight: 800, color: "var(--text)", marginBottom: 6 },
  subtitle: { color: "var(--text2)", fontSize: 13 },
  errorBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)",
    borderRadius: 8, padding: "10px 14px",
    color: "var(--red)", fontSize: 13, marginBottom: 16,
  },
  form:  { display: "flex", flexDirection: "column", gap: 16 },
  field: { display: "flex", flexDirection: "column", gap: 6 },
  label: {
    fontSize: 11, fontWeight: 600, color: "var(--text2)",
    letterSpacing: "0.06em", textTransform: "uppercase",
  },
  input: {
    width: "100%", padding: "11px 14px",
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: 8, color: "var(--text)", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none",
    boxSizing: "border-box",
  },
  eyeBtn: {
    position: "absolute", right: 12, top: "50%",
    transform: "translateY(-50%)",
    background: "none", border: "none", cursor: "pointer",
    fontSize: 14, padding: 2,
  },
  btn: {
    marginTop: 4, padding: 12,
    background: "var(--accent)", border: "none", borderRadius: 8,
    color: "var(--bg)", fontFamily: "var(--font-head)", fontWeight: 700,
    fontSize: 14, cursor: "pointer", letterSpacing: "0.04em",
    display: "flex", alignItems: "center", justifyContent: "center",
    animation: "glow 3s ease-in-out infinite",
  },
  spinner: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--bg)",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text2)" },
  link:   { color: "var(--accent)", textDecoration: "none", fontWeight: 600 },
};