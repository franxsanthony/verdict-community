'use client';

import CodeforcesMirrorPage from '@/app/contest/[contestId]/problem/[problemId]/ClientPage';

/**
 * Problemset problems route
 * Pattern: /problemset/problem/{contestId}/{problemIndex}
 * Example: /problemset/problem/4/A
 */
export default function ProblemsetPage() {
    return <CodeforcesMirrorPage forcedType="problemset" />;
}
