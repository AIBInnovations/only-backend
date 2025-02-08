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
        const { openTime, closeTime, isBettingOpen, openBetting } = market;

        const openTimeMoment = moment(openTime, "HH:mm");
        const closeTimeMoment = moment(closeTime, "HH:mm");
        const tenMinutesBeforeOpen = openTimeMoment.clone().subtract(10, 'minutes').format('HH:mm');
        const tenMinutesBeforeClose = closeTimeMoment.clone().subtract(10, 'minutes').format('HH:mm');

        // 🔹 **Fix wrongly open markets (Markets open at wrong time should be forcefully closed)**
        if (isBettingOpen && (currentTime < openTime || currentTime > closeTime)) {
          market.isBettingOpen = false;
          market.openBetting = false;
          await market.save();
          console.log(`❌ Auto-Corrected: Market "${market.name}" was wrongly open and has been CLOSED.`);
        }

        // 1️⃣ **Open the market at `openTime`**
        if (currentTime === openTime && !isBettingOpen) {
          market.isBettingOpen = true;
          market.openBetting = true;
          await market.save();
          console.log(`✅ Market "${market.name}" is now OPEN for betting.`);
        }

        // 2️⃣ **Restrict open bets 10 minutes before `openTime`**
        if (currentTime === tenMinutesBeforeOpen && isBettingOpen && openBetting) {
          market.openBetting = false; // Open bets closed, but close bets allowed
          await market.save();
          console.log(`⛔ Open betting for "${market.name}" is now CLOSED. Close bets are still allowed.`);
        }

        // 3️⃣ **Close all betting 10 minutes before `closeTime`**
        if (currentTime === tenMinutesBeforeClose && isBettingOpen) {
          market.isBettingOpen = false; // No more bets allowed
          market.openBetting = false;
          await market.save();
          console.log(`⛔ Market "${market.name}" has STOPPED accepting bets.`);
        }

        // 4️⃣ **Fully close the market at `closeTime`**
        if (currentTime === closeTime && isBettingOpen) {
          market.isBettingOpen = false;
          market.openBetting = false;
          await market.save();
          console.log(`❌ Market "${market.name}" is now FULLY CLOSED.`);
        }
      }
    } catch (error) {
      console.error('❌ Error in managing market timings:', error);
    }
  });
};

export default manageMarketTimings;
