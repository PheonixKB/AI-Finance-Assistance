import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../AuthContext";
import SideMenu from "./SideMenu";

import {
  Box,
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

function Layout({
  toggleDarkMode,
  children,
  onNewChat,
  sessions,
  onSelectSession,
  activeSession,
  onUpdateTitle,
  onDeleteSession,
}) {
  const { logout } = useAuth();

  const [drawerWidth, setDrawerWidth] = useState(280);
  const [collapsed, setCollapsed] = useState(false);
  const isResizing = useRef(false);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--drawer-width",
      `${collapsed ? 0 : drawerWidth}px`
    );
  }, [drawerWidth, collapsed]);

  // --- Resize Logic ---
  const startResize = (e) => {
    if (collapsed) return;
    isResizing.current = true;
    document.addEventListener("mousemove", resizeDrawer);
    document.addEventListener("mouseup", stopResize);
  };
  const resizeDrawer = (e) => {
    if (!isResizing.current) return;
    const newWidth = Math.min(Math.max(e.clientX, 180), 480);
    setDrawerWidth(newWidth);
  };
  const stopResize = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", resizeDrawer);
    document.removeEventListener("mouseup", stopResize);
  };
  const toggleCollapse = () => setCollapsed((prev) => !prev);

  return (
    <Box sx={{ display: "flex", height: "100vh", minWidth: 0 }}>
      <CssBaseline />

      <Drawer
        variant="permanent"
        sx={{
          width: collapsed ? 0 : drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: collapsed ? 0 : drawerWidth,
            boxSizing: "border-box",
            position: "relative",
            transition: "width 0.25s",
            borderRight: "1px solid rgba(0,0,0,0.12)",
            height: "100vh",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            padding: 0,
          },
        }}
        open={!collapsed}
      >
        {!collapsed && (
          <>
            <SideMenu
              onLogout={logout}
              onToggleDarkMode={toggleDarkMode}
              onNewChat={onNewChat}
              sessions={sessions}
              onSelectSession={onSelectSession}
              activeSession={activeSession}
              collapsed={collapsed}
              toggleCollapse={toggleCollapse}
              onUpdateTitle={onUpdateTitle}
              onDeleteSession={onDeleteSession}
            />
            <div
              className="resize-handle"
              onMouseDown={startResize}
              style={{
                width: 6,
                cursor: "col-resize",
                backgroundColor: "transparent",
                position: "absolute",
                top: 0,
                right: 0,
                bottom: 0,
                transition: "background 0.2s",
                zIndex: 10,
              }}
            ></div>
          </>
        )}
      </Drawer>

      {/* Top bar */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: (theme) => theme.zIndex.drawer + 1,
          ml: collapsed ? 0 : `${drawerWidth}px`,              // AppBar starts right of Drawer
          width: collapsed ? "100%" : `calc(100% - ${drawerWidth}px)`, // AppBar doesn't overlay Drawer
          transition: "all 0.25s ease",
        }}
      >
        <Toolbar>
          {collapsed && (
            <IconButton color="inherit" onClick={toggleCollapse} edge="start" sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" noWrap>
            Finance AI Assistant
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minWidth: 0,
          height: "100vh",
          p: 3,
          pt: "80px",
          transition: "margin 0.25s ease, width 0.25s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

export default Layout;
