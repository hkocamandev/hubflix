import mongoose from 'mongoose';

const dbUri = process.env.MONGO_URI || 'mongodb://localhost:27017/hubflix';

const connectCoreDB = async () => {
  try {
    await mongoose.connect(dbUri);
    console.log('MongoDB connection successful');
  } catch (error) {
    console.error('DB connection error:', error);
    // Hata durumunda uygulamayı sonlandırın
    process.exit(1);
  }
};

export default connectCoreDB;