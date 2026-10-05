import React, { useEffect, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';
import { API_SLOW_EVENT } from '../services/api';

// Explains long waits: the API's free hosting sleeps when idle, so the first
// request after a quiet spell can take up to a minute.
const ServerWakeNotice: React.FC = () => {
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    const onSlow = (e: Event) => setSlow(Boolean((e as CustomEvent<boolean>).detail));
    window.addEventListener(API_SLOW_EVENT, onSlow);
    return () => window.removeEventListener(API_SLOW_EVENT, onSlow);
  }, []);

  return (
    <Snackbar open={slow} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
      <Alert severity="info" variant="filled" sx={{ width: '100%' }}>
        Still working… If the app has been idle, the server can take up to a minute to wake up.
      </Alert>
    </Snackbar>
  );
};

export default ServerWakeNotice;
