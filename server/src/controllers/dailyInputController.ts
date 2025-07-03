// --- src/controllers/dailyInputController.ts ---
import { Request, Response } from 'express';
import DailyInput from '../models/DailyInput';

export const getDailyInputs = async (req: Request, res: Response) => {
  try {
    const dailyInputs = await DailyInput.find().sort({ log_date: -1 });
    res.json(dailyInputs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// export const getDailyInputsByUser = async (req: Request, res: Response) => {
//   const userId = req.params.userId;
//   try {
//     const dailyInputs = await DailyInput.find({ user_id: userId }).sort({ log_date: -1 });
//     res.json(dailyInputs);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

export const createDailyInput = async (req: Request, res: Response) => {
  try {
    const newLog = new DailyInput(req.body);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to save entry', error });
  }
};