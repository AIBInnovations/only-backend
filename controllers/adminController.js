import User from '../models/userModel.js';

// Fetch all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Exclude passwords from the response
    res.status(200).json({ users });
  } catch (error) {
    console.error('Error fetching users:', error.message);
    res.status(500).json({ message: 'Server error while fetching users.' });
  }
};
