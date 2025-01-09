import User from '../models/userModel.js';

// Update user details
export const updateUserDetails = async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { name, email, phoneNumber },
      { new: true, runValidators: true } // Return the updated user and run validation
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error while updating user details' });
  }
};

// Update user wallet balance
export const updateUserWalletBalance = async (req, res) => {
    const { id, walletbalance } = req.params;
  
    try {
      const user = await User.findById(id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      user.walletBalance = parseFloat(walletbalance); // Update wallet balance
      await user.save();
  
      res.status(200).json({ message: 'Wallet balance updated successfully', walletBalance: user.walletBalance });
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      res.status(500).json({ message: 'Server error while updating wallet balance' });
    }
};

// Fetch user profile
export const getUserProfile = async (req, res) => {
  try {
    // `req.user` is populated by the auth middleware with the user ID from the token
    const user = await User.findById(req.user).select('-password'); // Exclude password from response

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      phoneNumber: user.phoneNumber,
      walletBalance: user.walletBalance,
      transactions: user.transactions, // Includes related transactions
      bets: user.bets, // Includes related bets
      wins: user.wins, // Includes related wins
    });
  } catch (error) {
    console.error('Error fetching user profile:', error.message);
    res.status(500).json({ message: 'Server error while fetching user profile.' });
  }
};