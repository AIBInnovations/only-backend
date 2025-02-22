import Market from '../models/marketModel.js';
import MarketResult from '../models/marketResultModel.js'

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
  const { marketId, isBettingOpen, openBetting } = req.body;
  try {
    const market = await Market.findOneAndUpdate(
      { marketId },
      { isBettingOpen },
      { openBetting },
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


export const getMarketResults = async (req, res) => {
  try {
    const { marketId } = req.params; // Extract marketId from URL

    if (!marketId) {
      return res.status(400).json({ message: "Market ID is required." });
    }

    console.log("📢 Fetching results for Market ID:", marketId);

    const results = await MarketResult.find({ marketId }).sort({ date: -1 });

    if (!results.length) {
      console.warn("⚠️ No results found for market:", marketId);
      return res.status(404).json({ message: "No results found for this market." });
    }

    console.log("✅ Results found:", results.length);
    res.status(200).json(results);
  } catch (error) {
    console.error("❌ Error fetching market results:", error);
    res.status(500).json({
      message: "Server error while fetching market results.",
      error: error.message,
    });
  }
};