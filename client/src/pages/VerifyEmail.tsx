// ==============================
// 1) client/src/pages/VerifyEmail.tsx (IMPROVED)
// - Handles success redirect
// - Adds resend flow
// - Does not assume user exists (no leakage)
// - Stores verified flag in localStorage user if present
// ==============================
import React, { useEffect, useMemo, useState } from "react";
import { Box, Paper, Typography, Button, Alert, TextField, CircularProgress } from "@mui/material";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../services/api";

type State = "idle" | "verifying" | "success" | "error" | "resending" | "resent";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState<string>("");

  // For resend
  const [email, setEmail] = useState<string>(() => {
    try {
      const u = JSON.parse(localStorage.getItem("user") || "null");
      return u?.email || "";
    } catch {
      return "";
    }
  });

  const setVerifiedInLocalStorageIfSameEmail = () => {
    try {
      const stored = localStorage.getItem("user");
      if (!stored) return;
      const user = JSON.parse(stored);
      if (!user || typeof user !== "object") return;

      // mark verified (safe even if user is different shape)
      user.email_verified = true;
      localStorage.setItem("user", JSON.stringify(user));
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const run = async () => {
      if (!token) {
        setState("error");
        setMessage("Missing verification token.");
        return;
      }

      try {
        setState("verifying");
        setMessage("Verifying your email...");

        const res = await api.get(`/api/users/verify-email?token=${encodeURIComponent(token)}`);

        setVerifiedInLocalStorageIfSameEmail();

        setState("success");
        setMessage(res.data?.message || "Email verified successfully.");

        setTimeout(() => navigate("/", { replace: true }), 2000);
      } catch (err: any) {
        setState("error");
        setMessage(err?.response?.data?.message || "Verification failed or token expired.");
      }
    };

    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const resend = async () => {
    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        setState("error");
        setMessage("Enter a valid email address to resend verification.");
        return;
      }

      setState("resending");
      setMessage("");

      const res = await api.post("/api/users/resend-verification", { email });
      setState("resent");
      setMessage(res.data?.message || "If that email exists, a verification email has been sent.");
    } catch (err: any) {
      setState("error");
      setMessage(err?.response?.data?.message || "Failed to resend verification email.");
    }
  };

  const isBusy = state === "verifying" || state === "resending";

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2} bgcolor="#f4faff">
      <Paper sx={{ p: 4, maxWidth: 520, width: "100%", borderRadius: 3 }} elevation={6}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#1565c0">
          Email Verification
        </Typography>

        {state === "verifying" && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {state === "success" && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {message} Redirecting...
          </Alert>
        )}

        {(state === "error" || state === "resent") && (
          <Alert severity={state === "error" ? "error" : "info"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {/* Resend UI (only show if token failed OR token missing) */}
        {(state === "error" || !token) && (
          <Box mt={2}>
            <Typography variant="body2" color="text.secondary" mb={1}>
              Token expired or invalid. Resend a new verification email:
            </Typography>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="dense"
              disabled={isBusy}
            />

            <Button
              variant="contained"
              onClick={resend}
              sx={{ mt: 1.5 }}
              disabled={isBusy}
              fullWidth
            >
              {state === "resending" ? (
                <Box display="flex" alignItems="center" gap={1}>
                  <CircularProgress size={18} />
                  Sending...
                </Box>
              ) : (
                "Resend Verification Email"
              )}
            </Button>
          </Box>
        )}

        <Box mt={2} display="flex" gap={1}>
          <Button variant="outlined" fullWidth disabled={isBusy} onClick={() => navigate("/", { replace: true })}>
            Back to Home
          </Button>
          <Button variant="contained" fullWidth disabled={isBusy} onClick={() => navigate("/", { replace: true })}>
            Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default VerifyEmail;