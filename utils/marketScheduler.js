import cron from 'node-cron';
import Market from '../models/marketModel.js';
import moment from 'moment-timezone';

const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  cron.schedule('* * * * *', async () => { // Run every minute
    try {
      const now = moment().tz("Asia/Kolkata");
      const currentTime = now.format('HH:mm');

      console.log(`🕒 Checking markets at ${currentTime}`);

      // Fetch all markets
      const markets = await Market.find();

      if (!markets.length) {
        console.log("❌ No markets found.");
        return;
      }

      for (const market of markets) {
        const { openTime, closeTime, isBettingOpen } = market;

        // 🔹 Open Market Logic
        if (openTime === currentTime && !isBettingOpen) {
          market.isBettingOpen = true;
          market.openBetting = true;
          await market.save();
          console.log(`✅ Market "${market.name}" is now OPEN for betting.`);
        }

        // 🔸 Close Open Betting (10 min before close)
        const tenMinutesBeforeClose = moment(closeTime, "HH:mm").subtract(10, 'minutes').format('HH:mm');
        if (tenMinutesBeforeClose === currentTime && market.isBettingOpen && market.openBetting) {
          market.openBetting = false;
          await market.save();
          console.log(`⛔ Open betting for "${market.name}" is now CLOSED.`);
        }

        // ❌ Fully Close Market Logic
        if (closeTime === currentTime && isBettingOpen) {
          market.isBettingOpen = false;
          await market.save();
          console.log(`❌ Market "${market.name}" is now CLOSED.`);
        }
      }
    } catch (error) {
      console.error('❌ Error in managing market timings:', error);
    }
  });
};

export default manageMarketTimings;
