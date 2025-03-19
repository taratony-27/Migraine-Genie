import { Request, Response } from 'express';
import DailyInput from '../models/DailyInput';

// Get all daily inputs
export const getDailyInputs = async (req: Request, res: Response) => {
  try {
    const dailyInputs = await DailyInput.find();
    res.json(dailyInputs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
