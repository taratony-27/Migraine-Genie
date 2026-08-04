import express from 'express';
import {
  getDailyInputs,
  createDailyInput,
  updateDailyInput,
  deleteDailyInput,
  getMyDailyInputCount,
} from '../controllers/dailyInputController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);

router.get('/my/count', getMyDailyInputCount);

router.get('/', getDailyInputs);

router.post('/', createDailyInput);

router.put('/:id', updateDailyInput);

router.delete('/:id', deleteDailyInput);

export default router;
