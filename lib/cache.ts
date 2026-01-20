import { redis } from './redis';

export async function getOrSetCache<T>(
    key: string,
    callback: () => Promise<T>,
    ttlSeconds: number = 60
): Promise<T> {
    const cached = await redis.get(key);

    if (cached) {
        try {
            return JSON.parse(cached) as T;
        } catch (e) {
            console.error('Cache parse error:', e);
        }
    }

    const data = await callback();

    if (data) {
        await redis.setex(key, ttlSeconds, JSON.stringify(data));
    }

    return data;
}

export async function invalidateCache(pattern: string) {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
        await redis.del(...keys);
    }
}
