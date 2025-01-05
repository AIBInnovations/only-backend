import User from '../models/userModel.js';

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