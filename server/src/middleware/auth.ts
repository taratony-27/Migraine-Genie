import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'secretkey';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

// Extend Request type to include user object
declare module 'express-serve-static-core' {
  interface Request {
    user?: { id: string };
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.split(' ')[1]; // Format: Bearer <token>

  if (!token) {
    res.status(401).json({ message: 'Access token missing' });
    return;
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY) as JwtPayload;
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    console.error('JWT verification failed:', err);
    res.status(403).json({ message: 'Invalid or expired token' });
  }
};
