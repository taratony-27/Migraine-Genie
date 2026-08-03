import React, { useState } from "react";
import {
  Box, TextField, Typography, Button, Link, MenuItem,
  Snackbar, Alert, Paper, Divider, CircularProgress,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithPopup,
  updateProfile,
} from "firebase/auth";
import { auth, googleProvider } from "../services/firebase";
import api from "../services/api";

const isValidEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

const Auth: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", dateOfBirth: "", gender: "",
  });
  const [alert, setAlert] = useState<{
    open: boolean; message: string; severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const showAlert = (message: string, severity: "success" | "error" | "info") =>
    setAlert({ open: true, message, severity });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // After any successful Firebase sign-in, sync the user to MongoDB
  // and store auth state in localStorage so the rest of the app works.
  const afterSignIn = async (name?: string) => {
    const user = auth.currentUser;
    if (!user) return;

    const token = await user.getIdToken();
    localStorage.setItem("token", token);

    // Sync to MongoDB — creates or finds the user document
    const res = await api.post("/api/users/sync", { name: name || user.displayName || "" });
    const mongoUser = res.data?.user;
    if (mongoUser) {
      localStorage.setItem("user", JSON.stringify(mongoUser));
    }

    window.location.href = "/dashboard";
  };

  const handleLogin = async () => {
    if (!isValidEmail(formData.email)) {
      showAlert("Please enter a valid email address.", "error");
      return;
    }
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      await afterSignIn();
    } catch (err: any) {
      showAlert(friendlyError(err.code), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!formData.name.trim()) { showAlert("Name is required.", "error"); return; }
    if (!isValidEmail(formData.email)) { showAlert("Please enter a valid email address.", "error"); return; }
    if (formData.password.length < 6) { showAlert("Password must be at least 6 characters.", "error"); return; }

    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, formData.email.trim(), formData.password);
      await updateProfile(cred.user, { displayName: formData.name.trim() });
      await sendEmailVerification(cred.user);
      await afterSignIn(formData.name.trim());
    } catch (err: any) {
      showAlert(friendlyError(err.code), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      await afterSignIn();
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        showAlert(friendlyError(err.code), "error");
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    const email = formData.email.trim();
    if (!isValidEmail(email)) {
      showAlert("Enter your email address first, then request a reset link.", "error");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email, {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      showAlert("Password reset email sent. Check your inbox for the recovery link.", "success");
    } catch (err: any) {
      showAlert(friendlyError(err.code), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    isLogin ? handleLogin() : handleSignup();
  };

  return (
    <>
      <Paper
        elevation={8}
        sx={{
          maxWidth: 380, width: "100%",
          p: 4, borderRadius: 3,
          backgroundColor: "#fff",
          border: "2px solid #1565c0",
        }}
      >
        <Typography variant="h5" fontWeight="bold" gutterBottom color="#1565c0" textAlign="center">
          {isLogin ? "Welcome back" : "Create account"}
        </Typography>

        <Box component="form" onSubmit={handleSubmit} mt={1}>
          {!isLogin && (
            <>
              <TextField label="Full Name" name="name" fullWidth margin="dense"
                value={formData.name} onChange={handleChange} />
              <TextField label="Date of Birth" name="dateOfBirth" type="date"
                fullWidth margin="dense" InputLabelProps={{ shrink: true }}
                value={formData.dateOfBirth} onChange={handleChange}
                inputProps={{ max: new Date().toISOString().split("T")[0] }} />
              <TextField label="Gender" name="gender" select fullWidth margin="dense"
                value={formData.gender} onChange={handleChange}>
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </>
          )}

          <TextField label="Email" name="email" type="email" fullWidth margin="dense"
            value={formData.email} onChange={handleChange} />
          <TextField label="Password" name="password" type="password" fullWidth margin="dense"
            value={formData.password} onChange={handleChange}
            helperText={!isLogin ? "At least 6 characters" : undefined} />

          {isLogin && (
            <Box textAlign="right" mt={0.5}>
              <Link
                component="button"
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handlePasswordReset();
                }}
                underline="hover"
                sx={{ fontSize: "0.875rem", fontWeight: 600 }}
              >
                Forgot password?
              </Link>
            </Box>
          )}

          <Button
            type="submit" fullWidth variant="contained" size="large"
            disabled={loading}
            sx={{ mt: 2, borderRadius: 2, fontWeight: 700, py: 1.2 }}
          >
            {loading
              ? <CircularProgress size={22} color="inherit" />
              : isLogin ? "Login" : "Create Account"}
          </Button>
        </Box>

        <Divider sx={{ my: 2 }}>or</Divider>

        <Button
          fullWidth variant="outlined" size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogle} disabled={loading}
          sx={{ borderRadius: 2, fontWeight: 600, borderColor: "#ddd", color: "text.primary",
            "&:hover": { borderColor: "#1565c0", bgcolor: "#f5f8ff" } }}
        >
          Continue with Google
        </Button>

        <Typography variant="body2" mt={2} textAlign="center">
          {isLogin ? (
            <>Don&apos;t have an account?{" "}
              <Link component="button" onClick={(e) => { e.preventDefault(); setIsLogin(false); }}>
                Sign up
              </Link></>
          ) : (
            <>Already have an account?{" "}
              <Link component="button" onClick={(e) => { e.preventDefault(); setIsLogin(true); }}>
                Log in
              </Link></>
          )}
        </Typography>
      </Paper>

      <Snackbar open={alert.open} autoHideDuration={4000}
        onClose={() => setAlert({ ...alert, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={() => setAlert({ ...alert, open: false })}
          severity={alert.severity} sx={{ width: "100%" }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </>
  );
};

// Map Firebase error codes to user-friendly messages
const friendlyError = (code: string): string => {
  const map: Record<string, string> = {
    "auth/user-not-found":         "No account found with that email.",
    "auth/wrong-password":         "Incorrect password.",
    "auth/invalid-credential":     "Invalid email or password.",
    "auth/email-already-in-use":   "An account with that email already exists.",
    "auth/weak-password":          "Password must be at least 6 characters.",
    "auth/invalid-email":          "Please enter a valid email address.",
    "auth/too-many-requests":      "Too many attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Check your connection.",
    "auth/popup-blocked":          "Popup was blocked. Please allow popups for this site.",
    "auth/missing-email":          "Enter your email address first.",
  };
  return map[code] || "Something went wrong. Please try again.";
};

export default Auth;
