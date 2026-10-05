import express from 'express';
import { getTriggers } from '../controllers/triggerController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Define routes
router.get('/', authenticateToken, getTriggers);

export default router;
