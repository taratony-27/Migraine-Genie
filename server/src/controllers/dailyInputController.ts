import { Request, Response } from 'express';
import DailyInput from '../models/DailyInput';

export const getDailyInputs = async (req: Request, res: Response): Promise<void> => {
  try {
    const dailyInputs = await DailyInput.find().sort({ log_date: -1 });
    res.json(dailyInputs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

// export const getDailyInputsByUser = async (req: Request, res: Response): Promise<void> => {
//   const userId = req.params.userId;
//   try {
//     const dailyInputs = await DailyInput.find({ user_id: userId }).sort({ log_date: -1 });
//     res.json(dailyInputs);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error', error });
//   }
// };

export const createDailyInput = async (req: Request, res: Response): Promise<void> => {
  try {
    const newLog = new DailyInput(req.body);
    await newLog.save();
    res.status(201).json(newLog);
  } catch (error) {
    res.status(400).json({ message: 'Failed to save entry', error });
  }
};

export const updateDailyInput = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  try {
    const updatedLog = await DailyInput.findByIdAndUpdate(id, req.body, { new: true });
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
    const deletedLog = await DailyInput.findByIdAndDelete(id);
    if (!deletedLog) {
      res.status(404).json({ message: 'Entry not found' });
      return;
    }
    res.json({ message: 'Entry deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete entry', error });
  }
};
