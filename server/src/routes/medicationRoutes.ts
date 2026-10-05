import express from 'express';
import { getMedications, createMedication } from '../controllers/medicationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', authenticateToken, getMedications);
router.post('/', authenticateToken, createMedication);

export default router;
