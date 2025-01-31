import cloudinary from 'cloudinary';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';


// Cloudinary Configuration
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Multer Storage (Temporary local storage)
const upload = multer({ dest: 'uploads/' });


// API to Upload File to Cloudinary
app.post('/upload', upload.single('receipt'), async (req, res) => {
  try {
    const result = await cloudinary.v2.uploader.upload(req.file.path);
    fs.unlinkSync(req.file.path); // Remove temp file after upload

    res.json({ receiptUrl: result.secure_url });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});


// Add Funds Request (Updated with Image Upload)
export const addFundsRequest = async (req, res) => {
  const { transactionId, amount } = req.body;
  const userId = req.user;

  if (!transactionId || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Transaction ID and amount are required.' });
  }

  try {
    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Upload receipt to Cloudinary
    let receiptUrl = null;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path);
      receiptUrl = result.secure_url; // Cloudinary public URL
    }

    // Create transaction with receipt URL
    const transaction = new Transaction({
      user: userId,
      amount,
      transactionId,
      receiptUrl, // Save Cloudinary URL
      status: 'pending',
    });

    await transaction.save();

    // Link transaction to user
    user.transactions.push(transaction._id);
    await user.save();

    res.status(201).json({ message: 'Fund request submitted successfully.', transaction });
  } catch (error) {
    console.error('Error adding funds:', error.message);
    res.status(500).json({ message: 'Server error while submitting fund request.' });
  }
};

// Middleware to handle file uploads
export const uploadReceipt = upload.single('receipt');

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