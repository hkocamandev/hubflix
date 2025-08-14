import mongoose from "mongoose";

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || "";
  if (!uri) {
    console.error("MONGO_URI is not set");
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
};