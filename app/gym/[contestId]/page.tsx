
import { redirect } from 'next/navigation';

export default async function GymRedirect({ params }: { params: Promise<{ contestId: string }> }) {
    const { contestId } = await params;
    redirect(`/gym/${contestId}/problem/A`);
}
