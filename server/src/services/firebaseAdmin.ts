import { initializeApp, cert, getApps, App, ServiceAccount } from 'firebase-admin/app';
import path from 'path';
import fs from 'fs';

let app: App;

const parseServiceAccount = (raw: string): ServiceAccount => {
  const source = raw.trim().startsWith('{')
    ? raw
    : Buffer.from(raw.trim(), 'base64').toString('utf8');
  const serviceAccount = JSON.parse(source);

  if (typeof serviceAccount.private_key === 'string') {
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
  }

  return serviceAccount;
};

if (!getApps().length) {
  // Option A (recommended for local dev): point FIREBASE_SERVICE_ACCOUNT_PATH
  // to the JSON file you downloaded from Firebase Console →
  // Project Settings → Service accounts → Generate new private key
  const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;

  // Option B: paste the entire JSON as an env var FIREBASE_SERVICE_ACCOUNT_JSON
  const keyJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;

  if (keyPath) {
    const resolved = path.isAbsolute(keyPath)
      ? keyPath
      : path.resolve(process.cwd(), keyPath);
    const serviceAccount = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    app = initializeApp({ credential: cert(serviceAccount) });
  } else if (keyJson) {
    const serviceAccount = parseServiceAccount(keyJson);
    app = initializeApp({ credential: cert(serviceAccount) });
  } else {
    console.warn(
      '[Firebase Admin] No service account configured. ' +
      'Set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON in your .env'
    );
    // Initialize without credentials so the rest of the app doesn't crash.
    // Token verification will fail until credentials are provided.
    app = initializeApp();
  }
} else {
  app = getApps()[0];
}

export default app;
