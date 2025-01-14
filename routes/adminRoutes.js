import express from 'express';
import { getUsers, editBet, addMarket, declareResult, getAdmins, getAllTransactions, getAllBets, editMarket, deleteMarket, deleteBet, deleteUser, getAllWinningRatios, updateWinningRatio} from '../controllers/adminController.js';
import adminAuth from '../middleware/adminAuth.js'; // Middleware for admin authentication
import { updateUserDetails } from '../controllers/userController.js';

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

router.put('/bets/:id', adminAuth, editBet);

/**
 * @route   POST /api/admin/users/add-funds
 * @desc    Add funds to a user's wallet by admin
 * @access  Admin
router.post('/users/add-funds', adminAuth, addFundsByAdmin);
**/

/**
 * @route   POST /api/admin/markets
 * @desc    Add a new market
 * @access  Admin
 */
router.post('/add-market', adminAuth, addMarket);

/**
 * @route   POST /api/admin/markets/declare-results
 * @desc    Declare results for a market
 * @access  Admin
 */
router.post('/markets/declare-results', adminAuth, declareResult);

/**
 * @route   GET /api/admin/admins
 * @desc    Fetch all admins (Only Master Admin can access this)
 * @access  Private (Master Admin only)
 */
router.get('/admins', getAdmins);

/**
 * @route   GET /api/admin/transactions
 * @desc    Fetch all transactions
 * @access  Admin
 */
router.get('/transactions', adminAuth, getAllTransactions);

/**
 * @route   GET /api/admin/bets
 * @desc    Fetch all bets of the users
 * @access  Admin 
 */
router.get('/bets', adminAuth, getAllBets);

router.get('/winning-ratios', adminAuth, getAllWinningRatios);

router.put('/winning-ratios/:id', adminAuth, updateWinningRatio);

/**
 * @route   PUT /api/admin/markets/:marketId
 * @desc    Edit a market
 * @access  Admin
 */
router.put('/markets/:marketId', adminAuth, editMarket);

// Delete a market
router.delete('/markets/:marketId', adminAuth, deleteMarket);

// Delete a bet
router.delete('/bets/:id', adminAuth, deleteBet);

// Delete a user
router.delete('/users/:userId', adminAuth, deleteUser);

export default router;
