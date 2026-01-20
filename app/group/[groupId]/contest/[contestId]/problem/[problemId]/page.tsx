import type { Metadata } from 'next';
import ClientPage from './ClientPage';

type Props = {
    params: Promise<{ groupId: string; contestId: string; problemId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { groupId, contestId, problemId } = await params;
    const title = `Problem ${problemId.toUpperCase()} - Group ${groupId} | Verdict Mirror`;

    return {
        title: title,
        description: `Solve Codeforces problem ${problemId.toUpperCase()} from group ${groupId}, contest ${contestId} in Mirror Mode.`,
        openGraph: {
            title: title,
            description: `Solve this problem on Verdict Mirror Mode.`,
            siteName: 'Verdict',
            type: 'website',
        },
        alternates: {
            canonical: `https://verdict.run/group/${groupId}/contest/${contestId}/problem/${problemId}`,
        }
    };
}

export default function Page() {
    return <ClientPage />;
}
