'use client';

export default function DashboardHome() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center space-y-8 animate-fade-in pt-32">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-500 pb-2">
                    Welcome to Verdict
                </h1>
                <div className="h-1 w-24 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-auto rounded-full opacity-50"></div>
            </div>

            <p className="text-xl md:text-2xl text-white/50 max-w-2xl mx-auto font-light leading-relaxed">
                Thanks for signing in.
                <br />
                Wait for the next update.
                <br />
                <span className="text-white/90 font-medium mt-4 block text-3xl">It&apos;s gonna be fire. 🔥</span>
            </p>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fadeIn 0.6s ease-out forwards; }
            `}</style>
        </div>
    );
}
