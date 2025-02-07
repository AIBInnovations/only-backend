import cron from 'node-cron';
import Market from '../models/marketModel.js';
import moment from 'moment-timezone';

const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  cron.schedule('* * * * *', async () => { // Run every minute
    try {
      const now = moment().tz("Asia/Kolkata"); // Set to your desired timezone (e.g., IST)
      const currentTime = now.format('HH:mm');


      // 1. Open Markets (10 minutes before openTime)
      const openQuery = {
        openTime: { $gte: now.clone().subtract(10, 'minutes').format('HH:mm') },
        isBettingOpen: false,
      };

      console.log("Open Markets Query:", openQuery);
      console.log("Current Time:", now.format('HH:mm'));

      const marketsToOpen = await Market.findOneAndUpdate(openQuery, { isBettingOpen: true, openBetting: true }, { new: true });

      if (marketsToOpen) {
        console.log(`✅ Market "${marketsToOpen.name}" is now open.`, marketsToOpen);
      }

      // 2. Close Open Bets (10 minutes before closeTime)
      const closeOpenBetsQuery = {
        closeTime: { $gte: now.clone().subtract(10, 'minutes').format('HH:mm') },
        isBettingOpen: true,
        openBetting: true,
      };

      console.log("Close Open Bets Query:", closeOpenBetsQuery);

      const marketsToCloseOpenBets = await Market.findOneAndUpdate(closeOpenBetsQuery, { openBetting: false }, { new: true });

      if (marketsToCloseOpenBets) {
        console.log(`⛔ Open bets for "${marketsToCloseOpenBets.name}" are now closed.`, marketsToCloseOpenBets);
      }

      // 3. Close All Betting (at closeTime)
      const closeAllBetsQuery = {
        closeTime: now.format('HH:mm'),
        isBettingOpen: true,
      };

      console.log("Close All Bets Query:", closeAllBetsQuery);

      const marketsToClose = await Market.findOneAndUpdate(closeAllBetsQuery, { isBettingOpen: false }, { new: true });

      if (marketsToClose) {
        console.log(`❌ Market "${marketsToClose.name}" is now closed.`, marketsToClose);
      }

    } catch (error) {
      console.error('❌ Error in managing market timings:', error); // Log the full error object
    }
  });
};

export default manageMarketTimings;