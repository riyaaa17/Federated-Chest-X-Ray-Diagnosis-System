// pages/SignupPage.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function SignupPage() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);
  const { signup } = useAuth();
  const navigate   = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      await signup(email, password);
      setSuccess(true);
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div className="bg-grid" />
      <div style={s.card} className="fade-up">
        <div style={s.header}>
          <div style={s.logoIcon}>🧠</div>
          <h1 style={s.title}>Create Account</h1>
          <p style={s.subtitle}>Join the MedAI clinical platform</p>
        </div>

        {error   && <div style={s.errorBox}>⚠ {error}</div>}
        {success && (
          <div style={s.successBox}>✓ Account created! Redirecting...</div>
        )}

        <form onSubmit={handleSignup} style={s.form}>
          {[
            { label: "Email",            type: "email",    value: email,    set: setEmail,    ph: "doctor@hospital.com" },
            { label: "Password",         type: "password", value: password, set: setPassword, ph: "••••••••" },
            { label: "Confirm Password", type: "password", value: confirm,  set: setConfirm,  ph: "••••••••" },
          ].map(({ label, type, value, set, ph }) => (
            <div key={label} style={s.field}>
              <label style={s.label}>{label}</label>
              <input
                style={s.input}
                type={type} placeholder={ph}
                value={value}
                onChange={e => set(e.target.value)}
                required
              />
            </div>
          ))}

          <button type="submit" style={s.btn} disabled={loading || success}>
            {loading ? <span style={s.spinner} /> : "Create Account"}
          </button>
        </form>

        <p style={s.footer}>
          Already have an account?{" "}
          <Link to="/login" style={s.link}>Sign in</Link>
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
  successBox: {
    display: "flex", alignItems: "center", gap: 8,
    background: "rgba(0,229,160,0.1)", border: "1px solid rgba(0,229,160,0.3)",
    borderRadius: 8, padding: "10px 14px",
    color: "var(--green)", fontSize: 13, marginBottom: 16,
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
  btn: {
    marginTop: 4, padding: 12,
    background: "var(--accent)", border: "none", borderRadius: 8,
    color: "var(--bg)", fontFamily: "var(--font-head)", fontWeight: 700,
    fontSize: 14, cursor: "pointer", letterSpacing: "0.04em",
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  spinner: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--bg)",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  footer: { textAlign: "center", marginTop: 24, fontSize: 13, color: "var(--text2)" },
  link:   { color: "var(--accent)", textDecoration: "none", fontWeight: 600 },
};