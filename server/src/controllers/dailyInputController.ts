import { Request, Response } from 'express';
import DailyInput from '../models/DailyInput';
import { getAuthenticatedUserId } from '../utils/authUser';
import { vmPathiScoreOf } from '../utils/logFeatures';

/**
 * Normalize a log date to UTC midnight of the calendar day the user picked.
 *
 * The client sends a plain calendar date ("2025-06-09" or "2025-06-09T00:00:00").
 * Anchoring to UTC — instead of the server's local midnight — keeps the stored
 * instant identical regardless of where the API runs, so the day never shifts
 * when it is read back in another timezone.
 */
function startOfDay(dateLike?: string | number | Date): Date {
  if (typeof dateLike === 'string') {
    const match = dateLike.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
    }
  }
  const d = dateLike ? new Date(dateLike) : new Date();
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

const MAX_HOURS = { duration: 72, sleep: 24, screentime: 24 } as const;
const TEXT_LIMIT = 5000;

class InputError extends Error {}

// null (not undefined) so an edit that empties a field actually clears it.
const text = (v: unknown, max = 200): string | null =>
  v === undefined || v === null || v === '' ? null : String(v).slice(0, max);

function hours(field: keyof typeof MAX_HOURS, v: unknown): number | null {
  if (v === undefined || v === null || v === '') return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0 || n > MAX_HOURS[field]) {
    throw new InputError(`${field} must be between 0 and ${MAX_HOURS[field]} hours.`);
  }
  return n;
}

/**
 * Copy only the diary fields a client may set. Anything else in the body
 * (user_id, log_id, vmPathiScore, Mongo operators like $unset) is dropped.
 * Only fields present in the body are returned, so updates stay partial.
 */
function pickDailyInputFields(body: any): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  if (!body || typeof body !== 'object') return out;

  if ('log_date' in body) {
    const day = startOfDay(body.log_date);
    if (Number.isNaN(day.getTime())) throw new InputError('Please choose a valid date.');
    // Allow a day of slack for users ahead of UTC.
    if (day.getTime() > Date.now() + 24 * 60 * 60 * 1000) throw new InputError("The date can't be in the future.");
    out.log_date = day;
  }
  if ('duration' in body) {
    // Stored as text; older entries may hold non-numeric values, which are kept as-is.
    const numeric = body.duration !== null && body.duration !== '' && Number.isFinite(Number(body.duration));
    out.duration = numeric ? String(hours('duration', body.duration)) : text(body.duration, 50);
  }
  if ('intensity' in body) out.intensity = text(body.intensity, 50);
  if ('sleep' in body) out.sleep = hours('sleep', body.sleep);
  if ('screentime' in body) out.screentime = hours('screentime', body.screentime);
  if ('notes' in body) out.notes = text(body.notes, TEXT_LIMIT);
  if ('trigger' in body) {
    const t = body.trigger && typeof body.trigger === 'object' ? body.trigger : {};
    out.trigger = {
      potentialTrigger: text(t.potentialTrigger, 500),
      weather: text(t.weather, 500),
      food: text(t.food, 500),
      activity: text(t.activity, 500),
    };
  }
  if ('symptoms' in body) {
    const raw = body.symptoms && typeof body.symptoms === 'object' && !Array.isArray(body.symptoms) ? body.symptoms : {};
    const symptoms: Record<string, string> = {};
    for (const [key, value] of Object.entries(raw).slice(0, 50)) {
      if (/^[A-Za-z][A-Za-z0-9_]{0,40}$/.test(key)) symptoms[key] = String(value ?? '').slice(0, 20);
    }
    out.symptoms = symptoms;
    // Score is recomputed from the symptoms; the client's number is never trusted.
    out.vmPathiScore = vmPathiScoreOf({ symptoms });
  }
  return out;
}

/** Turn a save error into a status + message that's safe to show the user. */
function saveErrorResponse(error: any, fallback: string): [number, string] {
  if (error instanceof InputError) return [400, error.message];
  if (error?.code === 11000) return [409, 'You already have an entry for this day. Edit it from your history instead.'];
  if (error?.name === 'ValidationError') return [400, 'Please check the entry and try again.'];
  if (error?.name === 'CastError') return [404, 'Entry not found'];
  console.error(fallback, error);
  return [500, fallback];
}

/**
 * Return daily inputs for the authenticated Firebase user.
 */
export const getDailyInputs = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const dailyInputs = await DailyInput.find({ user_id: userId })
      .sort({ log_date: -1 })
      .lean();

    res.json(dailyInputs);
  } catch (error) {
    console.error('getDailyInputs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Return { count, canPredict } for the authenticated user.
 */
export const getMyDailyInputCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    // Count ALL entries for this user
    const count = await DailyInput.countDocuments({ user_id: userId });
    const canPredict = count >= 10;

    res.json({ count, canPredict });
  } catch (error) {
    console.error('getMyDailyInputCount error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Normalize log_date to start-of-day before save.
 * Force user_id from the authenticated Firebase user.
 */
export const createDailyInput = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const payload: Record<string, unknown> = {
      ...pickDailyInputFields(req.body),
      user_id: userId,
      log_id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
    };
    // The server can't know the user's local "today", so the date is required.
    if (!payload.log_date) {
      res.status(400).json({ message: 'Date is required.' });
      return;
    }

    const newLog = new DailyInput(payload);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    const [status, message] = saveErrorResponse(error, 'Failed to save entry');
    res.status(status).json({ message });
  }
};

export const updateDailyInput = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const update = pickDailyInputFields(req.body);

    // Ownership is enforced by matching the caller's user_id; $set keeps the
    // update to the allowed fields only.
    const updatedLog = await DailyInput.findOneAndUpdate(
      { _id: id, user_id: userId },
      { $set: update },
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }

    res.json(updatedLog);
  } catch (error) {
    const [status, message] = saveErrorResponse(error, 'Failed to update entry');
    res.status(status).json({ message });
  }
};

export const deleteDailyInput = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const deletedLog = await DailyInput.findOneAndDelete({ _id: id, user_id: userId });
    if (!deletedLog) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    const [status, message] = saveErrorResponse(error, 'Failed to delete entry');
    res.status(status).json({ message });
  }
};

