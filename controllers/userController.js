import User from '../models/userModel.js';

// Update user details, including wallet balance
export const updateUserDetails = async (req, res) => {
  const { id } = req.params;
  const { name, email, phoneNumber, walletBalance } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update fields if they are provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;
    if (walletBalance !== undefined && walletBalance >= 0) {
      user.walletBalance = walletBalance;
    }

    // Save the updated user
    const updatedUser = await user.save();

    res.status(200).json({
      message: 'User updated successfully',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Error updating user details:', error);
    res.status(500).json({ message: 'Server error while updating user details' });
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