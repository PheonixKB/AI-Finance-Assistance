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
}) => {
  const theme = useTheme();
  const [showPermissions, setShowPermissions] = useState(false);

  return (
    <div className="SideMenu-wrapper">
      {/* ===== Header Row ===== */}
      <div className="SideMenu-top">
        <h3 style={{ margin: 0 }}>Menu</h3>
        <IconButton onClick={toggleCollapse} size="small">
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
                <ListItemButton onClick={() => onSelectSession(s.id)}>
                  <ListItemIcon>
                    <Chat />
                  </ListItemIcon>
                  <ListItemText primary={s.title} />
                </ListItemButton>
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
