import cron from 'node-cron';
import Market from '../models/marketModel.js';
import moment from 'moment';

const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  cron.schedule('* * * * *', async () => { // Run every minute
    try {
      const now = moment();

      // 1. Open Markets (10 minutes before openTime)
      const marketsToOpen = await Market.find({
        openTime: { $gte: now.clone().subtract(10, 'minutes').format('HH:mm') },
        isBettingOpen: false,
      });

      for (const market of marketsToOpen) {
        if (moment(market.openTime, "HH:mm").isSameOrBefore(now)) {
          market.isBettingOpen = true;
          market.openBetting = true; // Enable Open bets
          await market.save();
          console.log(`✅ Market "${market.name}" is now open.`);
        }
      }

      // 2. Close Open Bets (10 minutes before closeTime)
      const marketsToCloseOpenBets = await Market.find({
        closeTime: { $gte: now.clone().subtract(10, 'minutes').format('HH:mm') },
        isBettingOpen: true,
        openBetting: true, // Only if open bets are currently allowed
      });

      for (const market of marketsToCloseOpenBets) {
        if (moment(market.closeTime, "HH:mm").isSameOrBefore(now)) {
          market.openBetting = false; // Block Open bets
          await market.save();
          console.log(`⛔ Open bets for "${market.name}" are now closed.`);
        }
      }

      // 3. Close All Betting (at closeTime)
      const marketsToClose = await Market.find({
        closeTime: now.format('HH:mm'), // Close at closeTime
        isBettingOpen: true,
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