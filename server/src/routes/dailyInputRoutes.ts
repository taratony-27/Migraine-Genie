import express from 'express';
import { getDailyInputs } from '../controllers/dailyInputController';

const router = express.Router();

// GET all daily inputs
router.get('/', getDailyInputs);

export default router;
