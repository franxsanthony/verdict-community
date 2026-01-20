
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Dashboard - Verdict',
    description: 'Your competitive programming command center.',
    alternates: {
        canonical: './',
    },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
