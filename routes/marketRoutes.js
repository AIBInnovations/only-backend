import express from 'express';
import Market from '../models/marketModel.js';

const router = express.Router();

/**
 * @route   GET /api/markets/available
 * @desc    Fetch all open markets
 * @access  Public
 */
router.get('/available', async (req, res) => {
  try {
    const markets = await Market.find({ isBettingOpen: true }); // Fetch open markets only
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/**
 * @route   GET /api/markets
 * @desc    Fetch all markets (open or closed)
 * @access  Public
 */
router.get('/', async (req, res) => {
  try {
    const markets = await Market.find(); // Fetch all markets
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
