import { Request, Response } from 'express';
import Trigger from '../models/Trigger';
import { getAuthenticatedUserId } from '../utils/authUser';

// Get the signed-in user's triggers
export const getTriggers = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const triggers = await Trigger.find({ user_id: userId });
    res.json(triggers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
