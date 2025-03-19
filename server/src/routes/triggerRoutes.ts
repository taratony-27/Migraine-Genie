import express from 'express';
import { getTriggers } from '../controllers/triggerController';

const router = express.Router();

// Define routes
router.get('/', getTriggers);

export default router;
