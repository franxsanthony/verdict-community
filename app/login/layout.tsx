
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Login - Verdict',
    description: 'Sign in to your Verdict account to access competitive programming tools and track your progress.',
    alternates: {
        canonical: './',
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
