import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, ChevronLeft, ChevronRight, Clock, HardDrive, FileText, Code } from 'lucide-react';
import { Problem } from './types';

interface ProblemHeaderProps {
    sheetId: string;
    problem: Problem | null;
    mobileView: 'problem' | 'code';
    setMobileView: (view: 'problem' | 'code') => void;
    navigationBaseUrl: string;
}

export default function ProblemHeader({ problem, mobileView, setMobileView, navigationBaseUrl }: ProblemHeaderProps) {
    const title = problem?.title || 'Loading...';
    // Remove duplication if title starts with ID
    const showIdPrefix = problem?.id && !title.startsWith(problem.id + '.');

    // Navigation Heuristics
    const currentId = problem?.id || '';

    const getNextId = (id: string) => {
        if (!id) return null;
        // Check if ends with digit (e.g. C1 -> C2)
        const digitMatch = id.match(/(\d+)$/);
        if (digitMatch) {
            const num = parseInt(digitMatch[1]);
            const prefix = id.slice(0, -digitMatch[0].length);
            return `${prefix}${num + 1}`;
        }
        // Check if ends with letter
        const charCode = id.charCodeAt(id.length - 1);
        if (charCode >= 65 && charCode < 90) { // A-Y
            return id.slice(0, -1) + String.fromCharCode(charCode + 1);
        }
        return null;
    };

    const getPrevId = (id: string) => {
        if (!id) return null;
        const digitMatch = id.match(/(\d+)$/);
        if (digitMatch) {
            const num = parseInt(digitMatch[1]);
            if (num > 1) {
                const prefix = id.slice(0, -digitMatch[0].length);
                return `${prefix}${num - 1}`;
            }
            return null;
        }
        const charCode = id.charCodeAt(id.length - 1);
        if (charCode > 65 && charCode <= 90) { // B-Z
            return id.slice(0, -1) + String.fromCharCode(charCode - 1);
        }
        return null;
    };

    const prevId = getPrevId(currentId);
    const nextId = getNextId(currentId);

    return (
        <div className="sticky top-0 z-10 w-full shrink-0 flex flex-col bg-[#121212] border-b border-white/10 transition-all duration-200">
            {/* Top Bar: Navigation & Title */}
            <div className="h-14 flex items-center justify-between px-4 w-full">
                <div className="flex items-center gap-4">
                    <Link href="/" className="group flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                        <ArrowLeft size={18} />
                        <span className="text-sm font-medium hidden sm:block">Back</span>
                    </Link>

                    <div className="h-4 w-px bg-white/10 mx-2 hidden sm:block" />

                    <div className="flex items-center gap-3 sm:gap-4">
                        <h1 className="font-bold text-white truncate max-w-[140px] xs:max-w-[180px] sm:max-w-md text-sm md:text-base flex items-center gap-2">
                            {showIdPrefix && <span className="text-[#10B981]">{problem?.id}.</span>}
                            <span className="truncate">{title}</span>
                        </h1>

                        {/* Navigation Arrows */}
                        <div className="flex items-center gap-1">
                            <Link
                                href={prevId ? `${navigationBaseUrl}/${prevId}` : '#'}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${prevId ? 'text-white/80 hover:text-white' : 'text-white/20 cursor-not-allowed pointer-events-none'}`}
                                aria-disabled={!prevId}
                            >
                                <ChevronLeft size={18} />
                            </Link>
                            <Link
                                href={nextId ? `${navigationBaseUrl}/${nextId}` : '#'}
                                className={`p-1 rounded hover:bg-white/10 transition-colors ${nextId ? 'text-white/80 hover:text-white' : 'text-white/20 cursor-not-allowed pointer-events-none'}`}
                                aria-disabled={!nextId}
                            >
                                <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Right Side: Limits & Logo (Desktop Only) */}
                <div className="hidden md:flex items-center gap-6">
                    {problem && (
                        <div className="flex items-center gap-4 text-xs text-white/40 font-mono">
                            <span className="flex items-center gap-1.5">
                                <Clock size={14} />
                                {(problem.timeLimit / 1000).toString().replace(/\.0+$/, '')}s
                            </span>
                            <span className="flex items-center gap-1.5">
                                <HardDrive size={14} />
                                {problem.memoryLimit}MB
                            </span>
                        </div>
                    )}

                    <div className="flex items-center">
                        <Link href="/" className="opacity-80 hover:opacity-100 transition-opacity">
                            <Image
                                src="/icons/logo.webp"
                                alt="Verdict"
                                width={32}
                                height={32}
                                className="rounded-full"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile View Toggle Tabs (Row 2) */}
            <div className="flex md:hidden w-full border-t border-white/10">
                <button
                    onClick={() => setMobileView('problem')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative
                        ${mobileView === 'problem' ? 'text-white bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    <FileText size={16} />
                    <span>Problem</span>
                    {mobileView === 'problem' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                    )}
                </button>
                <button
                    onClick={() => setMobileView('code')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors relative
                        ${mobileView === 'code' ? 'text-white bg-white/5' : 'text-white/60 hover:text-white hover:bg-white/5'}`}
                >
                    <Code size={16} />
                    <span>Code</span>
                    {mobileView === 'code' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#10B981]" />
                    )}
                </button>
            </div>
        </div>
    );
}
