import WinningRatio from './models/winningRatioModel.js';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

const seedWinningRatios = async () => {
  const ratios = [
    { gameName: 'Single Digit', ratio: 9 },
    { gameName: 'Double Digit', ratio: 90 },
    { gameName: 'Single Panna', ratio: 90 },
    { gameName: 'Double Panna', ratio: 180 },
    { gameName: 'Triple Panna', ratio: 270 },
  ];

  try {
    await WinningRatio.insertMany(ratios);
    console.log('Winning ratios seeded successfully');
  } catch (error) {
    console.error('Error seeding winning ratios:', error.message);
  }

  process.exit();
};

seedWinningRatios();
