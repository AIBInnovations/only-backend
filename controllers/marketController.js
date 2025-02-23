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

// ✅ Update Market Status Properly
export const updateMarketStatus = async (req, res) => {
  try {
    const { marketId } = req.params;
    const { isBettingOpen } = req.body; // Remove openBetting from request

    console.log("📢 Updating market:", marketId, "isBettingOpen:", isBettingOpen);

    const market = await Market.findOneAndUpdate(
      { marketId },
      { 
        $set: { 
          isBettingOpen: isBettingOpen, // ✅ Update isBettingOpen
          openBetting: isBettingOpen    // ✅ Ensure openBetting always matches isBettingOpen
        } 
      },
      { new: true } // ✅ Return the updated document
    );

    if (!market) {
      return res.status(404).json({ message: '❌ Market not found' });
    }

    console.log("✅ Market Updated Successfully:", market);
    res.status(200).json({ message: '✅ Market status updated successfully', market });
  } catch (error) {
    console.error("❌ Error updating market status:", error);
    res.status(500).json({ message: "❌ Server error updating market status", error: error.message });
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