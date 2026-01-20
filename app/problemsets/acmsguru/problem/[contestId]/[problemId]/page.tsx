import type { Metadata } from 'next';
import ClientPage from './ClientPage';

type Props = {
    params: Promise<{ contestId: string; problemId: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { contestId, problemId } = await params;
    const title = `Problem ${problemId} - acmsguru | Verdict Mirror`;

    return {
        title: title,
        description: `Solve acmsguru problem ${problemId} in Mirror Mode on Verdict.`,
        openGraph: {
            title: title,
            description: `Solve this problem on Verdict Mirror Mode.`,
            siteName: 'Verdict',
            type: 'website',
        },
        alternates: {
            canonical: `https://verdict.run/problemsets/acmsguru/problem/${contestId}/${problemId}`,
        }
    };
}

export default function Page() {
    return <ClientPage />;
}
