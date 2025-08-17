import dotenv from "dotenv";
dotenv.config();
import Redis from "ioredis";

const redisHost = process.env.REDIS_HOST || "redis"; // docker-compose servis adı
const redisPort = Number(process.env.REDIS_PORT) || 6379;

const redis = new Redis({
  host: redisHost,
  port: redisPort,
});

redis.on("connect", () => {
    console.log("Connecting to Redis at", redisHost, "port", redisPort);

  console.log("Connected to Redis");
});

redis.on("error", (err) => {
  console.error("Redis error", err);
});

export default redis;