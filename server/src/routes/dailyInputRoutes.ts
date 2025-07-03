import express from 'express';
import { getDailyInputs, createDailyInput } from '../controllers/dailyInputController';

const router = express.Router();

// GET all daily inputs
router.get('/', getDailyInputs);
router.post('/', createDailyInput);

export default router;
