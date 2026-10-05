import express from 'express';
import { getSymptoms } from '../controllers/symptomController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET the signed-in user's symptoms
router.get('/', authenticateToken, getSymptoms);

export default router;
