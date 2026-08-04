import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Button, Paper, Grid,
  TextField, MenuItem, Snackbar, Alert, Container, Chip, Stack,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DashboardIcon from '@mui/icons-material/Dashboard';
import LockResetIcon from '@mui/icons-material/LockReset';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import PersonIcon from '@mui/icons-material/Person';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { sendPasswordResetEmail, signOut } from 'firebase/auth';
import { auth } from '../services/firebase';
import api from '../services/api';

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{
    name: string; email: string; joined: string;
    dateOfBirth?: string; gender?: string;
    totalEntries: number; recentIntensity: string;
  } | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [busyAction, setBusyAction] = useState<'save' | 'reset' | 'delete' | null>(null);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false, message: '', severity: 'success',
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const fullUser = {
        name: parsed.name,
        email: parsed.email,
        joined: parsed.joined || 'Unknown',
        dateOfBirth: parsed.date_of_birth?.slice(0, 10) || '',
        gender: parsed.gender || '',
        totalEntries: parsed.totalEntries ?? 0,
        recentIntensity: parsed.recentIntensity ?? 'N/A',
      };
      setUser(fullUser);
      setEditedUser(fullUser);
    }
  }, []);

  const handleEditChange = (field: string, value: string) =>
    setEditedUser({ ...editedUser, [field]: value });

  const handleSave = async () => {
    setBusyAction('save');
    try {
      const payload = { name: editedUser.name, dateOfBirth: editedUser.dateOfBirth || null, gender: editedUser.gender || null };
      const res = await api.put('/api/users/update', payload);
      const returned = (res?.data?.user ?? res?.data) || {};
      const updated = {
        ...user,
        name: returned.name ?? payload.name ?? user?.name,
        email: user?.email ?? returned.email,
        joined: user?.joined ?? 'Unknown',
        dateOfBirth: (returned.date_of_birth ? String(returned.date_of_birth).slice(0, 10) : undefined) ?? editedUser.dateOfBirth ?? user?.dateOfBirth ?? '',
        gender: returned.gender ?? editedUser.gender ?? user?.gender ?? '',
        totalEntries: user?.totalEntries ?? 0,
        recentIntensity: user?.recentIntensity ?? 'N/A',
      } as typeof user;

      setUser(updated);
      setEditedUser(updated);
      localStorage.setItem('user', JSON.stringify({
        ...JSON.parse(localStorage.getItem('user') || '{}'),
        name: updated?.name, email: updated?.email, joined: updated?.joined,
        date_of_birth: updated?.dateOfBirth ? `${updated.dateOfBirth}T00:00:00` : null,
        gender: updated?.gender, totalEntries: updated?.totalEntries, recentIntensity: updated?.recentIntensity,
      }));
      setAlert({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setEditMode(false);
    } catch (err: any) {
      setAlert({ open: true, message: err?.response?.data?.message || 'Update failed', severity: 'error' });
    } finally {
      setBusyAction(null);
    }
  };

  const handleResetPassword = async () => {
    if (!user?.email) return;
    setBusyAction('reset');
    try {
      await sendPasswordResetEmail(auth, user.email, {
        url: window.location.origin,
        handleCodeInApp: false,
      });
      setAlert({ open: true, message: `Password reset email sent to ${user.email}`, severity: 'success' });
    } catch (err: any) {
      setAlert({ open: true, message: err?.message || 'Password reset failed', severity: 'error' });
    } finally {
      setBusyAction(null);
    }
  };

  const clearSessionAndGoHome = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete api.defaults.headers.common.Authorization;
    try {
      await signOut(auth);
    } catch {
      // Local session cleanup above is enough for navigation state.
    }
    navigate('/');
  };

  const handleDeleteAccount = async () => {
    setBusyAction('delete');
    try {
      await api.delete('/api/users/me');
      await clearSessionAndGoHome();
    } catch (err: any) {
      setAlert({
        open: true,
        message: err?.response?.data?.message || 'Delete account failed',
        severity: 'error',
      });
      setBusyAction(null);
    }
  };

  if (!user) {
    return (
      <Box minHeight="60vh" display="flex" justifyContent="center" alignItems="center">
        <Typography color="text.secondary">Loading profile…</Typography>
      </Box>
    );
  }

  const avatarSize = { xs: 72, sm: 88 };
  const avatarFontSize = { xs: '1.8rem', sm: '2.2rem' };

  return (
    <Box sx={{ bgcolor: '#eef3f8', minHeight: '100dvh', py: { xs: 3, md: 6 } }}>
      <Container maxWidth="md">
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} spacing={2} mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={900} color="text.primary">Account</Typography>
            <Typography variant="body2" color="text.secondary">Manage your profile, login access, and account data.</Typography>
          </Box>
          <Button variant="contained" startIcon={<DashboardIcon />} onClick={() => navigate('/dashboard')} sx={{ borderRadius: 2, fontWeight: 800 }}>
            Dashboard
          </Button>
        </Stack>

        {/* Profile card */}
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', overflow: 'hidden', mb: 3, bgcolor: '#fff' }}>

          {/* Header strip */}
          <Box sx={{ bgcolor: 'primary.main', height: 96 }} />

          {/* Avatar + name */}
          <Box sx={{ px: { xs: 2.5, sm: 4 }, pb: 4, mt: '-44px' }}>
            <Avatar
              sx={{
                width: avatarSize, height: avatarSize,
                bgcolor: '#fff', color: 'primary.main',
                fontSize: avatarFontSize, fontWeight: 800,
                border: '4px solid #fff', boxShadow: '0 2px 12px rgba(0,0,0,0.12)',
              }}
            >
              {user.name?.[0]?.toUpperCase() || '?'}
            </Avatar>

            <Box mt={1.5}>
              {editMode ? (
                <Stack spacing={2} mt={2}>
                  <TextField label="Full Name" value={editedUser.name} onChange={(e) => handleEditChange('name', e.target.value)} fullWidth size="small" />
                  <TextField label="Date of Birth" type="date" value={editedUser.dateOfBirth} onChange={(e) => handleEditChange('dateOfBirth', e.target.value)} InputLabelProps={{ shrink: true }} fullWidth size="small" />
                  <TextField label="Gender" select value={editedUser.gender} onChange={(e) => handleEditChange('gender', e.target.value)} fullWidth size="small">
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </TextField>
                </Stack>
              ) : (
                <>
                  <Typography variant="h5" fontWeight={900} color="text.primary">{user.name}</Typography>
                  <Typography variant="body2" color="text.secondary">{user.email}</Typography>
                  <Box display="flex" gap={1} mt={1} flexWrap="wrap">
                    {user.gender && <Chip label={user.gender} size="small" variant="outlined" />}
                    <Chip label={`Joined ${user.joined}`} size="small" variant="outlined" />
                    {user.dateOfBirth && <Chip label={`DOB: ${user.dateOfBirth}`} size="small" variant="outlined" />}
                  </Box>
                </>
              )}
            </Box>
          </Box>
        </Paper>

        {/* Stats */}
        <Grid container spacing={2} mb={3}>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center', bgcolor: '#fff' }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">{user.totalEntries}</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>Total Entries</Typography>
            </Paper>
          </Grid>
          <Grid item xs={6}>
            <Paper elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', textAlign: 'center', bgcolor: '#fff' }}>
              <Typography variant="h4" fontWeight={800} color="primary.main">{user.recentIntensity}</Typography>
              <Typography variant="body2" color="text.secondary" mt={0.5}>Recent Intensity</Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Actions */}
        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fff', mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <PersonIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={900}>Profile</Typography>
              <Typography variant="body2" color="text.secondary">Keep your personal details up to date.</Typography>
            </Box>
          </Stack>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          {editMode ? (
            <>
              <Button variant="outlined" fullWidth onClick={() => setEditMode(false)}>Cancel</Button>
              <Button variant="contained" fullWidth onClick={handleSave} disabled={busyAction === 'save'}>
                {busyAction === 'save' ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button variant="outlined" fullWidth startIcon={<EditIcon />} onClick={() => setEditMode(true)}>
              Edit Profile
            </Button>
          )}
          </Stack>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: '#fff', mb: 3 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <LockResetIcon color="primary" />
            <Box>
              <Typography variant="h6" fontWeight={900}>Login Access</Typography>
              <Typography variant="body2" color="text.secondary">Send a password reset link to your account email.</Typography>
            </Box>
          </Stack>
          <Button variant="contained" fullWidth startIcon={<LockResetIcon />} onClick={handleResetPassword} disabled={busyAction === 'reset'}>
            {busyAction === 'reset' ? 'Sending...' : 'Send Password Reset Email'}
          </Button>
        </Paper>

        <Paper elevation={0} sx={{ p: { xs: 2.5, sm: 3 }, borderRadius: 3, border: '1px solid', borderColor: 'error.light', bgcolor: '#fff' }}>
          <Stack direction="row" spacing={1.5} alignItems="center" mb={2}>
            <WarningAmberIcon color="error" />
            <Box>
              <Typography variant="h6" fontWeight={900}>Danger Zone</Typography>
              <Typography variant="body2" color="text.secondary">Permanently remove your account and saved migraine data.</Typography>
            </Box>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          <Button variant="outlined" color="error" fullWidth startIcon={<DeleteOutlineIcon />} onClick={() => setDeleteOpen(true)}>
            Delete Account
          </Button>
        </Paper>

        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ fontWeight: 900 }}>Delete account?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              This permanently deletes your profile and saved health records. This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button onClick={() => setDeleteOpen(false)} disabled={busyAction === 'delete'}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteAccount} disabled={busyAction === 'delete'}>
              {busyAction === 'delete' ? 'Deleting...' : 'Delete Account'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>

      <Snackbar open={alert.open} autoHideDuration={3000} onClose={() => setAlert({ ...alert, open: false })} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert onClose={() => setAlert({ ...alert, open: false })} severity={alert.severity} sx={{ width: '100%' }}>
          {alert.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Account;
