// context/AuthContext.js
import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);
export const API = "http://127.0.0.1:8000";

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // On mount (or token change): verify token by calling /auth/me
  // Your backend uses a simple Authorization header, not OAuth2 form.
  // We just decode the stored token client-side to get the email,
  // or you can add a /auth/me endpoint. For now we keep your existing approach
  // but add a loading state and auto-logout on bad token.
  useEffect(() => {
    if (token) {
      fetch(`${API}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(r => {
          if (!r.ok) throw new Error("invalid");
          return r.json();
        })
        .then(data => setUser(data))
        .catch(() => {
          localStorage.removeItem("token");
          setToken(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const res = await fetch(`${API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    localStorage.setItem("token", data.access_token);
    setToken(data.access_token);
    setUser({ email });
    return data;
  };

  const signup = async (email, password) => {
    const res = await fetch(`${API}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, signup, logout, loading, API }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);