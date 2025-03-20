import crypto from "crypto";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import { sendEmail } from "../utils/sendEmail.js";

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

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // ✅ Find user by email
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // ✅ Generate reset token
    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour expiry

    await user.save();

    // ✅ Send reset email
    // In your forgotPassword controller
    const resetUrl = `https://matka-betting-consumer-hazel.vercel.app/reset-password/${resetToken}`;

    const message = `Click the link to reset your password: ${resetUrl}`;

    await sendEmail(user.email, "Password Reset", message);

    res.json({ message: "Password reset email sent" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    res.status(500).json({ error: "Server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Find the user with the valid reset token and ensure the token is not expired
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    // Set the new password. This will mark the field as modified.
    user.password = newPassword;

    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    // Save normally so that pre-save hooks (including password hashing) are triggered.
    await user.save();

    return res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error resetting password:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Server error" });
    }
  }
};
