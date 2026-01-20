'use client';

import { useState, useEffect } from 'react';
import { X, Zap, AlertTriangle, Download, ArrowRight } from 'lucide-react';

export default function ExtensionOnboardingModal() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // 1. Check if user already saw this
        const hasSeen = localStorage.getItem('icpchue-extension-onboarding-seen');
        if (hasSeen) return;

        // 2. Check if extension is ALREADY installed
        // The content script injects this ID
        const isInstalled = document.getElementById('icpchue-extension-installed');
        if (isInstalled) return;

        // 3. Show after delay if not installed and first time
        const timer = setTimeout(() => setIsOpen(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('icpchue-extension-onboarding-seen', 'true');
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="w-full max-w-md bg-[#1a1a1a] border border-[#10B981]/20 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 relative">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 p-1 text-[#666] hover:text-white transition-colors rounded-full hover:bg-white/10"
                >
                    <X size={20} />
                </button>

                {/* Decorative Header */}
                <div className="h-2 w-full bg-gradient-to-r from-[#10B981] to-[#059669]" />

                <div className="p-8 pb-6">
                    {/* Icon & Title */}
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 rounded-full bg-[#10B981]/10 flex items-center justify-center mb-4 border border-[#10B981]/20">
                            <Zap size={32} className="text-[#10B981]" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Welcome to Mirror Mode!</h2>
                        <p className="text-[#A0A0A0] text-sm leading-relaxed">
                            Hi! It looks like it&apos;s your first time here. You can start solving right away, but we highly recommend our extension for the full experience.
                        </p>
                    </div>

                    {/* Features/Info */}
                    <div className="space-y-4 mb-6">
                        <div className="flex gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="shrink-0">
                                <Download size={20} className="text-[#34D399]" />
                            </div>
                            <div className="text-sm text-[#d4d4d4]">
                                The <strong>Verdict Helper</strong> extension allows you to submit code and get verdicts automatically without leaving this page. It&apos;s completely free!
                            </div>
                        </div>

                        {/* Disclaimer */}
                        <div className="flex gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/10">
                            <AlertTriangle size={16} className="text-red-400 shrink-0 mt-0.5" />
                            <p className="text-xs text-red-300/80 leading-relaxed">
                                <strong>Warning:</strong> We don&apos;t carry any responsibility if Codeforces doesn&apos;t accept the problem in a competition or if the account gets rate-limited. Use responsibly.
                            </p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="space-y-3">
                        <a
                            href="/extension"
                            target="_blank"
                            onClick={handleClose}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-gradient-to-r from-[#10B981] to-[#059669] hover:from-[#34D399] hover:to-[#10B981] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#10B981]/10 active:scale-[0.98]"
                        >
                            <Download size={18} />
                            Get Extension
                        </a>
                        <button
                            onClick={handleClose}
                            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-transparent hover:bg-white/5 text-[#888] hover:text-white font-medium rounded-xl transition-all text-sm"
                        >
                            Continue Without Extension
                            <ArrowRight size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
