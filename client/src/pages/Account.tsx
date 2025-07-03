import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Avatar, Button, Paper, Grid, Divider,
  TextField, MenuItem, Snackbar, Alert
} from '@mui/material';
import axios from 'axios';

const Account: React.FC = () => {
  const [user, setUser] = useState<{
    name: string;
    email: string;
    joined: string;
    dateOfBirth?: string;
    gender?: string;
    totalEntries: number;
    recentIntensity: string;
  } | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState<any>(null);
  const [alert, setAlert] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      const fullUser = {
        name: parsed.name,
        email: parsed.email,
        joined: parsed.joined || 'Unknown',
        dateOfBirth: parsed.date_of_birth?.slice(0, 10) || '', // ISO to YYYY-MM-DD
        gender: parsed.gender || '',
        totalEntries: parsed.totalEntries ?? 0,
        recentIntensity: parsed.recentIntensity ?? 'N/A',
      };
      setUser(fullUser);
      setEditedUser(fullUser);
    }
  }, []);

  const handleEditChange = (field: string, value: string) => {
    setEditedUser({ ...editedUser, [field]: value });
  };

  const handleSave = async () => {
    try {
      const res = await axios.put('http://localhost:3001/api/users/update', {
        name: editedUser.name,
        dateOfBirth: editedUser.dateOfBirth,
        gender: editedUser.gender,
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      const updated = {
        ...user,
        ...res.data,
        joined: user?.joined ?? 'Unknown', // fallback
      };
      setUser(updated);
      setEditedUser(updated);
      localStorage.setItem('user', JSON.stringify(updated));
      setAlert({ open: true, message: 'Profile updated successfully', severity: 'success' });
      setEditMode(false);
    } catch (err: any) {
      setAlert({ open: true, message: err?.response?.data?.message || 'Update failed', severity: 'error' });
    }
  };

  if (!user) {
    return (
      <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f4faff">
        <Typography variant="h6" color="textSecondary">Loading user info...</Typography>
      </Box>
    );
  }

  return (
    <Box minHeight="100vh" display="flex" justifyContent="center" alignItems="center" bgcolor="#f4faff" px={2}>
      <Paper elevation={6} sx={{ maxWidth: 700, width: '100%', padding: 4, borderRadius: 4, backgroundColor: '#ffffff' }}>
        <Box display="flex" alignItems="center" flexDirection="column" textAlign="center" mb={4}>
          <Avatar sx={{ width: 96, height: 96, bgcolor: '#1565c0', fontSize: 36 }}>
            {user.name[0]}
          </Avatar>

          {editMode ? (
            <>
              <TextField
                label="Name"
                value={editedUser.name}
                onChange={(e) => handleEditChange('name', e.target.value)}
                margin="dense"
                fullWidth
              />
              <TextField
                label="Date of Birth"
                type="date"
                value={editedUser.dateOfBirth}
                onChange={(e) => handleEditChange('dateOfBirth', e.target.value)}
                InputLabelProps={{ shrink: true }}
                margin="dense"
                fullWidth
              />
              <TextField
                label="Gender"
                select
                value={editedUser.gender}
                onChange={(e) => handleEditChange('gender', e.target.value)}
                margin="dense"
                fullWidth
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </TextField>
            </>
          ) : (
            <>
              <Typography variant="h4" fontWeight="bold" mt={2} color="#1565c0">
                {user.name}
              </Typography>
              <Typography variant="body1" color="textSecondary">
                {user.email}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Joined: {user.joined}
              </Typography>
            </>
          )}
        </Box>

        <Divider sx={{ mb: 3, borderColor: '#90caf9' }} />

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ padding: 2 }}>
              <Typography variant="h6" color="#1565c0">
                Total Entries
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {user.totalEntries}
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Paper elevation={2} sx={{ padding: 2 }}>
              <Typography variant="h6" color="#1565c0">
                Recent Migraine Intensity
              </Typography>
              <Typography variant="h4" fontWeight="bold">
                {user.recentIntensity}
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        <Box mt={5} display="flex" justifyContent="center" gap={2}>
          {editMode ? (
            <>
              <Button variant="outlined" color="primary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button variant="contained" color="primary" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="outlined" color="primary" onClick={() => setEditMode(true)}>
                Edit Profile
              </Button>
              <Button
                variant="contained"
                color="primary"
                href="/dashboard"
                sx={{ backgroundColor: '#1565c0', '&:hover': { backgroundColor: '#0d47a1' } }}
              >
                Go to Dashboard
              </Button>
            </>
          )}
        </Box>

        <Snackbar
          open={alert.open}
          autoHideDuration={3000}
          onClose={() => setAlert({ ...alert, open: false })}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={() => setAlert({ ...alert, open: false })}
            severity={alert.severity}
            sx={{ width: '100%' }}
          >
            {alert.message}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
};

export default Account;
