import {
    CheckCircle2,
    XCircle,
    Play,
    Minimize2,
    CloudUpload,
    Clock,
    Database,
    Loader2
} from 'lucide-react';
import { SubmissionResult, Example } from './types';

interface TestRunnerPanelProps {
    height: string;
    activeTab: 'testcase' | 'result';
    setActiveTab: (tab: 'testcase' | 'result') => void;
    selectedTestCase: number;
    setSelectedTestCase: (index: number) => void;
    testCases: Example[];
    result: SubmissionResult | null;
    hasSubmitted: boolean;
    onClose: () => void;
    onResizeStart: (e: React.MouseEvent | React.TouchEvent) => void;
}

export default function TestRunnerPanel({
    height,
    activeTab,
    setActiveTab,
    selectedTestCase,
    setSelectedTestCase,
    testCases,
    result,
    hasSubmitted,
    onClose,
    onResizeStart
}: TestRunnerPanelProps) {

    const getVerdictIcon = (verdict: string) => {
        if (verdict === 'Accepted') return <CheckCircle2 size={18} className="text-green-400" />;
        if (verdict.includes('Wrong')) return <XCircle size={18} className="text-red-400" />;
        if (verdict.includes('Time')) return <Clock size={18} className="text-yellow-400" />;
        if (verdict.includes('Memory')) return <Database size={18} className="text-blue-400" />;
        if (verdict.includes('Testing') || verdict.includes('Running')) return <Loader2 size={18} className="text-blue-400 animate-spin" />;
        if (verdict.includes('Queue') || verdict === 'Submitted') return <Loader2 size={18} className="text-gray-400 animate-spin" />;
        if (verdict.includes('Timeout')) return <Clock size={18} className="text-orange-400" />;
        if (verdict.includes('Compilation')) return <XCircle size={18} className="text-orange-400" />;
        if (verdict.includes('Runtime')) return <XCircle size={18} className="text-purple-400" />;
        return <XCircle size={18} className="text-red-400" />;
    };

    const getVerdictShort = (verdict: string) => {
        if (verdict === 'Accepted') return 'AC';
        if (verdict.includes('Wrong')) return 'WA';
        if (verdict.includes('Time Limit')) return 'TLE';
        if (verdict.includes('Memory')) return 'MLE';
        if (verdict.includes('Compilation')) return 'CE';
        if (verdict.includes('Runtime')) return 'RE';
        if (verdict.includes('Testing') || verdict.includes('Running')) return 'RUN';
        if (verdict.includes('Queue') || verdict === 'Submitted') return '...';
        if (verdict.includes('Timeout')) return 'T/O';
        return verdict.slice(0, 3).toUpperCase();
    };

    return (
        <>
            {/* Vertical Resizer Bar */}
            <div
                className="h-1.5 bg-[#1a1a1a] hover:bg-[#10B981]/50 cursor-row-resize transition-colors relative group shrink-0 border-y border-white/5 active:bg-[#10B981]/50 touch-none"
                onMouseDown={onResizeStart}
                onTouchStart={onResizeStart}
            >
                <div className="absolute inset-x-0 -top-1 -bottom-1" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-1 bg-white/20 rounded-full group-hover:bg-[#10B981]/50 transition-colors" />
            </div>

            {/* Test Case Panel Content */}
            <div
                className="bg-[#1a1a1a] flex flex-col min-h-0 shrink-0"
                style={{ height }}
            >
                {/* Headers */}
                <div className="flex items-center justify-between border-b border-white/10 shrink-0 px-2 bg-[#252526]">
                    <div className="flex items-center">
                        <button
                            onClick={() => setActiveTab('testcase')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'testcase'
                                ? 'text-white border-t-[#10B981] bg-[#1e1e1e]'
                                : 'text-[#666] hover:text-[#A0A0A0]'
                                }`}
                        >
                            <CheckCircle2 size={12} />
                            Testcase
                        </button>
                        <button
                            onClick={() => setActiveTab('result')}
                            className={`flex items-center gap-2 px-4 py-2 text-xs font-medium transition-colors border-t-2 border-transparent ${activeTab === 'result'
                                ? 'text-white border-t-[#10B981] bg-[#1e1e1e]'
                                : 'text-[#666] hover:text-[#A0A0A0]'
                                }`}
                        >
                            <Play size={12} />
                            Test Result
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 text-[#666] hover:text-white transition-colors"
                    >
                        <Minimize2 size={14} />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#1e1e1e]">
                    {activeTab === 'testcase' ? (
                        hasSubmitted || testCases.length > 0 ? (
                            <>
                                {/* Case Tabs */}
                                <div className="flex items-center gap-2 flex-wrap mb-4">
                                    {testCases.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setSelectedTestCase(index)}
                                            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-2 ${selectedTestCase === index
                                                ? 'bg-[#2d2d2d] text-white shadow-sm'
                                                : 'text-[#666] hover:text-[#A0A0A0] hover:bg-[#2d2d2d]/50'
                                                }`}
                                        >
                                            {result && result.results[index] && (
                                                result.results[index].passed
                                                    ? <CheckCircle2 size={12} className="text-green-400" />
                                                    : <XCircle size={12} className="text-red-400" />
                                            )}
                                            Case {index + 1}
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Details */}
                                {testCases[selectedTestCase] && (
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="flex flex-col">
                                            <label className="text-xs font-medium text-[#888] mb-2 block uppercase tracking-wider">Input</label>
                                            <div className="bg-[#2d2d2d] rounded-lg p-3 border border-white/5 font-mono text-sm text-[#d4d4d4] whitespace-pre-wrap leading-relaxed shadow-inner overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
                                                {testCases[selectedTestCase].input}
                                            </div>
                                        </div>
                                        <div className="flex flex-col">
                                            <label className="text-xs font-medium text-[#888] mb-2 block uppercase tracking-wider">Expected Output</label>
                                            <div className="bg-[#2d2d2d] rounded-lg p-3 border border-white/5 font-mono text-sm text-[#d4d4d4] whitespace-pre-wrap leading-relaxed shadow-inner overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10">
                                                {testCases[selectedTestCase].output || testCases[selectedTestCase].expectedOutput}
                                            </div>
                                        </div>

                                        {/* Actual Output */}
                                        <div className="flex flex-col">
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="text-xs font-medium text-[#888] block uppercase tracking-wider">Actual Output</label>
                                                {result && result.results[selectedTestCase] && (
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${result.results[selectedTestCase].passed ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                        {result.results[selectedTestCase].verdict}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`bg-[#2d2d2d] rounded-lg p-3 border font-mono text-sm whitespace-pre-wrap leading-relaxed shadow-inner overflow-auto max-h-[400px] scrollbar-thin scrollbar-thumb-white/10 ${result && result.results[selectedTestCase]
                                                ? result.results[selectedTestCase].passed
                                                    ? 'border-green-500/20 text-[#d4d4d4]'
                                                    : 'border-red-500/20 text-red-300'
                                                : 'border-white/5 text-[#666]'
                                                }`}>
                                                {result && result.results[selectedTestCase]
                                                    ? (result.results[selectedTestCase].output || <span className="italic opacity-50">No output</span>)
                                                    : <span className="italic opacity-30">Run code to see output</span>
                                                }
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center py-12">
                                <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                    <Play size={28} className="text-[#444]" />
                                </div>
                                <p className="text-[#666] text-sm">No test cases available</p>
                            </div>
                        )
                    ) : (
                        /* Result Tab */
                        result ? (
                            <div className="space-y-4 animate-fade-in">
                                <div className={`flex items-center gap-3 p-4 rounded-xl border ${result.passed
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400'
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                                    }`}>
                                    <div className={`p-2 rounded-full ${result.passed ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                                        {getVerdictIcon(result.verdict)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-lg">{result.verdict}</div>
                                        <div className="text-xs opacity-70 mt-0.5 font-mono">
                                            {result.testsPassed}/{result.totalTests} tests passed • {result.time || '0ms'}
                                        </div>
                                    </div>
                                </div>

                                {/* Compile / Runtime Error */}
                                {result.results[0]?.compileError && (
                                    <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 text-orange-400 text-xs font-medium border-b border-orange-500/20">Compilation Error</div>
                                        <pre className="p-3 text-[10px] text-orange-300 max-h-32 overflow-auto whitespace-pre-wrap font-mono">
                                            {result.results[0].compileError}
                                        </pre>
                                    </div>
                                )}
                                {result.results[0]?.runtimeError && !result.results[0]?.compileError && (
                                    <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg overflow-hidden">
                                        <div className="px-3 py-2 text-purple-400 text-xs font-medium border-b border-purple-500/20">Runtime Error</div>
                                        <pre className="p-3 text-[10px] text-purple-300 max-h-32 overflow-auto whitespace-pre-wrap font-mono">
                                            {result.results[0].runtimeError}
                                        </pre>
                                    </div>
                                )}

                                <div className="bg-[#252526] rounded-xl border border-white/5 overflow-hidden">
                                    {result.results.map((r) => (
                                        <div key={r.testCase} className={`flex items-center justify-between p-3 text-xs border-b border-white/5 last:border-0 hover:bg-[#2d2d2d] transition-colors ${!r.passed ? 'bg-red-500/5' : ''}`}>
                                            <div className="flex items-center gap-3">
                                                {r.passed ? <CheckCircle2 size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-500" />}
                                                <span className="font-medium text-[#d4d4d4]">Test Case {r.testCase}</span>
                                            </div>
                                            <div className="flex items-center gap-4 font-mono text-[#888]">
                                                <span>{r.time || '0ms'}</span>
                                                <span>{r.memory || '0KB'}</span>
                                                <span className={`font-bold w-12 text-right ${r.passed ? 'text-green-400' : 'text-red-400'}`}>
                                                    {getVerdictShort(r.verdict)}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-[#666] gap-3">
                                <div className="w-12 h-12 rounded-full bg-[#2d2d2d] flex items-center justify-center">
                                    <CloudUpload size={24} className="opacity-50" />
                                </div>
                                <p className="text-sm font-medium">Run your code to see results</p>
                            </div>
                        )
                    )}
                </div>
            </div>
        </>
    );
}
