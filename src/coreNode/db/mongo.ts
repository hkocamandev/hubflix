import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export const connectCoreDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI!, { dbName: "hubflix" });
    console.log("Core Node MongoDB connected");
  } catch (err) {
    console.error("DB connection error:", err);
    process.exit(1);
  }
};
