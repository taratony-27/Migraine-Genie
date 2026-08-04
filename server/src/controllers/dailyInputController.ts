import { Request, Response } from 'express';
import DailyInput from '../models/DailyInput';
import User from '../models/User';

/**
 * [UNCHANGED]
 * Normalize a Date to the start of the day (00:00:00.000).
 */
function startOfDay(dateLike?: string | number | Date): Date {
  const d = dateLike ? new Date(dateLike) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

async function getAuthenticatedUserId(req: Request): Promise<number | undefined> {
  if (!req.user?.uid) return undefined;

  const user = await User.findOne({ firebase_uid: req.user.uid }).select('user_id').lean();
  return typeof user?.user_id === 'number' ? user.user_id : undefined;
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
    res.status(500).json({ message: 'Server error', error });
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
    res.status(500).json({ message: 'Server error', error });
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

    const payload = { ...req.body };

    // Ensure numeric user_id matches schema
    payload.user_id = userId;

    // Normalize log_date (default to "today" if missing)
    payload.log_date = startOfDay(payload.log_date);

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
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const update = { ...req.body };

    // Keep normalization consistent if date is being changed
    if (update.log_date) {
      update.log_date = startOfDay(update.log_date);
    }
    update.user_id = userId;

    // Enforce ownership by user_id even without auth (caller must supply userId)
    const updatedLog = await DailyInput.findOneAndUpdate(
      { _id: id, user_id: userId },
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
    res.status(500).json({ message: 'Failed to delete entry', error });
  }
};

