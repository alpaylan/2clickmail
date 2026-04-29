// components/Layout.tsx — Gmail-style shell: top app bar + left rail + content.

import React, { ReactNode, useEffect, useState } from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import Link from "next/link";
import Cookies from "js-cookie";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import InputBase from "@mui/material/InputBase";
import Tooltip from "@mui/material/Tooltip";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";

import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import AppsIcon from "@mui/icons-material/Apps";
import EditIcon from "@mui/icons-material/Edit";
import InboxIcon from "@mui/icons-material/Inbox";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import LogoutIcon from "@mui/icons-material/Logout";
import GitHubIcon from "@mui/icons-material/GitHub";

import { logoutUser } from "@/lib/requests/auth";

type LayoutProps = {
  children: ReactNode;
  /** When true, the search bar in the header is shown (default true). */
  showSearch?: boolean;
};

const SIDEBAR_WIDTH = 256;
const SIDEBAR_COLLAPSED_WIDTH = 72;
const HEADER_HEIGHT = 64;

type RailItem = {
  href: string;
  text: string;
  icon: React.ReactNode;
};

function railItems(loggedIn: boolean): RailItem[] {
  if (loggedIn) {
    return [
      { href: "/profile", text: "My Emails", icon: <InboxIcon /> },
      { href: "/about", text: "About", icon: <InfoOutlinedIcon /> },
    ];
  }
  return [
    { href: "/login", text: "Login", icon: <LoginIcon /> },
    { href: "/register", text: "Register", icon: <PersonAddAltIcon /> },
    { href: "/about", text: "About", icon: <InfoOutlinedIcon /> },
  ];
}

const Sidebar = ({
  collapsed,
  loggedIn,
}: {
  collapsed: boolean;
  loggedIn: boolean;
}) => {
  const router = useRouter();
  const items = railItems(loggedIn);

  return (
    <Box
      component="nav"
      sx={{
        width: collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH,
        flexShrink: 0,
        position: "sticky",
        top: HEADER_HEIGHT,
        alignSelf: "flex-start",
        height: `calc(100vh - ${HEADER_HEIGHT}px)`,
        pt: 1,
        pl: collapsed ? 1 : 1,
        pr: collapsed ? 1 : 1,
        transition: "width 200ms ease",
        display: { xs: "none", md: "block" },
      }}
    >
      <Box sx={{ px: collapsed ? 0 : 1, mb: 1 }}>
        <Tooltip title="New Email" placement="right" disableHoverListener={!collapsed}>
          <Box
            component={Link}
            href="/generate"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              backgroundColor: "#c2e7ff",
              color: "#001d35",
              borderRadius: 999,
              height: 56,
              px: collapsed ? 0 : 2,
              width: collapsed ? 56 : "auto",
              minWidth: 56,
              justifyContent: collapsed ? "center" : "flex-start",
              boxShadow: "0 1px 3px rgba(60,64,67,.15)",
              transition: "box-shadow 150ms ease, background-color 150ms ease",
              "&:hover": {
                backgroundColor: "#b3deff",
                boxShadow: "0 2px 6px rgba(60,64,67,.25)",
              },
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            <EditIcon sx={{ fontSize: 22 }} />
            {!collapsed && <span>Compose</span>}
          </Box>
        </Tooltip>
      </Box>

      <Box sx={{ mt: 1 }}>
        {items.map((item) => {
          const active = router.pathname === item.href;
          return (
            <Box
              key={item.href}
              component={Link}
              href={item.href}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                height: 36,
                pl: collapsed ? 0 : 3,
                pr: 2,
                mr: collapsed ? 0 : 2,
                ml: collapsed ? 0 : 0,
                borderTopRightRadius: 999,
                borderBottomRightRadius: 999,
                borderRadius: collapsed ? 999 : undefined,
                width: collapsed ? 56 : "auto",
                justifyContent: collapsed ? "center" : "flex-start",
                color: active ? "#001d35" : "#202124",
                backgroundColor: active ? "#d3e3fd" : "transparent",
                fontWeight: active ? 700 : 500,
                fontSize: 14,
                "&:hover": {
                  backgroundColor: active ? "#d3e3fd" : "var(--gmail-hover)",
                },
                cursor: "pointer",
              }}
            >
              <Box sx={{ display: "flex", color: active ? "#001d35" : "#5f6368" }}>
                {item.icon}
              </Box>
              {!collapsed && <span>{item.text}</span>}
            </Box>
          );
        })}
      </Box>

      {!collapsed && (
        <Box sx={{ mt: 4, px: 3, color: "#5f6368", fontSize: 12 }}>
          <Box
            component="a"
            href="https://github.com/alpaylan/2clickmail"
            target="_blank"
            rel="noreferrer"
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 0.75,
              color: "inherit",
              "&:hover": { color: "#1a73e8" },
            }}
          >
            <GitHubIcon sx={{ fontSize: 16 }} />
            <span>Source on GitHub</span>
          </Box>
        </Box>
      )}
    </Box>
  );
};

const Header = ({
  onToggleSidebar,
  loggedIn,
  showSearch,
}: {
  onToggleSidebar: () => void;
  loggedIn: boolean;
  showSearch: boolean;
}) => {
  const router = useRouter();
  const [anchor, setAnchor] = useState<null | HTMLElement>(null);
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    router.push({ pathname: "/profile", query: { q: search.trim() } });
  };

  return (
    <AppBar position="sticky" elevation={0} color="default">
      <Toolbar sx={{ minHeight: HEADER_HEIGHT, gap: 1, px: { xs: 1.5, md: 2 } }}>
        <IconButton
          edge="start"
          aria-label="menu"
          onClick={onToggleSidebar}
          sx={{ color: "#5f6368" }}
        >
          <MenuIcon />
        </IconButton>

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Box
            component="img"
            src="/favicon.ico"
            alt=""
            sx={{ width: 28, height: 28 }}
          />
          <Typography
            sx={{
              fontFamily: '"Google Sans", "Roboto", sans-serif',
              fontWeight: 400,
              fontSize: 22,
              color: "#5f6368",
              display: { xs: "none", sm: "block" },
            }}
          >
            2clickmail
          </Typography>
        </Link>

        {showSearch && (
          <Box
            component="form"
            onSubmit={handleSearch}
            sx={{
              flex: 1,
              maxWidth: 720,
              mx: { xs: 1, md: 4 },
              display: "flex",
              alignItems: "center",
              backgroundColor: "#eaf1fb",
              borderRadius: 999,
              height: 48,
              px: 2,
              transition: "background-color 150ms ease, box-shadow 150ms ease",
              "&:focus-within": {
                backgroundColor: "#ffffff",
                boxShadow: "0 1px 1px rgba(0,0,0,0.1)",
              },
            }}
          >
            <IconButton type="submit" sx={{ color: "#5f6368", p: 0.5 }}>
              <SearchIcon />
            </IconButton>
            <InputBase
              placeholder="Search mail"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ ml: 1, flex: 1, fontSize: 16 }}
            />
          </Box>
        )}

        {!showSearch && <Box sx={{ flex: 1 }} />}

        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Help">
            <IconButton sx={{ color: "#5f6368" }} component="a" href="/about">
              <HelpOutlineIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Settings">
            <IconButton sx={{ color: "#5f6368" }} component="a" href="/about">
              <SettingsIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="GitHub">
            <IconButton
              sx={{ color: "#5f6368" }}
              component="a"
              href="https://github.com/alpaylan/2clickmail"
              target="_blank"
              rel="noreferrer"
            >
              <AppsIcon />
            </IconButton>
          </Tooltip>

          <IconButton
            onClick={(e) => setAnchor(e.currentTarget)}
            sx={{ ml: 0.5 }}
            aria-label="account"
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: loggedIn ? "#1a73e8" : "#5f6368",
                fontSize: 14,
              }}
            >
              {loggedIn ? "U" : "?"}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            transformOrigin={{ horizontal: "right", vertical: "top" }}
            anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
          >
            {loggedIn
              ? [
                  <MenuItem
                    key="profile"
                    onClick={() => {
                      setAnchor(null);
                      router.push("/profile");
                    }}
                  >
                    <InboxIcon fontSize="small" style={{ marginRight: 8 }} /> My Emails
                  </MenuItem>,
                  <Divider key="d" />,
                  <MenuItem
                    key="logout"
                    onClick={() => {
                      logoutUser();
                      setAnchor(null);
                      router.push("/login");
                    }}
                  >
                    <LogoutIcon fontSize="small" style={{ marginRight: 8 }} /> Sign out
                  </MenuItem>,
                ]
              : [
                  <MenuItem
                    key="login"
                    onClick={() => {
                      setAnchor(null);
                      router.push("/login");
                    }}
                  >
                    <LoginIcon fontSize="small" style={{ marginRight: 8 }} /> Login
                  </MenuItem>,
                  <MenuItem
                    key="register"
                    onClick={() => {
                      setAnchor(null);
                      router.push("/register");
                    }}
                  >
                    <PersonAddAltIcon fontSize="small" style={{ marginRight: 8 }} />{" "}
                    Register
                  </MenuItem>,
                ]}
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

const Layout = ({ children, showSearch = true }: LayoutProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!Cookies.get("token"));
  }, []);

  return (
    <>
      <Head>
        <title>2clickmail</title>
      </Head>
      <Box sx={{ minHeight: "100vh", backgroundColor: "var(--gmail-bg)" }}>
        <Header
          onToggleSidebar={() => setCollapsed((c) => !c)}
          loggedIn={loggedIn}
          showSearch={showSearch}
        />
        <Box sx={{ display: "flex", alignItems: "flex-start" }}>
          <Sidebar collapsed={collapsed} loggedIn={loggedIn} />
          <Box
            component="main"
            sx={{
              flex: 1,
              minWidth: 0,
              p: { xs: 1, md: 2 },
              pt: { xs: 1, md: 2 },
            }}
          >
            <Box
              sx={{
                backgroundColor: "var(--gmail-surface)",
                borderRadius: 4,
                minHeight: `calc(100vh - ${HEADER_HEIGHT + 24}px)`,
                overflow: "hidden",
              }}
            >
              {children}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Layout;
