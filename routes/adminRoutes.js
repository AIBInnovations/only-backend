import express from 'express';
import { getUsers, addFundsByAdmin, editBet, addMarket } from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js'; // Middleware for admin authentication
import { updateUserDetails, updateUserWalletBalance } from '../controllers/userController.js';

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
 * @route   POST /api/admin/users/add-funds
 * @desc    Add funds to a user's wallet by admin
 * @access  Admin
 */
router.post('/users/add-funds', adminAuth, addFundsByAdmin);

/**
 * @route   POST /api/admin/markets
 * @desc    Add a new market
 * @access  Admin
 */
router.post('/add-market', adminAuth, addMarket);

export default router;
