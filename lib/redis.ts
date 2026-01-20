import Redis from 'ioredis';

// Use same config as server/lib/redis.js
const REDIS_HOST = process.env.REDIS_HOST || 'redis'; // Docker service name
const REDIS_PORT = parseInt(process.env.REDIS_PORT || '6379', 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD;
if (!REDIS_PASSWORD) throw new Error("REDIS_PASSWORD is not set");

// Use singleton pattern to avoid multiple connections in dev hot-reload
const globalForRedis = global as unknown as { redis: Redis };

export const redis =
    globalForRedis.redis ||
    new Redis({
        host: REDIS_HOST,
        port: REDIS_PORT,
        password: REDIS_PASSWORD,
        db: 2, // Using DB 2 to isolate from ICPC HUE (DB 1) & Judge0 (DB 0)
        keyPrefix: 'verdict:', // Unique prefix
        retryStrategy: (times) => {
            return Math.min(times * 50, 2000);
        },
    });

if (process.env.NODE_ENV !== 'production') globalForRedis.redis = redis;

export default redis;
