import express from 'express';
import { getMedications } from '../controllers/medicationController';

const router = express.Router();

// GET all medications
router.get('/', getMedications);

export default router;
