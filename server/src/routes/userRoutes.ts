// routes/userRoutes.ts
import express from 'express';
import { getUsers, loginUser, signupUser, updateUser } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.get('/', getUsers);
router.post('/login', loginUser);
router.post('/signup', signupUser);

// ✅ NEW: protected profile update
router.put('/update', authenticateToken, updateUser);

export default router;
