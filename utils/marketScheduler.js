import cron from 'node-cron';
import Market from '../models/marketModel.js';
import moment from 'moment-timezone';

const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  cron.schedule('* * * * *', async () => { // Runs every minute
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
        const { openTime, closeTime, isBettingOpen, openBetting } = market;

        // 🔹 Open Market (Only If It's Still Closed)
        if (!isBettingOpen && moment(currentTime, "HH:mm").isSameOrAfter(moment(openTime, "HH:mm"))) {
          market.isBettingOpen = true;
          market.openBetting = true;
          await market.save();
          console.log(`✅ Market "${market.name}" is now OPEN for betting.`);
        }

        // 🔸 Close Open Bets (10 min before closeTime)
        const tenMinutesBeforeClose = moment(closeTime, "HH:mm").subtract(10, 'minutes').format('HH:mm');
        if (openBetting && moment(currentTime, "HH:mm").isSameOrAfter(moment(tenMinutesBeforeClose, "HH:mm"))) {
          market.openBetting = false;
          await market.save();
          console.log(`⛔ Open betting for "${market.name}" is now CLOSED.`);
        }

        // ❌ Close Market (Only If It's Still Open)
        if (isBettingOpen && moment(currentTime, "HH:mm").isSameOrAfter(moment(closeTime, "HH:mm"))) {
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
