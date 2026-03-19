// Define the connection string.
// In Docker Compose, 'redis' is the hostname of your redis service.
const REDIS_URL = process.env.REDIS_URL || "redis://redis:6379";

import { RedisClient } from "bun";

// Initialize connection with the correct URL
let redis = new RedisClient(REDIS_URL)

redis.onconnect = () => {
  console.log("🚀 Redis connected successfully at " + REDIS_URL);
};

redis.onclose = (error) => {
  if (error) {
    console.error("❌ Redis connection lost:", error);
  }
};

export default redis;
