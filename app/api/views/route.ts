import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth';
import { query } from '@/lib/db';

export async function POST(req: NextRequest) {
    const user = await verifyAuth(req);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { entityType, entityId } = await req.json();

        if (!entityType || !entityId) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        // 1. Log user view (Ignore duplicates if user already viewed)
        const logResult = await query(
            `INSERT INTO view_logs (user_id, entity_type, entity_id)
             VALUES ($1, $2, $3)
             ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
             RETURNING id`,
            [user.id, entityType, entityId]
        );

        // 2. If it was a new view for this user, increment the total counter
        if (logResult.rows.length > 0) {
            await query(
                `INSERT INTO page_views (entity_type, entity_id, views_count)
                 VALUES ($1, $2, 1)
                 ON CONFLICT (entity_type, entity_id)
                 DO UPDATE SET views_count = page_views.views_count + 1`,
                [entityType, entityId]
            );
        }

        // 3. Return current distinct view count
        const countRes = await query(
            `SELECT views_count FROM page_views WHERE entity_type = $1 AND entity_id = $2`,
            [entityType, entityId]
        );
        const views = countRes.rows[0]?.views_count || 0;

        return NextResponse.json({ views: Number(views) });

    } catch (error) {
        console.error('Views API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
