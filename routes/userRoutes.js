import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import auth from '../middleware/auth.js'; // Middleware for token verification

const router = express.Router();

/**
 * @route   GET /api/users/profile
 * @desc    Fetch user profile details
 * @access  Private
 */
router.get('/profile', auth, getUserProfile);

export default router;
