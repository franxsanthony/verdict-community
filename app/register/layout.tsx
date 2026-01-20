
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Register - Verdict',
    description: 'Create a new Verdict account to start your competitive programming journey.',
    alternates: {
        canonical: './',
    },
};

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
