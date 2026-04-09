import "../styles/sidebar.css";
import { NavLink } from "react-router-dom";

function Sidebar() {
    return (
        <div className="sidebar">
            <div className="logo">
                <div className="logo-icon">🧠</div>
                <div>
                    <div className="logo-text">MedAI</div>
                    <div className="logo-sub">Diagnostic AI</div>
                </div>
            </div>

            <nav className="nav">
                <NavLink to="/" className="nav-item">
                    X-ray Analysis
                </NavLink>

                <NavLink to="/chat" className="nav-item">
                    Chatbot
                </NavLink>

                <NavLink to="/profile" className="nav-item">
                    Profile
                </NavLink>
            </nav>
        </div>
    )
}

export default Sidebar;