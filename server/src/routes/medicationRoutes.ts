import express from 'express';
import { getMedications, createMedication } from '../controllers/medicationController';

const router = express.Router();

router.get('/', getMedications);
router.post('/', createMedication);

export default router;
