import { Request, Response } from 'express';
import Trigger from '../models/Trigger';

// Get all triggers
export const getTriggers = async (req: Request, res: Response) => {
  try {
    const triggers = await Trigger.find();
    res.json(triggers);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
