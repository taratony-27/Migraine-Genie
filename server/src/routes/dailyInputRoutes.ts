import express from 'express';
import {
  getDailyInputs,
  createDailyInput,
  updateDailyInput,
  deleteDailyInput,
  getMyDailyInputCount, // [UNCHANGED]
} from '../controllers/dailyInputController';

const router = express.Router();

/**
 * [MODIFIED] Auth removed.
 * Supply userId via query string:   GET /api/daily-inputs/my/count?userId=123
 * (or use a route param if you prefer: change the handler to read req.params.userId)
 */
router.get('/my/count', getMyDailyInputCount); // [MODIFIED] removed requireAuth

/**
 * [MODIFIED] Auth removed.
 * Supply userId via query string:   GET /api/daily-inputs?userId=123
 */
router.get('/', getDailyInputs); // [MODIFIED] removed requireAuth

/**
 * [MODIFIED] Auth removed.
 * Supply user_id in body or as ?userId=123
 */
router.post('/', createDailyInput); // [MODIFIED] removed requireAuth

/**
 * [MODIFIED] Auth removed.
 * Supply userId via query (recommended) or include user_id in body.
 */
router.put('/:id', updateDailyInput); // [MODIFIED] removed requireAuth

/**
 * [MODIFIED] Auth removed.
 * Supply userId via query (recommended) or include user_id in body.
 */
router.delete('/:id', deleteDailyInput); // [MODIFIED] removed requireAuth

export default router;
