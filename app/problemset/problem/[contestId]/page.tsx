
import { redirect } from 'next/navigation';

export default async function ProblemsetRedirect({ params }: { params: Promise<{ contestId: string }> }) {
    const { contestId } = await params;
    redirect(`/problemset/problem/${contestId}/A`);
}
