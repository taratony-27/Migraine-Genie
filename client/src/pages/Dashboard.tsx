// client/src/pages/Dashboard.tsx
// Changes:
// 1) Fix slight “shift right” by removing centering constraints and ensuring Container + Paper are truly centered.
// 2) Make content area full width and consistent padding.
// 3) Small UX: persist active tab in sessionStorage so refresh keeps the same tab.

import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Container,
  ButtonGroup,
  Button,
  Paper,
  useTheme,
  useMediaQuery,
  Menu,
  MenuItem,
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import MenuIcon from "@mui/icons-material/Menu";

import DailyLog from "../components/DailyLog";
import DailyPredictions from "../components/DailyPredictions";
import Medication from "../components/Medication";
import WellnessProgram from "../components/WellnessProgram";
import AIAssistant from "../components/AIAssistant";
import Visualization from "../components/Visualization";

const tabs = [
  "Trigger Prediction",
  "Daily Log",
  "Wellness Program",
  "Medication",
  "AI Assistant",
  "Visualization Report",
];

// Helper: extract a friendly name
const extractName = (): string | null => {
  if (typeof window === "undefined") return null;

  const tryKeys = (store: Storage, keys: string[]) => {
    for (const k of keys) {
      const v = store.getItem(k);
      if (!v) continue;

      try {
        const obj = JSON.parse(v);
        if (obj && typeof obj === "object") {
          const guess =
            (obj as any).name ||
            (obj as any).fullName ||
            ((obj as any).firstName && (obj as any).lastName
              ? `${(obj as any).firstName} ${(obj as any).lastName}`
              : null) ||
            (obj as any).firstName ||
            (obj as any).username ||
            null;
          if (guess) return String(guess);
        }
      } catch {
        if (v && v !== "undefined" && v !== "null") return v;
      }
    }
    return null;
  };

  const fromLocal =
    tryKeys(localStorage, ["user", "profile", "name", "username", "displayName"]) ||
    tryKeys(sessionStorage, ["user", "profile", "name", "username", "displayName"]);
  if (fromLocal) return fromLocal;

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken");
  if (token && token.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const guess =
        payload.name ||
        payload.fullName ||
        (payload.given_name && payload.family_name ? `${payload.given_name} ${payload.family_name}` : null) ||
        payload.given_name ||
        payload.username;
      if (guess) return String(guess);
    } catch {
      /* ignore */
    }
  }

  return null;
};

const extractUserId = (): number | string | null => {
  const pickId = (obj: any) =>
    obj?.user_id ??
    obj?.id ??
    obj?._id ??
    (typeof obj === "number" || typeof obj === "string" ? obj : null);

  const tryParse = (store: Storage, keys: string[]) => {
    for (const k of keys) {
      const v = store.getItem(k);
      if (!v) continue;
      try {
        const obj = JSON.parse(v);
        const id = pickId(obj) ?? pickId(obj?.user) ?? pickId(obj?.profile);
        if (id !== null && id !== undefined) return id;
      } catch {
        // ignore
      }
    }
    return null;
  };

  const fromLocal = tryParse(localStorage, ["user", "profile"]) || tryParse(sessionStorage, ["user", "profile"]);
  if (fromLocal !== null) return fromLocal;

  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    sessionStorage.getItem("token") ||
    sessionStorage.getItem("accessToken");
  if (token && token.split(".").length === 3) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const id = pickId(payload) ?? payload?.sub ?? null;
      if (id !== null && id !== undefined) return id;
    } catch {
      /* ignore */
    }
  }

  return null;
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [activeTab, setActiveTab] = useState(() => sessionStorage.getItem("activeTab") || "Trigger Prediction");
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayName, setDisplayName] = useState("User");
  const [userId, setUserId] = useState<number | string | null>(null);

  useEffect(() => {
    sessionStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const update = () => {
      const name = extractName();
      setDisplayName(name && name.trim().length ? name : "User");

      const id = extractUserId();
      setUserId(id);
    };
    update();

    const onStorage = (e: StorageEvent) => {
      if (!e.key) return update();
      if (["user", "profile", "name", "username", "displayName", "token", "accessToken"].includes(e.key)) update();
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
  const handleMenuItemClick = (tab: string) => {
    setActiveTab(tab);
    setAnchorEl(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Daily Log":
        return userId ? <DailyLog userId={userId} /> : <Typography>Please log in.</Typography>;
      case "Wellness Program":
        return <WellnessProgram />;
      case "Medication":
        return <Medication />;
      case "AI Assistant":
        return <AIAssistant userId={userId} />;
      case "Visualization Report":
        return <Visualization />;
      case "Trigger Prediction":
      default:
        return <DailyPredictions userId={userId} />;
    }
  };

  const activeTabIndex = tabs.indexOf(activeTab);
  const tabWidth = 100 / tabs.length;

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f5f5f5", py: { xs: 2, md: 4 } }}>
      {/* Profile */}
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        <Box sx={{ textAlign: "center" }}>
          <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
            Hello, {displayName}
          </Typography>
        </Box>
      </Container>

      {/* Navigation */}
      <Container maxWidth="lg" sx={{ mb: 2 }}>
        {isMobile ? (
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={800}>
              {activeTab}
            </Typography>
            <IconButton onClick={handleMenuClick}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
              {tabs.map((tab) => (
                <MenuItem key={tab} onClick={() => handleMenuItemClick(tab)}>
                  {tab}
                </MenuItem>
              ))}
            </Menu>
          </Box>
        ) : (
          <Box position="relative">
            <Box position="relative" overflow="hidden" borderRadius="999px" boxShadow={1}>
              <motion.div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: `${tabWidth}%`,
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: "999px",
                  zIndex: 1,
                }}
                animate={{ x: `${activeTabIndex * 100}%` }}
                transition={{ type: "spring", stiffness: 320, damping: 30 }}
              />
              <ButtonGroup
                fullWidth
                variant="contained"
                sx={{
                  position: "relative",
                  zIndex: 2,
                  borderRadius: "999px",
                  overflow: "hidden",
                  "& .MuiButtonGroup-grouped": { border: "none !important" },
                }}
              >
                {tabs.map((tab) => (
                  <Button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    sx={{
                      borderRadius: 0,
                      bgcolor: "transparent",
                      color: activeTab === tab ? "white" : "text.primary",
                      fontWeight: activeTab === tab ? 900 : 600,
                      boxShadow: "none !important",
                      "&:hover": {
                        color: activeTab === tab ? "white" : theme.palette.primary.main,
                        bgcolor: "transparent",
                      },
                    }}
                  >
                    {tab}
                  </Button>
                ))}
              </ButtonGroup>
            </Box>
          </Box>
        )}
      </Container>

      {/* Content */}
      <Container maxWidth="lg" sx={{ pb: 4 }}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2, md: 3 },
            borderRadius: 3,
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;