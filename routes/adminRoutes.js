import express from 'express';
import { getUsers, addFundsByAdmin } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js'; // Middleware for admin authentication
import { updateUserDetails, updateUserWalletBalance } from '../controllers/userController.js';
import { editBet } from '../controllers/adminController.js';

const router = express.Router();

/**
 * @route GET /api/admin/users
 * @desc Fetch all users
 * @access Admin only
 */
router.get('/users', adminAuth, getUsers);

/**
 * @route   PUT /api/admin/users/:id
 * @desc    Update user details
 * @access  Private (Admin)
 */
router.put('/users/:id', adminAuth, updateUserDetails);

/**
 * @route   PUT /api/admin/users/:id/:walletbalance
 * @desc    Update user wallet balance
 * @access  Private (Admin)
 */
router.put('/users/:id/:walletbalance', adminAuth, updateUserWalletBalance);

router.put('/bets/:id', adminAuth, editBet);

/**
 * @route   PUT /api/admin/users/:userId/add-funds
 * @desc    Add funds to a user's wallet
 * @access  Admin
 */
router.put('/users/:userId/add-funds/:amount', adminAuth, addFundsByAdmin);

export default router;
