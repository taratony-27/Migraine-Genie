import { Request, Response } from 'express';
import Medication from '../models/Medication';

// Get all medications
export const getMedications = async (req: Request, res: Response) => {
  try {
    const medications = await Medication.find();
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
