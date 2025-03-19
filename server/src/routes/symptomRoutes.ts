import express from 'express';
import { getSymptoms } from '../controllers/symptomController';

const router = express.Router();

// GET all symptoms
router.get('/', getSymptoms);

export default router;
