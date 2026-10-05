import axios from 'axios';
import { auth } from './firebase';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE ||
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5001'
    : window.location.origin);

const api = axios.create({
  baseURL: API_BASE_URL.replace(/\/$/, ''),
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

// The free Render instance sleeps when idle and takes up to a minute to wake.
// When any request is still pending after SLOW_MS, fire a window event so the
// UI can explain the wait (see components/ServerWakeNotice.tsx).
export const API_SLOW_EVENT = 'api-slow';
const SLOW_MS = 5000;
let pending = 0;
let slowTimer: ReturnType<typeof setTimeout> | undefined;
const setSlow = (slow: boolean) => window.dispatchEvent(new CustomEvent(API_SLOW_EVENT, { detail: slow }));

const requestStarted = () => {
  pending += 1;
  if (pending === 1) slowTimer = setTimeout(() => setSlow(true), SLOW_MS);
};
const requestFinished = () => {
  pending = Math.max(0, pending - 1);
  if (pending === 0) {
    clearTimeout(slowTimer);
    setSlow(false);
  }
};

api.interceptors.request.use((config) => {
  requestStarted();
  return config;
});
api.interceptors.response.use(
  (res) => { requestFinished(); return res; },
  (err) => { requestFinished(); return Promise.reject(err); }
);

export default api;
