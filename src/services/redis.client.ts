import { createClient } from "redis";
import { redisConfig } from "../utility/redis.config.ts";

export const redisIntance = createClient({
  socket: {
    host: redisConfig.host,
    port: redisConfig.port,
  },
});

redisIntance.on("error", (err) => {
  console.error(" Redis error:", err);
});

redisIntance.on("connect", () => {
  console.log(" Redis connected");
});

