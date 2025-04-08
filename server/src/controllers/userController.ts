import { Request, Response } from 'express';
import User from '../models/User';

// GET, POST, PUT, DELETE

// Get all users
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error });
  }
};

// Update user


// Delete user (Start)


// Create/Post user

