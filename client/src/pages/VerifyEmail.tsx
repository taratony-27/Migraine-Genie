import React, { useEffect, useState } from "react";
import { Box, Paper, Typography, Button, Alert, CircularProgress } from "@mui/material";
import { useNavigate, useSearchParams } from "react-router-dom";
import { applyActionCode, onAuthStateChanged, sendEmailVerification, User } from "firebase/auth";
import { auth } from "../services/firebase";
import { endSession } from "../services/session";

// Email/password accounts land here until they confirm their address
// (RequireAuth sends them). Firebase sends and checks the link itself; if the
// Firebase action URL ever points at this page, the oobCode is applied here too.
const VerifyEmail: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const oobCode = searchParams.get("mode") === "verifyEmail" ? searchParams.get("oobCode") : null;

  // undefined = Firebase hasn't reported yet
  const [user, setUser] = useState<User | null | undefined>(auth.currentUser ?? undefined);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ severity: "success" | "info" | "error"; text: string } | null>(null);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  useEffect(() => {
    if (!oobCode) return;
    setBusy(true);
    applyActionCode(auth, oobCode)
      .then(async () => {
        await auth.currentUser?.reload();
        setNotice({ severity: "success", text: "Your email is verified." });
      })
      .catch(() => setNotice({ severity: "error", text: "This link has expired or was already used. Send a new one below." }))
      .finally(() => setBusy(false));
  }, [oobCode]);

  // Already verified (or a Google account): nothing to do here.
  useEffect(() => {
    if (user?.emailVerified && !oobCode) navigate("/dashboard", { replace: true });
  }, [user, oobCode, navigate]);

  const resend = async () => {
    if (!auth.currentUser) return;
    setBusy(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setNotice({ severity: "info", text: `We sent a new link to ${auth.currentUser.email}.` });
    } catch (err: any) {
      setNotice({
        severity: "error",
        text: err?.code === "auth/too-many-requests"
          ? "Please wait a few minutes before asking for another email."
          : "We couldn't send the email. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const continueIfVerified = async () => {
    if (!auth.currentUser) return;
    setBusy(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        // Refresh the ID token so the server sees email_verified = true.
        await auth.currentUser.getIdToken(true);
        navigate("/dashboard", { replace: true });
      } else {
        setNotice({ severity: "info", text: "We haven't seen the click yet. Open the link in the email, then try again." });
      }
    } finally {
      setBusy(false);
    }
  };

  const logout = async () => {
    await endSession();
    navigate("/", { replace: true });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh" p={2} bgcolor="#f4faff">
      <Paper sx={{ p: 4, maxWidth: 520, width: "100%", borderRadius: 3 }} elevation={6}>
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#1565c0">
          Verify your email
        </Typography>

        {notice && <Alert severity={notice.severity} sx={{ mb: 2 }}>{notice.text}</Alert>}

        {user === undefined ? (
          <Box display="flex" justifyContent="center" py={3}><CircularProgress aria-label="Loading" /></Box>
        ) : user ? (
          <>
            <Typography variant="body1" mb={3}>
              We sent a link to <strong>{user.email}</strong>. Click it to confirm your address, then come back here.
              Check your spam folder if you can't find it.
            </Typography>
            <Box display="flex" flexDirection="column" gap={1}>
              <Button variant="contained" onClick={continueIfVerified} disabled={busy}>
                I've verified, continue
              </Button>
              <Button variant="outlined" onClick={resend} disabled={busy}>
                Send the email again
              </Button>
              <Button onClick={logout} disabled={busy}>
                Log out
              </Button>
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body1" mb={3}>
              {notice?.severity === "success"
                ? "You can now log in."
                : "Log in to finish verifying your email."}
            </Typography>
            <Button variant="contained" fullWidth onClick={() => navigate("/", { replace: true })}>
              Go to login
            </Button>
          </>
        )}
      </Paper>
    </Box>
  );
};

export default VerifyEmail;
