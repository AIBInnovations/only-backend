import cron from 'node-cron';
import Market from '../models/marketModel.js';
import moment from 'moment';

const manageMarketTimings = () => {
  console.log('🔄 Cron job started to manage market timings.');

  cron.schedule('* * * * *', async () => { // Run every minute
    try {
      const now = moment();

      // 1. Open Markets (10 minutes before openTime)
      const marketsToOpen = await Market.findOneAndUpdate(
        { 
          openTime: { $gte: now.clone().subtract(10, 'minutes').format('HH:mm') }, 
          isBettingOpen: false 
        },
        { isBettingOpen: true, openBetting: true },
        { new: true }
      );

      if (marketsToOpen) {
        console.log(`✅ Market "${marketsToOpen.name}" is now open.`, marketsToOpen); // Log the updated market
      }

      // 2. Close Open Bets (10 minutes before closeTime)
      const marketsToCloseOpenBets = await Market.findOneAndUpdate(
        { 
          closeTime: { $gte: now.clone().subtract(10, 'minutes').format('HH:mm') }, 
          isBettingOpen: true,
          openBetting: true // Only if open bets are currently allowed
        },
        { openBetting: false },
        { new: true }
      );

      if (marketsToCloseOpenBets) {
        console.log(`⛔ Open bets for "${marketsToCloseOpenBets.name}" are now closed.`, marketsToCloseOpenBets); // Log updated market
      }


      // 3. Close All Betting (at closeTime)
      const marketsToClose = await Market.findOneAndUpdate(
        { 
          closeTime: now.format('HH:mm'), 
          isBettingOpen: true 
        },
        { isBettingOpen: false },
        { new: true }
      );

      if (marketsToClose) {
        console.log(`❌ Market "${marketsToClose.name}" is now closed.`, marketsToClose); // Log updated market
      }

    } catch (error) {
      console.error('❌ Error in managing market timings:', error.message);
    }
  });
};

export default manageMarketTimings;