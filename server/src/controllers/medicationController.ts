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
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
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
      taken,
    } = req.body;

    if (start_date && end_date && new Date(end_date) < new Date(start_date)) {
      res.status(400).json({ message: "The end date can't be before the start date." });
      return;
    }

    const newMedication = new Medication({
      medication_name,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      // Owner and ID are set here; any user_id / medication_id in the body is ignored.
      user_id: userId,
      medication_id: Date.now() * 1000 + Math.floor(Math.random() * 1000),
      taken: taken !== false,
    });

    const saved = await newMedication.save();
    res.status(201).json(saved);
  } catch (error: any) {
    console.error('Failed to save medication:', error.message || error);
    const message = error?.name === 'ValidationError'
      ? 'Please fill in the medication name, dosage, frequency and start date.'
      : 'Failed to save medication.';
    res.status(400).json({ message });
  }
};
