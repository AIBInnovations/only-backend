import mongoose from "mongoose";
import cron from "node-cron";
import moment from "moment";
import connectDB from "../config/db.js";

// Connect to MongoDB
await connectDB();

// Define Market Schema (Only if not already defined)
const marketSchema = new mongoose.Schema({
  openTime: String, // Stored as "10:00 AM"
  closeTime: String, // Stored as "06:00 PM"
  openBetting: Boolean,
  isBettingOpen: Boolean,
});

// Prevent overwriting the model
const Market = mongoose.models.Market || mongoose.model("Market", marketSchema);

// Function to schedule market updates
export const scheduleMarketTasks = async () => {
  console.log(`[${moment().format("YYYY-MM-DD hh:mm A")}] Fetching market timings...`);

  try {
    const markets = await Market.find({});
    console.log("Markets Found:", markets); // Debugging log

    if (markets.length === 0) {
      console.log("❌ No markets found in the database.");
      return;
    }

    const now = moment();

    markets.forEach((market) => {
      console.log(`Processing Market ID: ${market._id}, Open: ${market.openTime}, Close: ${market.closeTime}`);

      const openTime = moment(market.openTime, "hh:mm A");
      const closeTime = moment(market.closeTime, "hh:mm A");

      const openDelay = openTime.diff(now) - 10 * 60 * 1000;
      const closeDelay = closeTime.diff(now) - 10 * 60 * 1000;

      console.log(`Market ${market._id} - openDelay: ${openDelay / 1000}s, closeDelay: ${closeDelay / 1000}s`);

      if (openDelay > 0) {
        console.log(`Market ${market._id} - openBetting will be closed at ${openTime.format("hh:mm A")}.`);
        setTimeout(async () => {
          await Market.updateOne({ _id: market._id }, { openBetting: false });
          console.log(`[${moment().format("hh:mm A")}] Market ${market._id}: openBetting closed.`);
        }, openDelay);
      }

      if (closeDelay > 0) {
        console.log(`Market ${market._id} - isBettingOpen will be closed at ${closeTime.format("hh:mm A")}.`);
        setTimeout(async () => {
          await Market.updateOne({ _id: market._id }, { isBettingOpen: false });
          console.log(`[${moment().format("hh:mm A")}] Market ${market._id}: isBettingOpen closed.`);
        }, closeDelay);
      }
    });

  } catch (error) {
    console.error("❌ Error fetching market data:", error);
  }
};

// Run the cron job at 4 AM daily
cron.schedule("0 4 * * *", scheduleMarketTasks);

console.log("Market Scheduler started! Running daily at 4 AM.");
