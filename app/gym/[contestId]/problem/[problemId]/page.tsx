import type { Metadata } from 'next';
import ClientPage from './ClientPage';

type Props = {
    params: Promise<{ contestId: string; problemId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { contestId, problemId } = await params;
    const title = `Problem ${problemId.toUpperCase()} - Gym ${contestId} | Verdict Mirror`;

    return {
        title: title,
        description: `Solve Codeforces Gym problem ${problemId.toUpperCase()} from contest ${contestId} in Mirror Mode on Verdict.`,
        openGraph: {
            title: title,
            description: `Solve this problem on Verdict Mirror Mode with integrated editor and test runner.`,
            siteName: 'Verdict',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: title,
            description: `Practice competitive programming with superior tools.`,
        },
        alternates: {
            canonical: `https://verdict.run/gym/${contestId}/problem/${problemId}`,
        }
    };
}

export default function Page() {
    return <ClientPage />;
}
