'use client';

import CodeforcesMirrorPage from '@/app/contest/[contestId]/problem/[problemId]/ClientPage';

/**
 * Group problems route
 * Pattern: /group/{groupId}/contest/{contestId}/problem/{problemIndex}
 * Example: /group/M1Z4j3/contest/100234/problem/D
 */
export default function GroupProblemPage() {
    return <CodeforcesMirrorPage forcedType="group" />;
}
