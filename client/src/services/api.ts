import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL = process.env.REACT_APP_API_BASE || 'http://localhost:5001';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Attach a fresh Firebase ID token to every request automatically.
// Firebase handles token refresh transparently — getIdToken() returns a
// cached token and only fetches a new one when it's about to expire.
api.interceptors.request.use(async (config) => {
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    config.headers['Authorization'] = `Bearer ${token}`;
  } else {
    // Fallback: use whatever token is in localStorage (e.g. during page load
    // before Firebase has rehydrated the auth state).
    const stored = localStorage.getItem('token');
    if (stored) config.headers['Authorization'] = `Bearer ${stored}`;
  }
  return config;
});

export default api;
