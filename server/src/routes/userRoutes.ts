import express from 'express';
import { getUsers } from '../controllers/userController';

const router = express.Router();

// Define routes or root route
router.get('/', getUsers);

export default router;
