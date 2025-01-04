import mongoose from 'mongoose';

const betSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, // Links the bet to a user
    },
    marketName: {
      type: String,
      required: true, // Name of the market the bet belongs to
    },
    gameName: {
      type: String,
      required: true, // Name of the game (e.g., Single Digit, Jodi, etc.)
    },
    number: {
      type: Number,
      required: true, // The number the user placed a bet on
    },
    amount: {
      type: Number,
      required: true,
      min: [1, 'Bet amount must be at least 1'], // Minimum bet validation
    },
    winningRatio: {
      type: Number,
      required: true, // Specifies the ratio for winnings
    },
    status: {
      type: String,
      enum: ['pending', 'won', 'lost'], // Tracks bet result
      default: 'pending',
    },
    createdAt: {
      type: Date,
      default: Date.now, // When the bet was placed
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Last update
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// Middleware to auto-update 'updatedAt' on save
betSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Bet = mongoose.models.Bet || mongoose.model('Bet', betSchema);

export default Bet;
