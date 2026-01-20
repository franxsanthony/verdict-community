import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Training Sessions | Verdict',
    description: 'Access comprehensive competitive programming training sessions. Learn C++, algorithms, data structures, and problem-solving from expert instructors at Horus University.',
    keywords: ['ICPC training', 'competitive programming sessions', 'C++ tutorial', 'algorithm training', 'data structures course', 'Horus University'],
    openGraph: {
        title: 'Training Sessions | Verdict',
        description: 'Access comprehensive competitive programming training sessions at Horus University.',
        url: 'https://verdict.run/sessions',
        type: 'website',
        images: [
            {
                url: '/images/ui/metadata.webp',
                width: 1200,
                height: 630,
                alt: 'Verdict Training Sessions',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Training Sessions | Verdict',
        description: 'Comprehensive competitive programming training at Horus University.',
        images: ['/images/ui/metadata.webp'],
    },
    alternates: {
        canonical: 'https://verdict.run/sessions',
    },
};

export default function SessionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
