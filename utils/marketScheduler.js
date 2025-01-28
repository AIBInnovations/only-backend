import cron from 'node-cron';
import Market from './models/marketModel.js';
import moment from 'moment'; // For time manipulation

// Function to open and close markets based on timing
const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  // Schedule to run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const currentTime = moment().format('HH:mm'); // Get current time in 'HH:mm' format

      // Open markets that should open now
      const marketsToOpen = await Market.find({
        openTime: currentTime,
        isBettingOpen: false, // Only open markets that are currently closed
      });

      for (const market of marketsToOpen) {
        market.isBettingOpen = true;
        await market.save();
        console.log(`✅ Market "${market.name}" is now open.`);
      }

      // Close markets that should close now
      const marketsToClose = await Market.find({
        closeTime: currentTime,
        isBettingOpen: true, // Only close markets that are currently open
      });

      for (const market of marketsToClose) {
        market.isBettingOpen = false;
        await market.save();
        console.log(`❌ Market "${market.name}" is now closed.`);
      }
    } catch (error) {
      console.error('❌ Error in managing market timings:', error.message);
    }
  });
};

export default manageMarketTimings;
