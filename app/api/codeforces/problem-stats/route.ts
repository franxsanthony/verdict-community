import { NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/simple-rate-limit';

// Simple in-memory cache
// Map: "contestId-index" -> { rating, solvedCount }
let cache: Record<string, { rating?: number; solvedCount: number }> | null = null;
let lastFetch = 0;
// Cache for 1 hour to handle "Low Cost" requirement
const CACHE_DURATION = 1000 * 60 * 60;

export async function GET(request: Request) {
    const ip = request.headers.get('x-forwarded-for') || 'unknown-ip';
    if (!checkRateLimit(`probstats:${ip}`, 60, 60)) {
        return NextResponse.json({ error: 'Too Many Requests' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const contestId = searchParams.get('contestId');
    const index = searchParams.get('index')?.toUpperCase();

    if (!contestId || !index) {
        return NextResponse.json({ error: 'Missing contestId or index' }, { status: 400 });
    }

    const now = Date.now();

    // Refresh cache if needed
    if (!cache || now - lastFetch > CACHE_DURATION) {
        try {
            const res = await fetch('https://codeforces.com/api/problemset.problems');
            if (!res.ok) throw new Error(`CF API responded with ${res.status}`);

            const data = await res.json();
            if (data.status !== 'OK') throw new Error(`CF API status: ${data.status}`);

            // Rebuild cache
            const newCache: typeof cache = {};
            const problems = data.result.problems;
            const statistics = data.result.problemStatistics;

            // The arrays correspond 1-to-1 in the API response
            for (let i = 0; i < problems.length; i++) {
                const p = problems[i];
                const s = statistics[i];
                // Key format: "123-A"
                const key = `${p.contestId}-${p.index}`;

                newCache[key] = {
                    rating: p.rating, // Optional (might be null for unrated)
                    solvedCount: s.solvedCount
                };
            }

            cache = newCache;
            lastFetch = now;
            } catch (error) {
            console.error('[CF API Error]', error);
            // If cache exists but stale, return it? Or error?
            // If we have nothing, we must error.
            if (!cache) {
                return NextResponse.json({ error: 'Failed to fetch Codeforces data' }, { status: 502 });
            }
            // Use stale cache if fetch failed
            console.warn('[CF API] Serving stale cache due to fetch error.');
        }
    }

    const key = `${contestId}-${index}`;
    const stats = cache![key];

    if (!stats) {
        // Return null/empty stats for Gym problems (or not found) 
        // to avoid 404 console errors on frontend.
        return NextResponse.json(null);
    }

    return NextResponse.json(stats);
}
