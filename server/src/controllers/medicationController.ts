import { Request, Response } from 'express';
import Medication from '../models/Medication';

// GET: Get all medications
export const getMedications = async (req: Request, res: Response) => {
  try {
    const medications = await Medication.find().sort({ created_at: -1 });
    res.json(medications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const createMedication = async (req: Request, res: Response) => {
  try {
    console.log('POST /api/medications HIT');
    console.log('Body:', req.body);

    const {
      medication_name,
      dosage,
      frequency,
      start_date,
      end_date,
      notes,
      user_id,
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
      user_id,
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
