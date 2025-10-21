// interface/src/SideMenu.js
import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Collapse,
  TextField,
} from "@mui/material";
import {
  Add,
  Chat,
  DarkMode,
  LightMode,
  Logout,
  ChevronLeft,
  ChevronRight,
  ExpandMore,
  ExpandLess,
  Edit,
} from "@mui/icons-material";
import PermissionToggle from "./PermissionToggle";
import "./SideMenu.css";

const SideMenu = ({
  onLogout,
  onToggleDarkMode,
  onNewChat,
  onSelectSession,
  sessions = [],
  collapsed,
  toggleCollapse,
  onUpdateTitle,
}) => {
  const theme = useTheme();
  const [showPermissions, setShowPermissions] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [newTitle, setNewTitle] = useState("");

  const handleEditClick = (sessionId, currentTitle) => {
    setEditingSessionId(sessionId);
    setNewTitle(currentTitle);
  };

  const handleTitleChange = (e) => {
    setNewTitle(e.target.value);
  };

  const handleTitleUpdate = (sessionId) => {
    if (newTitle.trim()) {
      onUpdateTitle(sessionId, newTitle.trim());
    }
    setEditingSessionId(null);
    setNewTitle("");
  };

  return (
    <div className="SideMenu-wrapper">
      {/* ===== Header Row ===== */}
      <div className="SideMenu-top">
        <h3 className="side-menu-title">Menu</h3>
        <IconButton
          onClick={toggleCollapse}
          size="small"
          className="side-menu-collapse-btn"
          aria-label={collapsed ? "Open menu" : "Close menu"}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </IconButton>
      </div>
      <Divider />

      {/* ===== Menu Content ===== */}
      <div className="SideMenu-content">
        {/* New Chat */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={onNewChat}>
              <ListItemIcon>
                <Add />
              </ListItemIcon>
              <ListItemText primary="New Chat" />
            </ListItemButton>
          </ListItem>
        </List>
        <Divider />

        {/* Sessions List */}
        <List>
          {sessions.length > 0 ? (
            sessions.map((s) => (
              <ListItem key={s.id} disablePadding>
                {editingSessionId === s.id ? (
                  <TextField
                    value={newTitle}
                    onChange={handleTitleChange}
                    onBlur={() => handleTitleUpdate(s.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleTitleUpdate(s.id);
                      }
                    }}
                    size="small"
                    variant="standard"
                    fullWidth
                    autoFocus
                    sx={{ padding: "0 16px" }}
                  />
                ) : (
                  <ListItemButton onClick={() => onSelectSession(s.id)}>
                    <ListItemIcon>
                      <Chat />
                    </ListItemIcon>
                    <ListItemText primary={s.title} />
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditClick(s.id, s.title);
                      }}
                    >
                      <Edit fontSize="small" />
                    </IconButton>
                  </ListItemButton>
                )}
              </ListItem>
            ))
          ) : (
            <ListItem>
              <ListItemText primary="No chats yet" />
            </ListItem>
          )}
        </List>
        <Divider />

        {/* ===== Permissions Toggle Section ===== */}
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={() => setShowPermissions(!showPermissions)}>
              <ListItemIcon>
                {showPermissions ? <ExpandLess /> : <ExpandMore />}
              </ListItemIcon>
              <ListItemText
                primary={
                  showPermissions ? "Hide Permissions" : "Show Permissions"
                }
              />
            </ListItemButton>
          </ListItem>

          <Collapse in={showPermissions} timeout="auto" unmountOnExit>
            <div className="PermissionToggle-sub">
              <PermissionToggle />
            </div>
          </Collapse>
        </List>
      </div>

      {/* ===== Footer ===== */}
      <div className="SideMenu-footer">
        <List>
          <ListItem disablePadding>
            <ListItemButton onClick={onToggleDarkMode}>
              <ListItemIcon>
                {theme.palette.mode === "dark" ? <LightMode /> : <DarkMode />}
              </ListItemIcon>
              <ListItemText primary="Toggle Theme" />
            </ListItemButton>
          </ListItem>

          <ListItem disablePadding>
            <ListItemButton onClick={onLogout}>
              <ListItemIcon>
                <Logout />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </ListItemButton>
          </ListItem>
        </List>
      </div>
    </div>
  );
};

export default SideMenu;
