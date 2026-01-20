'use client';

import { motion } from 'framer-motion';

const steps = [
    {
        quarter: 'Jan 18, 2026',
        status: 'Launched',
        title: 'Core Platform',
        description: 'Instant Codeforces mirror, VS Code + Whiteboard workflow, local judge, and analytics. We solved the 15s tab-switching headache.'
    },
    {
        quarter: 'Coming Soon',
        status: 'In Progress',
        title: 'Multiplayer Rooms',
        description: 'Real-time collaborative coding rooms. Send a link to a friend, recruiter, or professor and solve hard problems together on the cloud.'
    },
    {
        quarter: 'Future',
        status: 'Planned',
        title: 'AI Trainer',
        description: 'Personalized problem recommendations and intelligent hints that analyze your code to guide you without giving away the answer.'
    },
    {
        quarter: 'Future',
        status: 'Planned',
        title: 'Verdicts API',
        description: 'Public API access for developers to build their own tools on top of our high-speed judging and mirroring infrastructure.'
    }
];

export default function Roadmap() {
    return (
        <section className="relative z-10 py-16 md:py-32 bg-black border-t border-white/5 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 md:px-6 relative z-10">
                <div className="mb-12 md:mb-20 text-center">
                    <h2 className="text-3xl md:text-5xl font-black tracking-tighter text-white mb-4 md:mb-6">
                        Product Roadmap
                    </h2>
                    <p className="text-base md:text-lg text-white/50 max-w-2xl mx-auto leading-relaxed px-2">
                        We are just getting started. Here is our plan to revolutionize competitive programming, step by step.
                    </p>
                </div>

                <div className="relative mt-20">
                    {/* Horizontal Line (Desktop) */}
                    <div className="absolute top-12 left-0 w-full h-[1px] bg-white/10 hidden md:block" />

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-4 relative text-center">
                        {steps.map((step, index) => (
                            <div key={index} className="relative flex flex-col items-center group">

                                {/* Date Pill (Above Line) */}
                                <div className="mb-8 relative z-20">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${index < 2 ? 'bg-white text-black border-white' : 'bg-[#111] text-white/40 border-white/10'}`}>
                                        {step.quarter}
                                    </span>
                                </div>

                                {/* Dot on Line */}
                                <div className="absolute top-12 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center">
                                    <div className={`w-4 h-4 rounded-full border-4 z-10 transition-colors duration-500 ${index < 2 ? 'border-white bg-black' : 'border-[#222] bg-black'}`} />
                                    {index === 1 && (
                                        <div className="absolute inset-0 bg-white/30 blur-md rounded-full animate-pulse" />
                                    )}
                                </div>

                                {/* Content (Below Line) */}
                                <div className="mt-12 md:px-4">
                                    <h3 className={`text-lg font-bold mb-2 ${index < 2 ? 'text-white' : 'text-white/40'}`}>
                                        {step.title}
                                    </h3>
                                    <p className={`text-sm leading-relaxed max-w-[200px] mx-auto ${index < 2 ? 'text-white/60' : 'text-white/20'}`}>
                                        {step.description}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        </section>
    );
}
