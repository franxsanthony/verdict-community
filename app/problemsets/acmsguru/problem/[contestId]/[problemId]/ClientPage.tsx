'use client';

import CodeforcesMirrorPage from '@/app/contest/[contestId]/problem/[problemId]/ClientPage';

/**
 * Acmsguru legacy archive route
 * Pattern: /problemsets/acmsguru/problem/{dummyId}/{problemNumber}
 * Example: /problemsets/acmsguru/problem/99999/112
 * 
 * Note: checks if the dummyId is present in params in the component if needed, 
 * but usually we handle this via urlType="acmsguru".
 */
export default function AcmsguruPage() {
    return <CodeforcesMirrorPage forcedType="acmsguru" />;
}
