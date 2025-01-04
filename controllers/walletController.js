import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';

// Add Funds Request
export const addFundsRequest = async (req, res) => {
  const { amount, transactionId, receiptUrl } = req.body;
  const userId = req.user; // Extract userId from authenticated request

  // Validate input
  if (!amount || !transactionId) {
    return res.status(400).json({ message: 'Amount and Transaction ID are required.' });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Create a new transaction
    const transaction = new Transaction({
      user: userId,
      amount,
      transactionId,
      receiptUrl,
      status: 'pending',
    });

    await transaction.save();

    // Link the transaction to the user
    user.transactions.push(transaction._id);
    await user.save();

    res.status(201).json({ message: 'Fund request submitted successfully.', transaction });
  } catch (error) {
    console.error('Add Funds Error:', error.message);
    res.status(500).json({ message: 'Server error while submitting fund request.' });
  }
};

// Get Wallet Balance
export const getWalletBalance = async (req, res) => {
  const userId = req.user; // Extract userId from authenticated request

  try {
    const user = await User.findById(userId).select('walletBalance');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    console.error('Get Wallet Balance Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching wallet balance.' });
  }
};

// Get Transactions
export const getTransactions = async (req, res) => {
  const userId = req.user; // Extract userId from authenticated request

  try {
    const transactions = await Transaction.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Get Transactions Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching transactions.' });
  }
};

export const verifyRequest = async (req, res) => {
  const { transactionId, status } = req.body;

  if (!transactionId || !status) {
    return res.status(400).json({ message: 'Transaction ID and status are required.' });
  }

  try {
    // Find the transaction by transactionId
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (status === 'approved') {
      // Approve the transaction and update user's wallet balance
      const user = await User.findById(transaction.user);
      if (!user) {
        return res.status(404).json({ message: 'User associated with the transaction not found.' });
      }
      user.walletBalance += transaction.amount;
      await user.save();
    }

    // Update transaction status
    transaction.status = status;
    transaction.isSuccessful = status === 'approved';
    await transaction.save();

    res.status(200).json({
      message: `Transaction ${status} successfully.`,
      transaction,
    });
  } catch (error) {
    console.error('Error verifying transaction:', error.message);
    res.status(500).json({ message: 'Server error while verifying the transaction.' });
  }
};