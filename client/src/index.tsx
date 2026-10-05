import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
// import { UserProvider } from './context/UserContext';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

root.render(
  <React.StrictMode>
      {/* Removes the browser's 8px body margin and serif fallback font */}
      <CssBaseline />
      <App />
  </React.StrictMode>
);
