import type { Metadata } from 'next';
import ClientPage from './ClientPage';

type Props = {
    params: Promise<{ contestId: string; problemId: string }>;
    searchParams: Promise<{ type?: string }>;
};

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
    const { contestId, problemId } = await params;
    const { type } = await searchParams;

    const displayType = type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Contest';
    const title = `Problem ${problemId.toUpperCase()} - ${displayType} ${contestId} | Verdict Mirror`;

    return {
        title: title,
        description: `Solve Codeforces problem ${problemId.toUpperCase()} from ${displayType.toLowerCase()} ${contestId} in Mirror Mode on Verdict. Features an integrated code editor, test case runner, and analytics.`,
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
            canonical: `https://verdict.run/contest/${contestId}/problem/${problemId}`,
        }
    };
}

export default function Page() {
    return <ClientPage />;
}
