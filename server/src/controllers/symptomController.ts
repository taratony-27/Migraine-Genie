import { Request, Response } from 'express';
import Symptom from '../models/Symptom';

// Get all symptoms
export const getSymptoms = async (req: Request, res: Response) => {
  try {
    const symptoms = await Symptom.find();
    res.json(symptoms);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
