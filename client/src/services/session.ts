import { signOut } from 'firebase/auth';
import { auth } from './firebase';
import api from './api';

/**
 * Fully sign the current user out: Firebase keeps its own session in
 * IndexedDB and api.ts attaches its ID token to every request, so clearing
 * localStorage alone leaves the next person on this computer signed in.
 */
export async function endSession(): Promise<void> {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  sessionStorage.clear();
  delete api.defaults.headers.common.Authorization;
  try {
    await signOut(auth);
  } catch {
    // Local cleanup above already hides the account in this tab.
  }
}
