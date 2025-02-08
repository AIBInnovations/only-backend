import Market from '../models/marketModel.js';
import moment from 'moment-timezone';

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

// Fetch all markets and update their status dynamically
export const getMarketsWithUpdatedStatus = async (req, res) => {
  try {
    const now = moment().tz("Asia/Kolkata");
    const currentTime = now.format('HH:mm');

    console.log(`📢 Fetching markets at ${currentTime}`);

    // Fetch all markets from the database
    const markets = await Market.find();

    if (!markets.length) {
      return res.status(404).json({ message: "No markets found." });
    }

    // Update market status dynamically based on the current time
    const updatedMarkets = markets.map(market => {
      const { openTime, closeTime } = market;

      let isBettingOpen = market.isBettingOpen;
      let openBetting = market.openBetting;

      // Open market if the current time is at or after openTime
      if (moment(currentTime, "HH:mm").isSameOrAfter(moment(openTime, "HH:mm"))) {
        isBettingOpen = true;
        openBetting = true;
      }

      // Close Open Betting (10 min before closeTime)
      const tenMinutesBeforeClose = moment(closeTime, "HH:mm").subtract(10, 'minutes').format('HH:mm');
      if (openBetting && moment(currentTime, "HH:mm").isSameOrAfter(moment(tenMinutesBeforeClose, "HH:mm"))) {
        openBetting = false;
      }

      // Close market at closeTime
      if (moment(currentTime, "HH:mm").isSameOrAfter(moment(closeTime, "HH:mm"))) {
        isBettingOpen = false;
      }

      return {
        ...market.toObject(),
        isBettingOpen,
        openBetting,
      };
    });

    res.status(200).json(updatedMarkets);
  } catch (error) {
    console.error('❌ Error fetching markets:', error);
    res.status(500).json({ message: 'Server error while fetching markets.' });
  }
};