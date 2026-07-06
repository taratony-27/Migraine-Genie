import React, { useEffect, useState } from "react";
import {
  Box, Typography, Container, Button, Paper,
  useTheme, useMediaQuery, Menu, MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

import DailyLog from "../components/DailyLog";
import DailyPredictions from "../components/DailyPredictions";
import Medication from "../components/Medication";
import WellnessProgram from "../components/WellnessProgram";
import AIAssistant from "../components/AIAssistant";
import Visualization from "../components/Visualization";

const tabs = [
  { label: "Trigger Prediction", short: "Predictions" },
  { label: "Daily Log",           short: "Daily Log" },
  { label: "Wellness Program",    short: "Wellness" },
  { label: "Medication",          short: "Medication" },
  { label: "AI Assistant",        short: "AI Chat" },
  { label: "Visualization Report",short: "Reports" },
];

const extractName = (): string | null => {
  if (typeof window === "undefined") return null;
  const tryKeys = (store: Storage, keys: string[]) => {
    for (const k of keys) {
      const v = store.getItem(k);
      if (!v) continue;
      try {
        const obj = JSON.parse(v);
        if (obj && typeof obj === "object") {
          const guess = (obj as any).name || (obj as any).fullName ||
            ((obj as any).firstName && (obj as any).lastName
              ? `${(obj as any).firstName} ${(obj as any).lastName}` : null) ||
            (obj as any).firstName || (obj as any).username || null;
          if (guess) return String(guess);
        }
      } catch {
        if (v && v !== "undefined" && v !== "null") return v;
      }
    }
    return null;
  };
  return tryKeys(localStorage, ["user", "profile", "name", "username", "displayName"]) ||
    tryKeys(sessionStorage, ["user", "profile", "name", "username", "displayName"]);
};

const extractUserId = (): number | string | null => {
  const pickId = (obj: any) =>
    obj?.user_id ?? obj?.id ?? obj?._id ??
    (typeof obj === "number" || typeof obj === "string" ? obj : null);
  const tryParse = (store: Storage, keys: string[]) => {
    for (const k of keys) {
      const v = store.getItem(k);
      if (!v) continue;
      try {
        const obj = JSON.parse(v);
        const id = pickId(obj) ?? pickId(obj?.user) ?? pickId(obj?.profile);
        if (id !== null && id !== undefined) return id;
      } catch {}
    }
    return null;
  };
  return tryParse(localStorage, ["user", "profile"]) || tryParse(sessionStorage, ["user", "profile"]);
};

const Dashboard: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isMedium = useMediaQuery(theme.breakpoints.down("md"));

  const [activeTab, setActiveTab] = useState(
    () => sessionStorage.getItem("activeTab") || "Trigger Prediction"
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [displayName, setDisplayName] = useState("User");
  const [userId, setUserId] = useState<number | string | null>(null);

  useEffect(() => { sessionStorage.setItem("activeTab", activeTab); }, [activeTab]);

  useEffect(() => {
    const update = () => {
      const name = extractName();
      setDisplayName(name?.trim() || "User");
      setUserId(extractUserId());
    };
    update();
    window.addEventListener("storage", update);
    return () => window.removeEventListener("storage", update);
  }, []);

  const activeTabIndex = tabs.findIndex((t) => t.label === activeTab);
  const tabWidth = 100 / tabs.length;

  const renderContent = () => {
    switch (activeTab) {
      case "Daily Log":           return userId ? <DailyLog userId={userId} /> : <Typography p={3}>Please log in.</Typography>;
      case "Wellness Program":    return <WellnessProgram />;
      case "Medication":          return <Medication />;
      case "AI Assistant":        return <AIAssistant userId={userId} />;
      case "Visualization Report":return <Visualization />;
      case "Trigger Prediction":
      default:                    return <DailyPredictions userId={userId} />;
    }
  };

  return (
    <Box sx={{ minHeight: "100dvh", bgcolor: "#f5f7fa" }}>
      {/* Top bar */}
      <Box
        sx={{
          bgcolor: "#fff",
          borderBottom: "1px solid",
          borderColor: "divider",
          px: { xs: 2, md: 4 },
          py: 2,
        }}
      >
        <Container maxWidth="lg" disableGutters>
          <Box display="flex" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
            <Box>
              <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800} color="primary.main">
                Hello, {displayName} 👋
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </Typography>
            </Box>

            {/* Mobile: dropdown menu trigger */}
            {isMobile && (
              <Button
                variant="outlined"
                size="small"
                endIcon={<ExpandMoreIcon />}
                onClick={(e) => setAnchorEl(e.currentTarget)}
                sx={{ borderRadius: 2, fontWeight: 600, textTransform: "none" }}
              >
                {tabs.find((t) => t.label === activeTab)?.short}
              </Button>
            )}
          </Box>

          {/* Desktop / medium: pill tab bar */}
          {!isMobile && (
            <Box mt={2.5} position="relative">
              <Box position="relative" overflow="hidden" borderRadius="999px" bgcolor="#f0f4f8" p="3px">
                <motion.div
                  style={{
                    position: "absolute",
                    top: 3,
                    left: 3,
                    height: "calc(100% - 6px)",
                    width: `calc(${tabWidth}% - 6px / ${tabs.length})`,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "999px",
                    zIndex: 1,
                  }}
                  animate={{ x: `calc(${activeTabIndex * 100}% + ${activeTabIndex * 2}px)` }}
                  transition={{ type: "spring", stiffness: 350, damping: 32 }}
                />
                <Box
                  display="flex"
                  sx={{ position: "relative", zIndex: 2 }}
                >
                  {tabs.map((tab) => {
                    const isActive = activeTab === tab.label;
                    return (
                      <Box
                        key={tab.label}
                        flex={1}
                        onClick={() => setActiveTab(tab.label)}
                        sx={{
                          textAlign: "center",
                          py: 0.9,
                          px: 0.5,
                          cursor: "pointer",
                          borderRadius: "999px",
                          color: isActive ? "#fff" : "text.secondary",
                          fontWeight: isActive ? 700 : 500,
                          fontSize: isMedium ? "0.7rem" : "0.8rem",
                          whiteSpace: "nowrap",
                          userSelect: "none",
                          transition: "color 0.2s",
                          "&:hover": { color: isActive ? "#fff" : "primary.main" },
                        }}
                      >
                        {isMedium ? tab.short : tab.label}
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            </Box>
          )}
        </Container>
      </Box>

      {/* Mobile dropdown menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2 } }}
      >
        {tabs.map((tab) => (
          <MenuItem
            key={tab.label}
            selected={activeTab === tab.label}
            onClick={() => { setActiveTab(tab.label); setAnchorEl(null); }}
            sx={{ fontWeight: activeTab === tab.label ? 700 : 400 }}
          >
            {tab.label}
          </MenuItem>
        ))}
      </Menu>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: { xs: 2, md: 4 } }}>
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 3,
            bgcolor: "#fff",
            border: "1px solid",
            borderColor: "divider",
            minHeight: 400,
          }}
        >
          {renderContent()}
        </Paper>
      </Container>
    </Box>
  );
};

export default Dashboard;
