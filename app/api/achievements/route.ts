import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { verifyAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const authResult = await verifyAuth(req);
    if (!authResult) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = authResult;

    try {
        const result = await query(
            `SELECT id, achievement_id, earned_at, seen FROM user_achievements WHERE user_id = $1 ORDER BY seen ASC, earned_at DESC`,
            [user.id]
        );
        return NextResponse.json({ achievements: result.rows });
    } catch (error) {
        console.error('Error fetching achievements:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
