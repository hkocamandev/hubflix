/**
 * Hubflix Core Redis Client
 * Establishes a Redis connection using environment variables or default values.
 * Provides centralized Redis instance for caching and other fast data storage needs.
 */

import dotenv from "dotenv";
dotenv.config();
import Redis from "ioredis";

// Redis connection configuration
const redisHost = process.env.REDIS_HOST || "redis"; // Default to Docker service name
const redisPort = Number(process.env.REDIS_PORT) || 6379;

// Create Redis client instance
const redis = new Redis({
  host: redisHost,
  port: redisPort,
});

// Event listener: successful connection
redis.on("connect", () => {
  console.log("Connecting to Redis at", redisHost, "port", redisPort);
  console.log("Connected to Redis");
});

// Event listener: connection or runtime errors
redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;
