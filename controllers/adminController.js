import User from '../models/userModel.js';
import Bet from '../models/betModel.js';
import Market from '../models/marketModel.js';
import Transaction from '../models/transactionModel.js';
import Admin from '../models/adminModel.js'; // Ensure the path is correct
import WinningRatio from '../models/winningRatioModel.js';


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
};

// Edit a bet
export const editBet = async (req, res) => {
  const { id } = req.params;
  const { marketName, gameName, number, amount, winningRatio, status } = req.body;

  // Validate required fields
  if (!marketName || !gameName || number === undefined || !amount || !winningRatio || !status) {
    return res.status(400).json({ message: 'All fields are required for editing a bet.' });
  }

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

/**
 * @desc    Add funds to a user's wallet by email
 * @route   PUT /api/admin/users/:email/add-funds/:amount
 * @access  Admin
 */
/**export const addFundsByAdmin = async (req, res) => {
  const { email, amount } = req.body; // Extract email and amount from request body

  // Validate input
  if (!email || !amount || amount <= 0) {
    return res.status(400).json({ message: 'Invalid email or amount. Amount must be greater than 0.' });
  }

  // Validate email format
  if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    // Find the user by email (case-insensitive)
    const user = await User.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
      return res.status(404).json({ message: `User with email ${email} not found.` });
    }

    // Add funds to the user's wallet
    user.walletBalance += parseFloat(amount);
    await user.save();

    // Create a new transaction record
    const transaction = new Transaction({
      user: user._id,
      amount,
      transactionId: `ADMIN-${Date.now()}`,
      receiptUrl: null,
      status: 'approved',
      isSuccessful: true
    });

    await transaction.save();

    // Link the transaction to the user
    user.transactions.push(transaction._id);
    await user.save();

    res.status(200).json({
      message: `Successfully added ${amount} to ${user.name}'s wallet.`,
      walletBalance: user.walletBalance,
      transaction,
    });
  } catch (error) {
    console.error('Error adding funds:', error.message);
    res.status(500).json({ message: 'Server error while adding funds.' });
  }
};
**/

// Add a new market
export const addMarket = async (req, res) => {
  const { name, openTime, closeTime, isBettingOpen } = req.body;

  // Validate input
  if (!name || !openTime || !closeTime) {
    return res.status(400).json({ message: 'Name, openTime, and closeTime are required.' });
  }

  try {
    // Check if a market with the same name already exists
    const existingMarket = await Market.findOne({ name });
    if (existingMarket) {
      return res.status(400).json({ message: 'Market with this name already exists.' });
    }

    // Generate a unique market ID
    const marketId = `MKT-${Date.now()}`;

    // Create a new market
    const market = new Market({
      name,
      marketId, // Automatically set the market ID
      openTime,
      closeTime,
      isBettingOpen: isBettingOpen !== undefined ? isBettingOpen : false, // Default to true if not provided
    });

    await market.save();

    res.status(201).json({ message: 'Market added successfully', market });
  } catch (error) {
    console.error('Error adding market:', error.message);
    res.status(500).json({ message: 'Server error while adding market.' });
  }
};


export const declareResult = async (req, res) => {
  const { marketId, openResult, closeResult } = req.body;

  if (!marketId || !openResult || !closeResult) {
    return res.status(400).json({ message: 'Market ID, Open Result, and Close Result are required.' });
  }

  try {
    console.log('Market ID:', marketId);

    // Find the market by marketId
    const market = await Market.findOne({ marketId });
    console.log('Market found:', market);

    if (!market) {
      return res.status(404).json({ message: 'Market not found.' });
    }

    // Parse Open and Close Results
    const openDigits = openResult.split('').map(Number);
    const closeDigits = closeResult.split('').map(Number);

    // Calculate Single Digit Results
    const openSingleDigit = openDigits.reduce((sum, digit) => sum + digit, 0) % 10;
    const closeSingleDigit = closeDigits.reduce((sum, digit) => sum + digit, 0) % 10;

    // Calculate Jodi Result
    const jodiResult = `${openSingleDigit}${closeSingleDigit}`;

    // Calculate Single Panna Results
    const openSinglePanna = openResult; // Open Single Panna is the open result (e.g., '580')
    const closeSinglePanna = closeResult; // Close Single Panna is the close result (e.g., '190')

    // Update the results object within the market
    market.results = {
      openNumber: openResult,
      closeNumber: closeResult,
      openSingleDigit,
      closeSingleDigit,
      jodiResult,
      openSinglePanna,
      closeSinglePanna,
    };
    market.isBettingOpen = false; // Close betting after result declaration

    await market.save();
    console.log('Market results updated successfully:', market);

    // Reward the winning users
    const winningBets = await Bet.find({ marketName: market.name, status: 'pending' });
    console.log('Winning bets fetched:', winningBets.length);

    for (const bet of winningBets) {
      let isWinner = false;

      // Determine winning condition
      switch (bet.gameName) {
        case 'Single Digit Open':
          isWinner = bet.number === openSingleDigit;
          break;
        case 'Single Digit Close':
          isWinner = bet.number === closeSingleDigit;
          break;
        case 'Jodi':
          isWinner = `${bet.number}` === jodiResult;
          break;
        case 'Single Panna Open':
          isWinner = `${bet.number}` === openSinglePanna;
          break;
        case 'Single Panna Close':
          isWinner = `${bet.number}` === closeSinglePanna;
          break;
        default:
          break;
      }

      // Reward or mark as lost
      if (isWinner) {
        const reward = bet.amount * bet.winningRatio;

        // Update user wallet balance
        const user = await User.findById(bet.user);
        if (user) {
          user.walletBalance += reward;
          await user.save();
        }

        // Update bet status
        bet.status = 'won';
        await bet.save();
      } else {
        // Mark bet as lost
        bet.status = 'lost';
        await bet.save();
      }
    }

    res.status(200).json({
      message: 'Results declared and rewards distributed successfully!',
      market: {
        marketId,
        openResult,
        closeResult,
        openSingleDigit,
        closeSingleDigit,
        jodiResult,
        openSinglePanna,
        closeSinglePanna,
      },
    });
  } catch (error) {
    console.error('Error declaring result:', error.message);
    res.status(500).json({ message: 'Server error while declaring result.' });
  }
};


/**
 * @desc Fetch all admins
 * @route GET /api/admin/admins
 * @access Private (Master Admin only)
 */
export const getAdmins = async (req, res) => {
  try {
    // Fetch all admins excluding sensitive fields like password
    const admins = await Admin.find().select('-password');

    if (!admins.length) {
      return res.status(404).json({ message: 'No admins found' });
    }

    res.status(200).json({ message: 'Admins fetched successfully', admins });
  } catch (error) {
    console.error('Error fetching admins:', error.message);
    res.status(500).json({ message: 'Server error while fetching admins' });
  }
};

// Fetch all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate('user', 'name email') // Populate user details (e.g., name and email)
      .sort({ createdAt: -1 }); // Sort transactions by most recent

    if (!transactions.length) {
      return res.status(404).json({ message: 'No transactions found' });
    }

    res.status(200).json({
      message: 'Transactions fetched successfully',
      transactions,
    });
  } catch (error) {
    console.error('Error fetching transactions:', error.message);
    res.status(500).json({ message: 'Server error while fetching transactions' });
  }
};

// Fetch all bets
export const getAllBets = async (req, res) => {
  try {
    const bets = await Bet.find()
      .populate('user', 'name email') // Populate user details (e.g., name and email)
      .sort({ createdAt: -1 }); // Sort bets by most recent

    if (!bets.length) {
      return res.status(404).json({ message: 'No bets found' });
    }

    res.status(200).json({
      message: 'Bets fetched successfully',
      bets,
    });
  } catch (error) {
    console.error('Error fetching bets:', error.message);
    res.status(500).json({ message: 'Server error while fetching bets' });
  }
};

// Edit a market by marketId
export const editMarket = async (req, res) => {
  const { marketId } = req.params;
  const { name, openTime, closeTime, isBettingOpen } = req.body;

  try {
    // Find the market using marketId instead of _id
    const updatedMarket = await Market.findOneAndUpdate(
      { marketId }, // Match using marketId
      { name, openTime, closeTime, isBettingOpen }, // Update fields
      { new: true, runValidators: true } // Return updated document and validate input
    );

    if (!updatedMarket) {
      return res.status(404).json({ message: 'Market not found' });
    }

    res.status(200).json({
      message: 'Market updated successfully',
      market: updatedMarket,
    });
  } catch (error) {
    console.error('Error updating market:', error.message);
    res.status(500).json({ message: 'Server error while updating market' });
  }
};


export const getAllWinningRatios = async (req, res) => {
  try {
    const winningRatios = await WinningRatio.find();
    res.status(200).json({ winningRatios });
  } catch (error) {
    console.error('Error fetching winning ratios:', error.message);
    res.status(500).json({ message: 'Server error while fetching winning ratios' });
  }
};


export const updateWinningRatio = async (req, res) => {
  const { id } = req.params;
  const { ratio } = req.body;

  if (!ratio || ratio < 1) {
    return res.status(400).json({ message: 'Invalid ratio value' });
  }

  try {
    const updatedRatio = await WinningRatio.findByIdAndUpdate(
      id,
      { ratio },
      { new: true, runValidators: true }
    );

    if (!updatedRatio) {
      return res.status(404).json({ message: 'Winning ratio not found' });
    }

    res.status(200).json({ message: 'Winning ratio updated successfully', winningRatio: updatedRatio });
  } catch (error) {
    console.error('Error updating winning ratio:', error.message);
    res.status(500).json({ message: 'Server error while updating winning ratio' });
  }
};

// Delete Market
export const deleteMarket = async (req, res) => {
  const { marketId } = req.params;

  try {
    const deletedMarket = await Market.findOneAndDelete({ marketId });

    if (!deletedMarket) {
      return res.status(404).json({ message: 'Market not found' });
    }

    res.status(200).json({
      message: 'Market deleted successfully',
      market: deletedMarket,
    });
  } catch (error) {
    console.error('Error deleting market:', error.message);
    res.status(500).json({ message: 'Server error while deleting market' });
  }
};

//Delete Bet
export const deleteBet = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBet = await Bet.findByIdAndDelete(id);

    if (!deletedBet) {
      return res.status(404).json({ message: 'Bet not found' });
    }

    res.status(200).json({
      message: 'Bet deleted successfully',
      bet: deletedBet,
    });
  } catch (error) {
    console.error('Error deleting bet:', error.message);
    res.status(500).json({ message: 'Server error while deleting bet' });
  }
};

// Delete User
export const deleteUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User deleted successfully',
      user: deletedUser,
    });
  } catch (error) {
    console.error('Error deleting user:', error.message);
    res.status(500).json({ message: 'Server error while deleting user' });
  }
};