// App.js
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout       from "./components/Layout";
import LoginPage    from "./pages/LoginPage";
import SignupPage   from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import XrayPage     from "./pages/XrayPage";
import ChatPage     from "./pages/ChatPage";
import HistoryPage  from "./pages/HistoryPage";
import FederatedPage from "./pages/FederatedPage";
import "./styles/global.css";

function PrivateRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      height: "100vh", color: "var(--accent)", fontFamily: "var(--font-mono)", fontSize: 13
    }}>
      initializing...
    </div>
  );
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return null;
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login"  element={<PublicRoute><LoginPage  /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

        <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
          <Route index            element={<DashboardPage />} />
          <Route path="xray"      element={<XrayPage />} />
          <Route path="chat"      element={<ChatPage />} />
          <Route path="history"   element={<HistoryPage />} />
          <Route path="federated" element={<FederatedPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}