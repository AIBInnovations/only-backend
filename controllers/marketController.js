import Market from '../models/marketModel.js';

// Fetch all markets
export const getAllMarkets = async (req, res) => {
  try {
    const markets = await Market.find({});
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Fetch open markets
export const getOpenMarkets = async (req, res) => {
  try {
    const markets = await Market.find({ isBettingOpen: true });
    res.status(200).json(markets);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update market status
export const updateMarketStatus = async (req, res) => {
  const { marketId, isBettingOpen } = req.body;
  try {
    const market = await Market.findOneAndUpdate(
      { marketId },
      { isBettingOpen },
      { new: true }
    );
    if (!market) {
      return res.status(404).json({ message: 'Market not found' });
    }
    res.status(200).json({ message: 'Market status updated', market });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
