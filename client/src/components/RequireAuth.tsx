import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '../services/firebase';

/**
 * Shows the page only to a signed-in Firebase user. Waits for Firebase to
 * restore the session first, so signed-in users don't get bounced on refresh
 * and signed-out visitors never see a flash of the app.
 */
const RequireAuth: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  // undefined = Firebase hasn't reported yet
  const [user, setUser] = useState<User | null | undefined>(auth.currentUser ?? undefined);

  useEffect(() => onAuthStateChanged(auth, setUser), []);

  if (user === undefined) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress aria-label="Loading" />
      </Box>
    );
  }

  return user ? children : <Navigate to="/" replace />;
};

export default RequireAuth;
