import multer from 'multer';
import cloudinary from 'cloudinary';
import fs from 'fs';
import dotenv from "dotenv";
import Transaction from '../models/transactionModel.js';
import User from '../models/userModel.js';

// Load environment variables from .env
dotenv.config();

// ✅ Cloudinary Configuration (Ensure ENV Variables are Set)
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage for Files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Temporary local storage before Cloudinary upload
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// ✅ Validate File Type (Images & PDFs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "application/pdf"];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPG, PNG, and PDF allowed."), false);
  }
};

export const upload = multer({ storage, fileFilter });
export const uploadReceipt = upload.single("receipt");


// ✅ Add Funds Request (Now Handles Receipt Upload)
export const addFundsRequest = async (req, res) => {
  const { transactionId, amount } = req.body;
  const userId = req.user;

  if (!transactionId || !amount || amount <= 0) {
    return res.status(400).json({ message: "Transaction ID and amount are required." });
  }

  try {
    // ✅ Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    let receiptUrl = null;

    if (req.file) {
      try {
        console.log("📢 Uploading File to Cloudinary:", req.file.path);

        // ✅ Ensure Cloudinary uses `v2`
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "wallet_receipts",
          use_filename: true,
          unique_filename: false,
          resource_type: "auto", // ✅ Supports images, PDFs, videos
        });

        receiptUrl = result.secure_url;
        console.log("✅ Upload Successful:", receiptUrl);

        // ✅ Delete Local File After Upload
        fs.unlinkSync(req.file.path);
      } catch (uploadError) {
        console.error("❌ Cloudinary Upload Error:", uploadError);
        return res.status(500).json({ message: "Failed to upload receipt.", error: uploadError.message });
      }
    } else {
      console.log("❌ No File Found in Request.");
      return res.status(400).json({ message: "Receipt file is required." });
    }

    // ✅ Create Transaction
    const transaction = new Transaction({
      user: userId,
      amount,
      transactionId,
      receiptUrl, // Save Cloudinary URL
      status: "pending",
    });

    await transaction.save();

    // ✅ Link Transaction to User
    user.transactions.push(transaction._id);
    await user.save();

    res.status(201).json({ message: "Fund request submitted successfully.", transaction });
  } catch (error) {
    console.error("❌ Error adding funds:", error);
    res.status(500).json({ message: "Server error while submitting fund request.", error: error.message });
  }
};

// ✅ Get Wallet Balance
export const getWalletBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user).select('walletBalance');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.status(200).json({ walletBalance: user.walletBalance });
  } catch (error) {
    console.error('Get Wallet Balance Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching wallet balance.' });
  }
};

// ✅ Get Transactions
export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user }).sort({ createdAt: -1 });
    res.status(200).json({ transactions });
  } catch (error) {
    console.error('Get Transactions Error:', error.message);
    res.status(500).json({ message: 'Server error while fetching transactions.' });
  }
};

// ✅ Verify Transaction
export const verifyRequest = async (req, res) => {
  const { transactionId, status } = req.body;

  if (!transactionId || !status) {
    return res.status(400).json({ message: 'Transaction ID and status are required.' });
  }

  try {
    // ✅ Find the transaction by ID
    const transaction = await Transaction.findOne({ transactionId });
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found.' });
    }

    if (status === 'approved') {
      // ✅ Approve and update user wallet balance
      const user = await User.findById(transaction.user);
      if (!user) {
        return res.status(404).json({ message: 'User associated with the transaction not found.' });
      }
      user.walletBalance += transaction.amount;
      await user.save();
    }

    // ✅ Update Transaction Status
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
