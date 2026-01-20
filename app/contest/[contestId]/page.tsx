
import { redirect } from 'next/navigation';

export default async function ContestRedirect({ params }: { params: Promise<{ contestId: string }> }) {
    const { contestId } = await params;
    redirect(`/contest/${contestId}/problem/A`);
}
