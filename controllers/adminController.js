import User from '../models/userModel.js';
import Bet from '../models/betModel.js'

// Fetch all users
export const getUsers = async (req, res) => {
  try {
    // Fetch all users, excluding sensitive fields like password
    const users = await User.find().select('-password');
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users' });
  }
  console.log('Admin route hit');
};


// Edit a bet
export const editBet = async (req, res) => {
  const { id } = req.params;
  const { marketName, gameName, number, amount, winningRatio, status } = req.body;

  try {
    const updatedBet = await Bet.findByIdAndUpdate(
      id,
      { marketName, gameName, number, amount, winningRatio, status },
      { new: true, runValidators: true }
    );

    if (!updatedBet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    res.status(200).json({ message: 'Bet updated successfully', bet: updatedBet });
  } catch (error) {
    console.error('Error updating bet:', error.message);
    res.status(500).json({ message: 'Server error while updating bet' });
  }
};