import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Ensures every transaction is linked to a user
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Amount must be at least 1'], // Validates the transaction amount
    },
    transactionId: {
      type: String,
      required: true,
      unique: true, // Ensures no duplicate transactions
      trim: true,
    },
    receiptUrl: {
      type: String,
      default: null, // Optional receipt URL
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'], // Transaction status options
      default: 'pending',
    },
    isSuccessful: {
      type: Boolean,
      default: false, // Tracks if the transaction was successfully processed
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' automatically
  }
);

// Remove redundant index definition
// Mongoose automatically creates unique indexes for fields defined with `unique: true`

const Transaction = mongoose.models.Transaction || mongoose.model('Transaction', transactionSchema);

export default Transaction;
