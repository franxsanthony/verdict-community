
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog - Verdict',
    description: 'Latest updates, engineering deep dives, and tutorials from the Verdict team.',
    alternates: {
        canonical: './',
    },
};

export default function BlogLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
