import Bet from '../models/betModel.js';
import User from '../models/userModel.js';

// Place a bet
export const placeBet = async (req, res) => {
  const { userId, marketName, gameName, number, amount, winningRatio } = req.body;

  // Validate input
  if (!userId || !marketName || !gameName || number === undefined || !amount || !winningRatio) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if the user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check wallet balance
    if (user.walletBalance < amount) {
      return res.status(400).json({ message: 'Insufficient wallet balance' });
    }

    // Create the bet
    const bet = new Bet({
      user: userId,
      marketName,
      gameName,
      number,
      amount,
      winningRatio,
    });
    await bet.save();

    // Deduct the amount from the user's wallet and link the bet
    user.walletBalance -= amount;
    user.bets.push(bet._id);
    await user.save();

    res.status(201).json({ message: 'Bet placed successfully', bet });
  } catch (error) {
    console.error('Error placing bet:', error.message);
    res.status(500).json({ message: 'Server error while placing bet' });
  }
};

// Fetch all bets by user
export const getUserBets = async (req, res) => {
  const { userId } = req.params;

  try {
    // Validate user ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Fetch bets
    const bets = await Bet.find({ user: userId });
    res.status(200).json(bets);
  } catch (error) {
    console.error('Error fetching user bets:', error.message);
    res.status(500).json({ message: 'Server error while fetching bets' });
  }
};
