import { Request, Response } from 'express';
import DailyInput from '../models/DailyInput';

/**
 * [UNCHANGED]
 * Normalize a Date to the start of the day (00:00:00.000).
 */
function startOfDay(dateLike?: string | number | Date): Date {
  const d = dateLike ? new Date(dateLike) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * [MODIFIED]
 * Since auth is removed, we derive userId from:
 *   1) req.query.userId
 *   2) req.params.userId
 *   3) req.body.user_id
 * Return a STRING (raw) to allow flexible parsing.
 */
function getUserIdRaw(req: Request): string | undefined {
  // Prioritize query, then params, then body
  const q = (req.query?.userId as string) ?? undefined;
  const p = (req.params?.userId as string) ?? undefined;
  // body may be number or string; normalize to string for parsing
  const b =
    req.body && (req.body.user_id !== undefined && req.body.user_id !== null)
      ? String(req.body.user_id)
      : undefined;
  return q ?? p ?? b;
}

/**
 * [MODIFIED]
 * Convert raw to NUMBER (your schema uses Number for user_id).
 */
function getUserIdNumber(req: Request): number | undefined {
  const raw = getUserIdRaw(req);
  if (raw === undefined) return undefined;
  const n = Number(raw);
  return Number.isFinite(n) ? n : undefined;
}

/**
 * [MODIFIED]
 * SECURITY/UX change from earlier draft:
 * - No auth. We now *require* a userId via query/params/body.
 * - Returns 400 if userId missing (not 401).
 */
export const getDailyInputs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdNumber(req);
    if (userId === undefined) {
      res.status(400).json({ message: 'userId is required (via ?userId= or body.user_id)' }); // [MODIFIED]
      return;
    }

    const dailyInputs = await DailyInput.find({ user_id: userId })
      .sort({ log_date: -1 })
      .lean();

    res.json(dailyInputs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * [MODIFIED]
 * New endpoint:
 * Return { count, canPredict } for the specified user (no auth).
 * Counting DISTINCT DAYS with $dateTrunc so multiple same-day saves don't inflate count.
 */
export const getMyDailyInputCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = getUserIdNumber(req);
    if (userId === undefined) {
      res.status(400).json({ message: 'userId is required (via ?userId= or body.user_id)' }); // [MODIFIED]
      return;
    }

    // Count ALL entries for this user
    const count = await DailyInput.countDocuments({ user_id: userId });
    const canPredict = count >= 10;

    res.json({ count, canPredict });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

/**
 * [MODIFIED]
 * Normalize log_date to start-of-day before save.
 * Force/derive user_id from query/body; no auth context anymore.
 */
export const createDailyInput = async (req: Request, res: Response): Promise<void> => {
  try {
    // Prefer body.user_id if client is already sending it; else fall back to query
    let userId = typeof req.body.user_id === 'number' ? req.body.user_id : getUserIdNumber(req); // [MODIFIED]
    if (userId === undefined) {
      res.status(400).json({ message: 'userId is required (via ?userId= or body.user_id)' }); // [MODIFIED]
      return;
    }

    const payload = { ...req.body };

    // Ensure numeric user_id matches schema
    payload.user_id = userId; // [MODIFIED]

    // Normalize log_date (default to "today" if missing)
    payload.log_date = startOfDay(payload.log_date); // [MODIFIED]

    const newLog = new DailyInput(payload);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to save entry', error });
  }
};

export const updateDailyInput = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const userId = getUserIdNumber(req); // [MODIFIED]
    if (userId === undefined) {
      res.status(400).json({ message: 'userId is required (via ?userId= or body.user_id)' }); // [MODIFIED]
      return;
    }

    const update = { ...req.body };

    // Keep normalization consistent if date is being changed
    if (update.log_date) {
      update.log_date = startOfDay(update.log_date); // [MODIFIED]
    }

    // Enforce ownership by user_id even without auth (caller must supply userId)
    const updatedLog = await DailyInput.findOneAndUpdate(
      { _id: id, user_id: userId }, // [MODIFIED]
      update,
      { new: true }
    );

    if (!updatedLog) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    res.json(updatedLog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to update entry', error });
  }
};

export const deleteDailyInput = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const userId = getUserIdNumber(req); // [MODIFIED]
    if (userId === undefined) {
      res.status(400).json({ message: 'userId is required (via ?userId= or body.user_id)' }); // [MODIFIED]
      return;
    }

    const deletedLog = await DailyInput.findOneAndDelete({ _id: id, user_id: userId }); // [MODIFIED]
    if (!deletedLog) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete entry', error });
  }
};

