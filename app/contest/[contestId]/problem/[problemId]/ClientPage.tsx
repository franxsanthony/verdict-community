'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { OnMount } from '@monaco-editor/react';
import {
    Loader2,
    Play,
    FileText,
    History,
    BarChart2,
    AlertCircle,
    PenTool,
    FlaskConical,
} from 'lucide-react';
import { Problem, Submission, AnalyticsStats, SubmissionResult, Example, CFProblemData } from '@/app/components/mirror/types';
import ProblemHeader from '@/app/components/mirror/ProblemHeader';
import SubmissionsList from '@/app/components/mirror/SubmissionsList';
import AnalyticsView from '@/app/components/mirror/AnalyticsView';
import CodeWorkspace from '@/app/components/mirror/CodeWorkspace';
import ComplexityModal from '@/app/components/mirror/ComplexityModal';
import Whiteboard from '@/app/components/mirror/Whiteboard';
import ExtensionGate from '@/components/ExtensionGate';
import Link from 'next/link';

import { CFProblemDescription } from '@/app/components/mirror/CFProblemDescription';
import ExtensionOnboardingModal from '@/app/components/mirror/ExtensionOnboardingModal';

const DEFAULT_CODE = `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(0); cin.tie(0);
    
    return 0;
}
`;

const mapLanguageToExtension = (lang: string): string => {
    const map: Record<string, string> = {
        'cpp': 'cpp20',
        'python': 'python3',
        'javascript': 'node',
        'csharp': 'csharp',
        'java': 'java',
        'kotlin': 'kotlin',
        'go': 'go',
        'rust': 'rust'
    };
    return map[lang] || lang;
};

interface CodeforcesMirrorPageProps {
    forcedType?: string;
}

export default function CodeforcesMirrorPage({ forcedType }: CodeforcesMirrorPageProps = {}) {
    const params = useParams();
    const searchParams = useSearchParams();

    // Extract standard params
    const contestId = params.contestId as string;
    const problemId = params.problemId as string;

    // Extract optional params (for groups)
    const groupId = params.groupId as string;

    const urlType = forcedType || searchParams.get('type') || 'contest'; // contest, gym, problemset, group, acmsguru

    // For acmsguru, the route is /problemsets/acmsguru/problem/[dummyId]/[problemId]
    // The dummyId is technically the contestId in the URL, but we treat it as 99999 explicitly if urlType is acmsguru
    // Or we rely on the route param being "99999" (passed as dummyId/contestId).
    // If the route is specifically /problemsets/acmsguru/..., we might need to adjust logic.
    // However, if we mount this at the correct path, useParams will align.

    // Note: for "acmsguru", contestId passed might be "99999".


    // Data State
    const [cfData, setCfData] = useState<CFProblemData | null>(null);
    const [problem, setProblem] = useState<Problem | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Editor & Submission State
    const [code, setCode] = useState(DEFAULT_CODE);
    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState<SubmissionResult | null>(null);
    const [hasSubmitted, setHasSubmitted] = useState(false);

    // Tab State
    const [activeTab, setActiveTab] = useState<'description' | 'submissions' | 'analytics' | 'solution'>('description');
    const [isWhiteboardExpanded, setIsWhiteboardExpanded] = useState(false);

    // Submissions State (mock for now - mirror doesn't store submissions)
    const [submissions, setSubmissions] = useState<Submission[]>([]);
    const [submissionsLoading, setSubmissionsLoading] = useState(false);

    // Analytics State (mock for now)
    const [stats, setStats] = useState<AnalyticsStats | null>(null);

    // Complexity Analysis State
    const [complexityResult, setComplexityResult] = useState<{
        timeComplexity: string;
        spaceComplexity: string;
        explanation: string;
    } | null>(null);
    const [complexityLoading, setComplexityLoading] = useState(false);
    const [showComplexityModal, setShowComplexityModal] = useState(false);

    // Layout State
    // Removed state-based width to optimize resize performance
    const [mobileView, setMobileView] = useState<'problem' | 'code'>('problem');
    const containerRef = useRef<HTMLDivElement>(null);
    const leftPanelRef = useRef<HTMLDivElement>(null);
    const lastWidth = useRef(50);
    const [isResizing, setIsResizing] = useState(false);

    // Whiteboard Resizing
    const [whiteboardHeight, setWhiteboardHeight] = useState(400);
    const [isResizingWhiteboard, setIsResizingWhiteboard] = useState(false);
    const whiteboardStartY = useRef(0);
    const whiteboardStartHeight = useRef(0);

    const handleWhiteboardResizeStart = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizingWhiteboard(true);
        whiteboardStartY.current = e.clientY;
        whiteboardStartHeight.current = whiteboardHeight;
        document.body.style.cursor = 'row-resize';
        document.body.style.userSelect = 'none';
    }, [whiteboardHeight]);

    useEffect(() => {
        if (!isResizingWhiteboard) return;

        const handleMouseMove = (e: MouseEvent) => {
            const deltaY = whiteboardStartY.current - e.clientY; // Dragging up increases height
            // Limit height between 100px and 80% of window height
            const maxHeight = window.innerHeight * 0.8;
            const newHeight = Math.max(100, Math.min(maxHeight, whiteboardStartHeight.current + deltaY));
            setWhiteboardHeight(newHeight);
        };

        const handleMouseUp = () => {
            setIsResizingWhiteboard(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isResizingWhiteboard]);

    // Resizing Logic (Horizontal)
    useEffect(() => {
        // Load saved width
        const savedWidth = localStorage.getItem('icpchue-layout-width');
        if (savedWidth && leftPanelRef.current) {
            const width = parseFloat(savedWidth);
            if (!isNaN(width) && width >= 20 && width <= 80) {
                lastWidth.current = width;
                leftPanelRef.current.style.setProperty('--panel-width', `${width}%`);
            }
        }
    }, []);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    useEffect(() => {
        let animationFrameId: number;

        const handleMouseMove = (e: MouseEvent) => {
            if (!isResizing || !containerRef.current || !leftPanelRef.current) return;

            if (animationFrameId) cancelAnimationFrame(animationFrameId);

            animationFrameId = requestAnimationFrame(() => {
                if (!containerRef.current) return;
                const containerRect = containerRef.current.getBoundingClientRect();
                const newWidth = ((e.clientX - containerRect.left) / containerRect.width) * 100;

                if (newWidth >= 20 && newWidth <= 80) {
                    lastWidth.current = newWidth;
                    leftPanelRef.current!.style.setProperty('--panel-width', `${newWidth}%`);
                }
            });
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            localStorage.setItem('icpchue-layout-width', lastWidth.current.toString());
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };

        if (isResizing) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [isResizing]);

    // Test Panel State
    const [isTestPanelVisible, setIsTestPanelVisible] = useState(true);
    const [testCases, setTestCases] = useState<Example[]>([]);
    const [cfStats, setCfStats] = useState<{ rating?: number; solvedCount: number } | null>(null);
    const [language, setLanguage] = useState('cpp');

    // Persistence Logic
    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const storageKey = `icpchue-code-${safeContestId}-${safeProblemId}`;
        const langKey = `icpchue-lang-${safeContestId}-${safeProblemId}`;

        const savedCode = localStorage.getItem(storageKey);
        const savedLang = localStorage.getItem(langKey);

        if (savedCode) setCode(savedCode);
        if (savedLang) setLanguage(savedLang);
    }, [contestId, problemId]);

    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const storageKey = `icpchue-code-${safeContestId}-${safeProblemId}`;
        localStorage.setItem(storageKey, code);
    }, [code, contestId, problemId]);

    useEffect(() => {
        if (!contestId || !problemId) return;

        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        const langKey = `icpchue-lang-${safeContestId}-${safeProblemId}`;
        localStorage.setItem(langKey, language);
    }, [language, contestId, problemId]);

    // Fetch Low Cost Global Stats
    useEffect(() => {
        if (!contestId || !problemId) return;
        fetch(`/api/codeforces/problem-stats?contestId=${contestId}&index=${problemId}`)
            .then(res => res.json())
            .then(data => { if (data && !data.error) setCfStats(data); })
            .catch(err => console.error('Failed to load CF stats', err));
    }, [contestId, problemId]);

    const editorRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

    const handleEditorDidMount: OnMount = (editor) => {
        editorRef.current = editor;
    };

    // Fetch problem from Codeforces Mirror API
    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await fetch(`/api/codeforces/mirror?contestId=${contestId}&problemId=${problemId}&type=${urlType}${groupId ? `&groupId=${groupId}` : ''}`);
                if (res.ok) {
                    const data: CFProblemData = await res.json();
                    setCfData(data);

                    // Transform to Problem interface for components that need it
                    const mappedProblem: Problem = {
                        id: Array.isArray(problemId) ? problemId[0].toUpperCase() : problemId.toUpperCase(),
                        title: data.meta.title,
                        statement: data.story,
                        inputFormat: data.inputSpec || 'See problem statement',
                        outputFormat: data.outputSpec || 'See problem statement',
                        examples: data.testCases.map((tc) => ({
                            input: tc.input,
                            output: tc.output,
                            expectedOutput: tc.output
                        })),
                        note: data.note || undefined,
                        timeLimit: data.meta.timeLimitMs,
                        memoryLimit: data.meta.memoryLimitMB
                    };

                    setProblem(mappedProblem);
                    setTestCases(mappedProblem.examples);
                } else {
                    const err = await res.json();
                    setError(err.error || 'Failed to fetch problem');
                }
            } catch (err: any) {
                setError(err.message || 'Network error');
            } finally {
                setLoading(false);
            }
        };

        if (contestId && problemId) {
            fetchProblem();
        }
    }, [contestId, problemId, urlType, groupId]);



    // Handle running sample tests against Judge0
    const runSampleTests = async () => {
        if (!code.trim() || submitting || !cfData) return;

        setSubmitting(true);
        setIsTestPanelVisible(true);

        try {
            const response = await fetch('/api/judge/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceCode: code,
                    language: language,
                    testCases: cfData.testCases.map(tc => ({
                        input: tc.input,
                        output: tc.output
                    })),
                    timeLimit: cfData.meta.timeLimitMs || 2000,
                    memoryLimit: cfData.meta.memoryLimitMB || 256
                })
            });

            if (!response.ok) {
                const err = await response.json();
                setResult({
                    verdict: 'Error',
                    passed: false,
                    testsPassed: 0,
                    totalTests: testCases.length,
                    results: [{
                        testCase: 1,
                        verdict: err.error || 'Judge Error',
                        passed: false,
                        output: err.details || 'Failed to run tests. Please try again.'
                    }]
                });
                return;
            }

            const data = await response.json();
            setResult({
                verdict: data.verdict,
                passed: data.passed,
                testsPassed: data.testsPassed,
                totalTests: data.totalTests,
                time: data.time,
                results: data.results
            });
            setHasSubmitted(true);
        } catch (err) {
            console.error('Test execution error:', err);
            setResult({
                verdict: 'Network Error',
                passed: false,
                testsPassed: 0,
                totalTests: testCases.length,
                results: [{
                    testCase: 1,
                    verdict: 'Network Error',
                    passed: false,
                    output: 'Failed to connect to judge. Check your internet connection.'
                }]
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Helper to generate Codeforces submit URL
    const getSubmitUrl = () => {
        const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
        const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

        if (urlType === 'gym') {
            return `https://codeforces.com/gym/${safeContestId}/submit?problemIndex=${safeProblemId}`;
        } else if (urlType === 'group' && groupId) {
            return `https://codeforces.com/group/${groupId}/contest/${safeContestId}/submit?problemIndex=${safeProblemId}`;
        }
        return `https://codeforces.com/contest/${safeContestId}/submit?problemIndex=${safeProblemId}`;
    };

    // Handle Submit via Extension
    const handleSubmit = async () => {
        if (!code) return;

        setSubmitting(true);
        setHasSubmitted(false);
        setResult(null);

        // 1. Fast Fail: Check if extension is injected
        if (!document.getElementById('icpchue-extension-installed')) {
            window.open(getSubmitUrl(), '_blank');
            setResult({
                verdict: 'Manual Submit',
                passed: true,
                testsPassed: 0,
                totalTests: 0,
                results: [{
                    testCase: 1,
                    verdict: 'Manual Submit',
                    passed: true,
                    output: 'Extension not detected.\nOpened Codeforces submit page in a new tab.'
                }]
            });
            setHasSubmitted(true);
            setSubmitting(false);
            return;
        }

        // Promise to handle the submission response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const submitPromise = new Promise<any>((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'ICPCHUE_SUBMISSION_RESULT') {
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };

            // Set a timeout for the submission response
            setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, error: 'TIMEOUT_NO_RESPONSE' });
            }, 60000); // Increased timeout for captcha wait

            window.addEventListener('message', handler);

            // Send submission request
            window.postMessage({
                type: 'ICPCHUE_SUBMIT',
                payload: {
                    contestId,
                    problemIndex: problemId,
                    code,
                    language: mapLanguageToExtension(language),
                    urlType, // contest, gym, problemset, group
                    groupId
                }
            }, '*');
        });

        // Helper to check status with timeout
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const checkStatus = (subId: string) => new Promise<any>((resolve) => {
            const handler = (event: MessageEvent) => {
                if (event.data.type === 'ICPCHUE_SUBMISSION_STATUS_RESULT') {
                    clearTimeout(timeoutId);
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };

            const timeoutId = setTimeout(() => {
                window.removeEventListener('message', handler);
                resolve({ success: false, error: 'STATUS_CHECK_TIMEOUT' });
            }, 10000); // 10 second timeout for status check

            window.addEventListener('message', handler);
            window.postMessage({
                type: 'ICPCHUE_CHECK_SUBMISSION',
                payload: { contestId, submissionId: subId, urlType, groupId }
            }, '*');
        });

        try {
            const response = await submitPromise;

            // 2. Timeout Fallback
            if (response.error === 'TIMEOUT_NO_RESPONSE') {
                window.open(getSubmitUrl(), '_blank');
                setResult({
                    verdict: 'Timeout',
                    passed: false,
                    testsPassed: 0,
                    totalTests: 0,
                    results: [{
                        testCase: 1,
                        verdict: 'Timeout',
                        passed: false,
                        output: 'Extension did not respond.\nOpened Codeforces submit page for manual submission.'
                    }]
                });
                setHasSubmitted(true);
                return;
            }

            if (response.success) {
                // Initial success state
                setResult({
                    verdict: response.submissionId ? 'In Queue' : 'Submitted',
                    passed: true,
                    testsPassed: 0,
                    totalTests: 0,
                    results: [{
                        testCase: 1,
                        verdict: 'Submitted',
                        passed: true,
                        output: `Submission ID: ${response.submissionId || 'N/A'}\nWaiting for judge...`
                    }]
                });
                setHasSubmitted(true);

                // Start Polling if we have an ID
                if (response.submissionId) {
                    let attempts = 0;
                    const maxAttempts = 80; // ~2 minutes max
                    const startTime = Date.now();

                    while (attempts < maxAttempts) {
                        // Shorter polling interval for faster updates
                        await new Promise(r => setTimeout(r, 1500));

                        const status = await checkStatus(response.submissionId);
                        const elapsedSec = Math.floor((Date.now() - startTime) / 1000);

                        // Debug logging - removed

                        if (status.success) {
                            // Validate verdict is a string
                            const verdictText = typeof status.verdict === 'string'
                                ? status.verdict
                                : String(status.verdict || 'Unknown');

                            const isFinal = !status.waiting &&
                                verdictText !== 'Unknown' &&
                                verdictText !== 'In queue' &&
                                verdictText !== 'Testing';

                            // Build display verdict
                            let displayVerdict = verdictText;

                            if (verdictText === 'Testing') {
                                if (status.testNumber) {
                                    displayVerdict = `Testing on test ${status.testNumber}`;
                                } else {
                                    displayVerdict = `Running tests`;
                                }
                            } else if (verdictText === 'In queue') {
                                displayVerdict = 'In Queue';
                            }

                            // Build detailed output with time/memory if available
                            let detailedOutput = `Submission ID: ${response.submissionId}`;
                            detailedOutput += `\nStatus: ${displayVerdict}`;
                            detailedOutput += `\nElapsed: ${elapsedSec}s`;

                            if (isFinal) {
                                // Show final results with details
                                if (status.time) {
                                    detailedOutput += `\nTime: ${status.time} ms`;
                                }
                                if (status.memory) {
                                    detailedOutput += `\nMemory: ${status.memory} KB`;
                                }
                                // For failures: testNumber is passedTestCount, so failed on passedTestCount + 1
                                // For accepted: testNumber is total tests passed
                                if (status.testNumber !== undefined && verdictText !== 'Accepted') {
                                    detailedOutput += `\nFailed on test: ${status.testNumber + 1}`;
                                    detailedOutput += `\nTests passed: ${status.testNumber}`;
                                } else if (status.testNumber && verdictText === 'Accepted') {
                                    detailedOutput += `\nAll ${status.testNumber} tests passed`;
                                }
                            } else if (status.testNumber) {
                                detailedOutput += `\nCurrently on test: ${status.testNumber}`;
                            }

                            if (status.compilationError) {
                                detailedOutput += `\n\n=== COMPILATION ERROR ===\n${status.compilationError}`;
                            }

                            // Update UI with live status
                            setResult({
                                verdict: displayVerdict,
                                passed: verdictText === 'Accepted',
                                testsPassed: status.testNumber || 0,
                                totalTests: 0,
                                time: status.time,
                                results: [{
                                    testCase: 1,
                                    verdict: displayVerdict,
                                    passed: verdictText === 'Accepted',
                                    output: detailedOutput
                                }]
                            });

                            if (isFinal) {
                                // Final verdict received
                                break;
                            }
                        }
                        attempts++;
                    }

                    if (attempts >= maxAttempts) {
                        console.warn('Polling timeout - verdict may still be pending');
                        setResult(prev => prev ? {
                            ...prev,
                            verdict: 'Timeout',
                            results: [{
                                testCase: 1,
                                verdict: 'Timeout',
                                passed: false,
                                output: `Polling timed out after ${Math.floor((Date.now() - startTime) / 1000)}s.\nCheck Codeforces directly for the result.`
                            }]
                        } : null);
                    }
                }
            } else {
                // Handle specific error types
                let errorMessage = response.error || 'Submission failed';

                if (response.error === 'NOT_LOGGED_IN') {
                    errorMessage = 'Please log in to Codeforces first';
                } else if (response.error === 'CLOUDFLARE_CHALLENGE') {
                    errorMessage = 'Cloudflare check required. Please visit Codeforces first.';
                } else if (response.error === 'DUPLICATE_SUBMISSION') {
                    errorMessage = 'You have already submitted this exact code';
                } else if (response.error === 'RATE_LIMITED') {
                    errorMessage = 'Too many submissions. Please wait a moment.';
                } else if (response.error === 'VIRTUAL_REGISTRATION_REQUIRED') {
                    errorMessage = 'This is a past contest. Register for virtual participation on Codeforces first.';
                    window.open(`https://codeforces.com/contestRegistration/${contestId}/virtual/true`, '_blank');
                } else if (response.error === 'GYM_ENTRY_REQUIRED') {
                    errorMessage = 'You need to enter this Gym first.';
                    window.open(`https://codeforces.com/gym/${contestId}`, '_blank');
                }

                setResult({
                    verdict: 'Submission Failed',
                    passed: false,
                    testsPassed: 0,
                    totalTests: 0,
                    results: [{
                        testCase: 1,
                        verdict: errorMessage,
                        passed: false,
                        output: 'Please try again or submit manually on Codeforces.'
                    }]
                });
            }
        } catch (err) {
            console.error('Submission error:', err);
            setResult({
                verdict: 'Error',
                passed: false,
                testsPassed: 0,
                totalTests: 0,
                results: [{
                    testCase: 1,
                    verdict: 'Extension Error',
                    passed: false,
                    output: 'Failed to communicate with extension. Please refresh the page.'
                }]
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Complexity analysis mock
    const analyzeComplexity = async () => {
        setComplexityLoading(true);
        setShowComplexityModal(true);
        setComplexityResult({
            timeComplexity: 'N/A',
            spaceComplexity: 'N/A',
            explanation: 'Complexity analysis is not available in mirror mode.'
        });
        setComplexityLoading(false);
    };

    // Fetch submissions from API
    const fetchSubmissions = useCallback(async () => {
        if (!contestId || !problemId) return;
        setSubmissionsLoading(true);
        try {
            const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;
            const safeProblemId = Array.isArray(problemId) ? problemId[0] : problemId;

            const res = await fetch(`/api/codeforces/submissions?contestId=${safeContestId}&problemIndex=${safeProblemId}`);
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();

            // Map to our Submission interface
            const mappedSubmissions: Submission[] = data.map((sub: any) => ({
                id: sub.id,
                verdict: sub.verdict === 'OK' ? 'Accepted' : sub.verdict,
                time: `${sub.timeConsumedMillis} ms`,
                memory: `${Math.round(sub.memoryConsumedBytes / 1024)} KB`,
                submittedAt: new Date(sub.creationTimeSeconds * 1000).toLocaleString(),
                lang: sub.language
            }));

            setSubmissions(mappedSubmissions);

            // Calculate Analytics Client-Side
            const accepted = data.filter((s: any) => s.verdict === 'OK');
            if (accepted.length > 0) {
                // Runtime Distribution
                const times = accepted.map((s: any) => s.timeConsumedMillis).sort((a: any, b: any) => a - b);
                const minTime = times[0];
                const maxTime = times[times.length - 1];
                const timeStep = Math.max(1, Math.ceil((maxTime - minTime) / 10)); // 10 buckets

                const runtimeDist = Array.from({ length: 10 }, (_, i) => {
                    const start = minTime + i * timeStep;
                    const end = start + timeStep;
                    const count = times.filter((t: number) => t >= start && t < end).length;
                    return {
                        label: `${start}-${end}ms`,
                        count,
                        isUser: false // We don't know user handle in mirror easily yet
                    };
                });

                // Memory Distribution
                const mems = accepted.map((s: any) => s.memoryConsumedBytes / 1024).sort((a: any, b: any) => a - b);
                const minMem = mems[0];
                const maxMem = mems[mems.length - 1];
                const memStep = Math.max(1, Math.ceil((maxMem - minMem) / 10));

                const memoryDist = Array.from({ length: 10 }, (_, i) => {
                    const start = minMem + i * memStep;
                    const end = start + memStep;
                    const count = mems.filter((m: number) => m >= start && m < end).length;
                    return {
                        label: `${Math.round(start)}-${Math.round(end)}KB`,
                        count,
                        isUser: false
                    };
                });

                setStats({
                    totalSubmissions: mappedSubmissions.length,
                    runtimeDistribution: runtimeDist,
                    memoryDistribution: memoryDist,
                    userStats: null, // No user stats for now as we don't have handle context perfectly matched
                });
            } else {
                setStats(null);
            }

        } catch (error) {
            console.error('Failed to load submissions', error);
        } finally {
            setSubmissionsLoading(false);
        }
    }, [contestId, problemId]);

    useEffect(() => {
        // Fetch on mount or tab change
        if (activeTab === 'submissions' || activeTab === 'analytics') {
            fetchSubmissions();
        }
    }, [activeTab, fetchSubmissions]);

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[#0B0B0C] flex flex-col items-center justify-center z-50 gap-4">
                <Loader2 className="animate-spin text-[#10B981]" size={48} />
                <p className="text-[#A0A0A0] text-sm animate-pulse">Mirroring from Codeforces...</p>
            </div>
        );
    }

    if (error || !problem || !cfData) {
        return (
            <div className="min-h-screen bg-[#0B0B0C] flex items-center justify-center p-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-8 text-center max-w-md">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-red-400 mb-2">Mirror Failed</h2>
                    <p className="text-white/60 mb-6">{error || 'Problem not found'}</p>
                    <Link href="/dashboard" className="text-[#10B981] hover:underline">Return to Dashboard</Link>
                </div>
            </div>
        );
    }

    // Determine Navigation Base URL for Next/Prev arrows
    let navigationBaseUrl = '';
    // Strip query params just in case, though params are usually clean
    const safeContestId = Array.isArray(contestId) ? contestId[0] : contestId;

    switch (urlType) {
        case 'gym':
            navigationBaseUrl = `/gym/${safeContestId}/problem`;
            break;
        case 'problemset':
            // Problemset usually follows /problemset/problem/123/A
            navigationBaseUrl = `/problemset/problem/${safeContestId}`;
            break;
        case 'group':
            if (groupId) {
                navigationBaseUrl = `/group/${groupId}/contest/${safeContestId}/problem`;
            }
            break;
        case 'acmsguru':
            navigationBaseUrl = `/problemsets/acmsguru/problem/99999`;
            break;
        default:
            navigationBaseUrl = `/contest/${safeContestId}/problem`;
    }

    return (
        <ExtensionGate>
            <ExtensionOnboardingModal />
            <div className="fixed inset-0 bg-[#0B0B0C] text-[#DCDCDC] z-50 flex flex-col">
                <ProblemHeader
                    sheetId={`codeforces-${contestId}`}
                    problem={problem}
                    mobileView={mobileView}
                    setMobileView={setMobileView}
                    navigationBaseUrl={navigationBaseUrl}
                />

                <div ref={containerRef} className="flex-1 flex overflow-hidden" style={{ cursor: isResizing ? 'col-resize' : 'auto' }}>
                    {/* Left Panel - Full width on mobile, resizable on desktop */}
                    <div
                        ref={leftPanelRef}
                        className={`problem-panel flex flex-col bg-[#121212] ${mobileView === 'code' ? 'hidden md:flex' : 'flex'} w-full md:w-auto`}
                        style={{
                            '--panel-width': `${lastWidth.current}%`,
                            willChange: 'width'
                        } as React.CSSProperties}
                    >
                        <div className="flex border-b border-white/10 bg-[#1a1a1a] overflow-x-auto">
                            <button
                                onClick={() => setActiveTab('description')}
                                className={`flex items-center gap-2 px-6 py-3 text-xs font-medium transition-colors ${activeTab === 'description' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] hover:text-[#A0A0A0]'}`}
                            >
                                <FileText size={14} /> Description
                            </button>
                            <button
                                onClick={() => setActiveTab('submissions')}
                                className={`flex items-center gap-2 px-6 py-3 text-xs font-medium transition-colors ${activeTab === 'submissions' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] hover:text-[#A0A0A0]'}`}
                            >
                                <History size={14} /> Submissions
                            </button>
                            <button
                                onClick={() => setActiveTab('analytics')}
                                className={`flex items-center gap-2 px-6 py-3 text-xs font-medium transition-colors ${activeTab === 'analytics' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] hover:text-[#A0A0A0]'}`}
                            >
                                <BarChart2 size={14} /> Analytics
                            </button>
                            <button
                                onClick={() => setActiveTab('solution')}
                                className={`flex items-center gap-2 px-6 py-3 text-xs font-medium transition-colors ${activeTab === 'solution' ? 'text-white border-b-2 border-[#10B981] bg-[#121212]' : 'text-[#666] hover:text-[#A0A0A0]'}`}
                            >
                                <Play size={14} /> Solution
                            </button>
                            <button
                                onClick={() => setIsWhiteboardExpanded(!isWhiteboardExpanded)}
                                className={`flex items-center gap-2 px-6 py-3 text-xs font-medium transition-colors border-l border-white/5 shrink-0 ${isWhiteboardExpanded ? 'text-[#34D399] bg-[#1e1e1e]' : 'text-[#666] hover:text-[#A0A0A0]'}`}
                                title="Toggle Whiteboard"
                            >
                                <PenTool size={14} /> Whiteboard
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                            {activeTab === 'description' && <CFProblemDescription data={cfData} />}
                            {activeTab === 'submissions' && (
                                <SubmissionsList
                                    submissions={submissions}
                                    loading={submissionsLoading}
                                    onViewCode={() => { }}
                                    contestId={Array.isArray(contestId) ? contestId[0] : contestId}
                                    problemIndex={Array.isArray(problemId) ? problemId[0] : problemId}
                                />
                            )}
                            {activeTab === 'analytics' && (
                                <AnalyticsView
                                    stats={stats}
                                    cfStats={cfStats}
                                    loading={submissionsLoading}
                                    analyzeComplexity={analyzeComplexity}
                                    complexityLoading={complexityLoading}
                                />
                            )}
                            {activeTab === 'solution' && (
                                <div className="flex flex-col items-center justify-center p-12 text-center h-full">

                                    <h3 className="text-2xl font-bold text-white mb-3">coming soon shhhh</h3>
                                </div>
                            )}
                        </div>

                        {/* Resizer Handle for Whiteboard */}
                        {isWhiteboardExpanded && (
                            <div
                                className="h-1.5 bg-[#121212] hover:bg-[#10B981] cursor-row-resize transition-colors w-full shrink-0"
                                onMouseDown={handleWhiteboardResizeStart}
                            />
                        )}

                        {/* Whiteboard Component at the bottom */}
                        <Whiteboard
                            contestId={contestId}
                            problemIndex={problemId}
                            isExpanded={isWhiteboardExpanded}
                            onToggleExpand={() => setIsWhiteboardExpanded(!isWhiteboardExpanded)}
                            height={whiteboardHeight}
                        />
                    </div>

                    {/* Resizer */}
                    <div
                        className="hidden md:block w-1 bg-white/5 hover:bg-[#10B981]/50 cursor-col-resize transition-colors relative group shrink-0"
                        onMouseDown={handleMouseDown}
                    >
                        <div className="absolute inset-y-0 -left-1 -right-1" />
                    </div>

                    {/* Right Panel (Workspace) */}
                    <CodeWorkspace
                        code={code}
                        setCode={setCode}
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        onRunTests={runSampleTests}
                        handleEditorDidMount={handleEditorDidMount}
                        isTestPanelVisible={isTestPanelVisible}
                        setIsTestPanelVisible={setIsTestPanelVisible}
                        testCases={testCases}
                        result={result}
                        hasSubmitted={hasSubmitted}
                        mobileView={mobileView}
                        language={language}
                        setLanguage={setLanguage}
                    />
                </div>

                {/* Complexity Modal */}
                <ComplexityModal
                    isOpen={showComplexityModal}
                    onClose={() => setShowComplexityModal(false)}
                    loading={complexityLoading}
                    result={complexityResult}
                />

                {!isTestPanelVisible && (
                    <button
                        onClick={() => setIsTestPanelVisible(true)}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-[#10B981] text-white rounded-full shadow-xl shadow-[#10B981]/20 hover:bg-[#059669] hover:scale-110 transition-all duration-300 flex items-center justify-center z-50"
                        title="Show Test Cases"
                    >
                        <FlaskConical size={24} strokeWidth={2.5} />
                    </button>
                )}
            </div>
        </ExtensionGate >
    );
}
