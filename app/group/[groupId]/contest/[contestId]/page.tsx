
import { redirect } from 'next/navigation';

export default async function GroupContestRedirect({ params }: { params: Promise<{ groupId: string, contestId: string }> }) {
    const { groupId, contestId } = await params;
    redirect(`/group/${groupId}/contest/${contestId}/problem/A`);
}
