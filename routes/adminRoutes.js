import express from 'express';
import auth from '../middleware/auth.js'; // Middleware for authentication
import {
  getUsers,
  addUser,
  updateUser,
} from '../controllers/adminController.js'; // Controllers for user management

const router = express.Router();

/**
 * @route   GET /api/admin/users
 * @desc    Fetch all users
 * @access  Admin
 */
router.get('/users', auth, getUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Add a new user
 * @access  Admin
 */
router.post('/users', auth, addUser);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Admin
 */
router.put('/users/:id', auth, updateUser);

export default router;
