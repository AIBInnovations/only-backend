import mongoose from 'mongoose';

const marketSchema = new mongoose.Schema(
  {
    marketId: {
      type: String,
      required: true,
      unique: true,
      trim: true, // Ensures no leading or trailing spaces
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    openTime: {
      type: String,
      required: true,
    },
    closeTime: {
      type: String,
      required: true,
    },
    isBettingOpen: {
      type: Boolean,
      default: false, // Indicates if the market is open for betting
    },
    createdAt: {
      type: Date,
      default: Date.now, // Auto-populated with current date
    },
    updatedAt: {
      type: Date,
      default: Date.now, // Tracks the last update
    },
  },
  {
    timestamps: true, // Adds 'createdAt' and 'updatedAt' fields automatically
  }
);

// Middleware to auto-update 'updatedAt' on save
marketSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Static method to fetch open markets
marketSchema.statics.findOpenMarkets = function () {
  return this.find({ isBettingOpen: true });
};

const Market = mongoose.models.Market || mongoose.model('Market', marketSchema);

export default Market;
