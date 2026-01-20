
import Link from 'next/link';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 text-center">
            <h1 className="text-9xl font-black text-white/5 select-none">404</h1>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
                <p className="text-white/50 mb-8 max-w-md">
                    The page you are looking for does not exist or has been moved.
                </p>
                <Link
                    href="/"
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl transition-all"
                >
                    Return Home
                </Link>
            </div>
        </div>
    );
}
