import express from 'express';
import { loginUser, signupUser, getUsers } from '../controllers/userController';

const router = express.Router();

router.post('/login', loginUser);
router.post('/signup', signupUser);
router.get('/', getUsers);

export default router;
