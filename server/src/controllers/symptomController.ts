import { Request, Response } from 'express';
import Symptom from '../models/Symptom';
import { getAuthenticatedUserId } from '../utils/authUser';

// Get the signed-in user's symptoms
export const getSymptoms = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const symptoms = await Symptom.find({ user_id: userId });
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
