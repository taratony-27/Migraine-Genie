import { Request, Response, NextFunction } from 'express';
import admin from '../services/firebaseAdmin';

// Extend Express Request to carry the verified Firebase user
declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      uid: string;       // Firebase UID — use this as the primary identifier
      email?: string;
      name?: string;
    };
  }
}

export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Access token missing' });
    return;
  }

  try {
    const decoded = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decoded.uid,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (err) {
    console.error('[Auth] Firebase token verification failed:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
