import User from '../models/userModel.js';

// Fetch All Users
export const getUsers = async (req, res) => {
    try {
      const users = await User.find().select('-password');
      res.status(200).json({ users });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch users' });
    }
  };
  
  // Add User
  export const addUser = async (req, res) => {
    const { name, email, phoneNumber, walletBalance } = req.body;
    try {
      const newUser = new User({ name, email, phoneNumber, walletBalance });
      await newUser.save();
      res.status(201).json({ user: newUser });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  
  // Update User
  export const updateUser = async (req, res) => {
    const { id } = req.params;
    const updates = req.body;
    try {
      const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true });
      res.status(200).json({ user: updatedUser });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
  