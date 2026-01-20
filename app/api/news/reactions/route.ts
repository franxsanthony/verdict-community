import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth'; // Ensure we can get user ID if logged in (optional for GET?)
// Express logic: 
// GET: userId = req.user.id || req.user.userId (handles optional auth? No, existing code implies it might accept unauth if handled, but middleware `authenticateToken` was used. Wait, `router.get('/news/reactions', standardLimiter, authenticateToken, contentController.getReactions)` -> Auth IS required.)
import { redis } from '@/lib/redis';

export async function GET(req: NextRequest) {
    const authResult = await verifyAuth(req);
    // Express used authenticateToken, so we require auth
    if (!authResult) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult;
    const userId = user.id;

    const { searchParams } = new URL(req.url);
    const newsId = searchParams.get('newsId');
    const newsIdsParam = searchParams.get('newsIds');

    if (!newsId && !newsIdsParam) {
        return NextResponse.json({ error: 'newsId or newsIds is required' }, { status: 400 });
    }

    const ids = newsIdsParam ? newsIdsParam.split(',') : [newsId!];
    if (ids.length === 0) return NextResponse.json({});

    const responseMap: Record<string, any> = {};
    const idsToFetch: string[] = [];

    try {
        // --- REDIS CACHING ---
        let cacheResults: (string | null)[] = [];
        const isRedisReady = redis.status === 'ready';

        if (isRedisReady) {
            try {
                // Pipeline not directly supported by ioredis instance wrapper if not explicit, 
                // but ioredis supports pipeline().
                const pipeline = redis.pipeline();
                ids.forEach(id => pipeline.get(`web:news:counts:${id}`));
                const results = await pipeline.exec();
                // results is [[err, result], ...]
                cacheResults = results ? results.map(r => r[1] as string | null) : [];
            } catch (e) {
                console.error('Redis pipeline failed:', e);
                cacheResults = ids.map(() => null);
            }
        } else {
            cacheResults = ids.map(() => null);
        }

        ids.forEach((id, index) => {
            const cachedCounts = cacheResults[index];
            responseMap[id] = { counts: { like: 0, heart: 0, fire: 0 }, userReactions: [] };

            // ioredis pipeline results can be null if key doesn't exist
            if (cachedCounts) {
                try {
                    responseMap[id].counts = JSON.parse(cachedCounts);
                } catch (e) {
                    idsToFetch.push(id); // Parse error, fetch again
                }
            } else {
                idsToFetch.push(id);
            }
        });

        // Fetch Missing from DB
        if (idsToFetch.length > 0) {
            const countsResult = await query(
                `SELECT news_id, reaction_type, COUNT(*) as count 
                 FROM news_reactions 
                 WHERE news_id = ANY($1) 
                 GROUP BY news_id, reaction_type`,
                [idsToFetch]
            );

            const dbCountsMap: Record<string, any> = {};
            idsToFetch.forEach(id => dbCountsMap[id] = { like: 0, heart: 0, fire: 0 });

            countsResult.rows.forEach((row: any) => {
                if (dbCountsMap[row.news_id]) {
                    dbCountsMap[row.news_id][row.reaction_type] = parseInt(row.count);
                }
            });

            // Update Response & Cache
            idsToFetch.forEach(id => {
                const counts = dbCountsMap[id];
                responseMap[id].counts = counts;
            });

            if (isRedisReady) {
                const savePipeline = redis.pipeline();
                idsToFetch.forEach(id => {
                    savePipeline.setex(`web:news:counts:${id}`, 60, JSON.stringify(responseMap[id].counts));
                });
                await savePipeline.exec().catch(e => console.error('Redis save failed', e));
            }
        }

        // User Reactions (Always fetch fresh)
        const userReactionsResult = await query(
            `SELECT news_id, reaction_type FROM news_reactions WHERE news_id = ANY($1) AND user_id = $2`,
            [ids, userId]
        );

        userReactionsResult.rows.forEach((row: any) => {
            if (responseMap[row.news_id]) {
                responseMap[row.news_id].userReactions.push(row.reaction_type);
            }
        });

        if (newsId && !newsIdsParam) {
            return NextResponse.json(responseMap[newsId]);
        }
        return NextResponse.json(responseMap);

    } catch (error) {
        console.error('Error fetching reactions:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const authResult = await verifyAuth(req);
    if (!authResult) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult;
    const userId = user.id;

    try {
        const body = await req.json();
        const { newsId, reactionType } = body;

        if (!newsId || !reactionType) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }
        if (!['like', 'heart', 'fire'].includes(reactionType)) {
            return NextResponse.json({ error: 'Invalid reaction type' }, { status: 400 });
        }

        const existing = await query(
            'SELECT id FROM news_reactions WHERE news_id = $1 AND user_id = $2 AND reaction_type = $3',
            [newsId, userId, reactionType]
        );

        const isRedisReady = redis.status === 'ready';

        if (existing.rows.length > 0) {
            await query(
                'DELETE FROM news_reactions WHERE news_id = $1 AND user_id = $2 AND reaction_type = $3',
                [newsId, userId, reactionType]
            );
            if (isRedisReady) await redis.del(`web:news:counts:${newsId}`).catch(() => { });
            return NextResponse.json({ action: 'removed', reactionType });
        } else {
            await query(
                'INSERT INTO news_reactions (news_id, user_id, reaction_type) VALUES ($1, $2, $3)',
                [newsId, userId, reactionType]
            );
            if (isRedisReady) await redis.del(`web:news:counts:${newsId}`).catch(() => { });
            return NextResponse.json({ action: 'added', reactionType });
        }

    } catch (error) {
        console.error('Error toggling reaction:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
