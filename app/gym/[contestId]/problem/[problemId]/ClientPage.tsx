'use client';

import CodeforcesMirrorPage from '@/app/contest/[contestId]/problem/[problemId]/ClientPage';

/**
 * Gym problems route
 * Pattern: /gym/{contestId}/problem/{problemId}
 * Example: /gym/102951/problem/B
 * 
 * Renders the CodeforcesMirrorPage with forcedType="gym" to maintain the URL structure 
 * while reusing the submission/view logic.
 */
export default function GymProblemPage() {
    return <CodeforcesMirrorPage forcedType="gym" />;
}
