import { Request, Response } from 'express';
import Medication from '../models/Medication';
import { getAuthenticatedUserId } from '../utils/authUser';

// GET: the signed-in user's medications
export const getMedications = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const medications = await Medication.find({ user_id: userId }).sort({ created_at: -1 });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    const userId = await getAuthenticatedUserId(req);
    if (userId === undefined) {
      res.status(403).json({ message: 'Authenticated user profile not found' });
      return;
    }

    const {
      medication_name,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      medication_id,
      taken,
      created_at,
    } = req.body;

    const newMedication = new Medication({
      medication_name,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      // Owner comes from the verified token; any user_id in the body is ignored.
      user_id: userId,
      medication_id,
      taken,
      created_at,
    });

    const saved = await newMedication.save();
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Failed to save medication:', error.message || error);
    res.status(400).json({ message: 'Failed to save medication', error: error.message || error });
  }
};
