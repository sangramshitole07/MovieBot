import mongoose from "mongoose";

const connection: { isConnected?: number } = {};

export async function connect() {
  try {
    // If already connected, return early
    if (connection.isConnected) {
      console.log("✅ Already connected to MongoDB");
      return;
    }

    const mongoUri = process.env.MONGO_URL;

    console.log("✅ MONGO_URL =", mongoUri); // Debug log

    if (!mongoUri) {
      throw new Error("❌ MONGO_URL is undefined. Check your .env.local file.");
    }

    await mongoose.connect(mongoUri, {
      bufferCommands: false,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4
    });
    
    // Wait for connection to be fully established
    while (mongoose.connections[0].readyState !== 1) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
    
    connection.isConnected = mongoose.connections[0].readyState;
    console.log("✅ MongoDB connected successfully");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}