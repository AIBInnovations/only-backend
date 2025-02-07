import cron from 'node-cron';
import Market from '../models/marketModel.js';
import moment from 'moment-timezone';

const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  cron.schedule('* * * * *', async () => { // Run every minute
    try {
      const now = moment().tz("Asia/Kolkata").format('HH:mm'); // Current time in IST
      console.log(`🕒 Checking markets at ${now}`);

      // 1️⃣ Open Markets (When openTime is reached)
      const marketsToOpen = await Market.updateMany(
        { openTime: now, isBettingOpen: false }, 
        { $set: { isBettingOpen: true, openBetting: true } }
      );

      if (marketsToOpen.modifiedCount > 0) {
        console.log(`✅ ${marketsToOpen.modifiedCount} market(s) opened for betting.`);
      }

      // 2️⃣ Close Open Bets (10 minutes before closeTime)
      const tenMinutesBeforeClose = moment().tz("Asia/Kolkata").subtract(10, 'minutes').format('HH:mm');

      const marketsToCloseOpenBets = await Market.updateMany(
        { closeTime: tenMinutesBeforeClose, isBettingOpen: true, openBetting: true },
        { $set: { openBetting: false } }
      );

      if (marketsToCloseOpenBets.modifiedCount > 0) {
        console.log(`⛔ ${marketsToCloseOpenBets.modifiedCount} market(s) closed for open bets.`);
      }

      // 3️⃣ Close All Betting (When closeTime is reached)
      const marketsToClose = await Market.updateMany(
        { closeTime: now, isBettingOpen: true },
        { $set: { isBettingOpen: false } }
      );

      if (marketsToClose.modifiedCount > 0) {
        console.log(`❌ ${marketsToClose.modifiedCount} market(s) fully closed.`);
      }

    } catch (error) {
      console.error('❌ Error in managing market timings:', error);
    }
  });
};

export default manageMarketTimings;
