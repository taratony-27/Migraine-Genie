import { Request } from 'express';
import User from '../models/User';

/**
 * Numeric user_id of the signed-in Firebase user, looked up from the verified
 * token — never from the request body or query, which the caller controls.
 */
export async function getAuthenticatedUserId(req: Request): Promise<number | undefined> {
  if (!req.user?.uid) return undefined;

  const user = await User.findOne({ firebase_uid: req.user.uid }).select('user_id').lean();
  return typeof user?.user_id === 'number' ? user.user_id : undefined;
}
