import express from 'express';
import { addFundsRequest, getWalletBalance, getTransactions, verifyRequest, uploadReceipt} from '../controllers/walletController.js';
import auth from '../middleware/auth.js'; // Authentication middleware

const router = express.Router();

/**
 * @route   POST /api/wallet/add-funds
 * @desc    Submit a request to add funds
 * @access  Private
 */

router.post('/add-funds', auth, uploadReceipt, addFundsRequest);

/**
 * @route   GET /api/wallet/balance
 * @desc    Get the wallet balance of the logged-in user
 * @access  Private
 */
router.get('/balance', auth, getWalletBalance);

/**
 * @route   GET /api/wallet/transactions
 * @desc    Get all transactions for the logged-in user
 * @access  Private
 */
router.get('/transactions', auth, getTransactions);

/**
 * @route   POST /api/wallet/verify
 * @desc    Verify and approve/reject a transaction
 * @access  Private (Admin only if roles exist)
 */
router.post('/verify', auth, verifyRequest);
export default router;