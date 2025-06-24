import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User';

// Get all users
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error: any) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// User Login
export const loginUser = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      res.status(400).json({ message: 'Email and password are required' });
      return;
    }

    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ message: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign({ id: user._id }, 'secretkey', { expiresIn: '1d' });

    res.json({ token, user });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Login error', error: err.message || String(err) });
  }
};

// User Signup
export const signupUser = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log('📩 Signup request received:', req.body);

    const { name, email, password, date_of_birth, gender } = req.body;

    // Basic validation
    if (!name || !email || !password || !date_of_birth || !gender) {
      res.status(400).json({ message: 'All fields are required' });
      return;
    }

    const validGenders = ['male', 'female', 'other'];
    if (!validGenders.includes(gender)) {
      res.status(400).json({ message: 'Invalid gender value' });
      return;
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(409).json({ message: 'Email already in use' });
      return;
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = new User({
      user_id: Date.now(),
      name,
      email,
      password_hash,
      date_of_birth: new Date(date_of_birth),
      gender
    });

    const savedUser = await newUser.save();
    console.log('✅ New user created:', savedUser);

    res.status(201).json(savedUser);
  } catch (err: any) {
    console.error('❌ Signup error:', err);
    res.status(500).json({ message: 'Signup error', error: err.message || String(err) });
  }
};
