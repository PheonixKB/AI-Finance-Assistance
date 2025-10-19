// interface/src/SideMenu.js
import { useState, useEffect } from "react";
import { useTheme } from "@mui/material/styles";
import PermissionToggle from "./PermissionToggle";
import "./SideMenu.css";

const SideMenu = ({
  onLogout,
  onToggleDarkMode,
  permissions,
  onPermissionChange,
  onNewChat,
  onSelectSession,
  sessions = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const theme = useTheme();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  const menuStyle = {
    backgroundColor: theme.palette.mode === "dark" ? "#121212" : "#ffffff",
    color: theme.palette.mode === "dark" ? "#f5f5f5" : "#222",
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 0 10px rgba(255,255,255,0.2)"
        : "0 0 10px rgba(0,0,0,0.2)",
  };

  const buttonStyle = {
    backgroundColor: theme.palette.mode === "dark" ? "#1e1e1e" : "#f4f4f4",
    color: theme.palette.text.primary,
    border: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    cursor: "pointer",
    marginBottom: "10px",
    width: "100%",
    textAlign: "left",
  };

  return (
    <>
      {/* Hamburger Icon */}
      <div className="hamburger" onClick={toggleMenu}>
        &#9776;
      </div>

      {/* Overlay */}
      {isOpen && <div className="overlay" onClick={closeMenu}></div>}

      {/* Side Menu */}
      <div className={`side-menu ${isOpen ? "show" : ""}`} style={menuStyle}>
        <button style={buttonStyle} onClick={() => { onNewChat(); closeMenu(); }}>
          ➕ New Chat
        </button>

        {/* Chat Sessions */}
        <div style={{ marginBottom: "20px" }}>
          <h4 style={{ marginLeft: "10px" }}>Your Chats</h4>
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <button
                key={s.id}
                style={buttonStyle}
                onClick={() => { onSelectSession(s.id); closeMenu(); }}
              >
                💬 {s.title}
              </button>
            ))
          ) : (
            <p style={{ marginLeft: "10px" }}>No chats yet</p>
          )}
        </div>

        <PermissionToggle permissions={permissions} onChange={onPermissionChange} />

        <button style={buttonStyle} onClick={() => { onToggleDarkMode(); closeMenu(); }}>
          🌗 Toggle Theme
        </button>

        <button style={buttonStyle} onClick={() => { onLogout(); closeMenu(); }}>
          🚪 Logout
        </button>
      </div>
    </>
  );
};

export default SideMenu;
