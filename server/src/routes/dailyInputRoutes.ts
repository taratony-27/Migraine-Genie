import express from 'express';
import {
  getDailyInputs,
  createDailyInput,
  updateDailyInput,
  deleteDailyInput
} from '../controllers/dailyInputController';

const router = express.Router();

// GET all daily inputs
router.get('/', getDailyInputs);

// POST a new daily input
router.post('/', createDailyInput);

// PUT to update a daily input by ID
router.put('/:id', updateDailyInput);

// DELETE a daily input by ID
router.delete('/:id', deleteDailyInput);

export default router;
