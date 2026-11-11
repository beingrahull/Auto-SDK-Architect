import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, RefreshCw, AlertCircle, ArrowLeft, Terminal, FileCode2 } from 'lucide-react';
import { BASE, getJobStatus, type JobStatusResponse, ApiError } from '../api';
import { FeedLine } from '../components/FeedLine';

const POLL_MS = 1500;

export const JobPage: React.FC = () => {
  const { jobId } = useParams<{ jobId: string }>();
  const [job, setJob] = useState<JobStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Reference to track consecutive 404s and timeout cleanup
  const consecutive404Ref = useRef(0);
  const timeoutIdRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancelledRef = useRef(false);

  useEffect(() => {
    if (!jobId) {
      setError('Invalid Job ID');
      return;
    }

    cancelledRef.current = false;
    consecutive404Ref.current = 0;

    const poll = async () => {
      if (cancelledRef.current) return;

      try {
        const data = await getJobStatus(jobId);
        if (cancelledRef.current) return;

        // Reset consecutive 404 counter on successful response
        consecutive404Ref.current = 0;
        setJob(data);

        // Terminal states check: stop polling when 'success' or 'failed'
        if (data.status === 'success' || data.status === 'failed') {
          return;
        }
      } catch (err: unknown) {
        if (cancelledRef.current) return;

        if (err instanceof ApiError) {
          if (err.status === 404) {
            consecutive404Ref.current += 1;
            // The first 2-3 polls may 404 before checkpointer saves state. Treat as pending.
            if (consecutive404Ref.current > 3) {
              setError('Job not found.');
              return;
            } else {
              // Silently treat as pending
              setJob((prev) => prev || {
                job_id: jobId,
                status: 'pending',
                sdk_url: null,
                scratchpad: [],
              });
            }
          } else if (err.status >= 500) {
            setError('Server error. Try again.');
            return;
          } else {
            setError(err.message);
            return;
          }
        } else {
          setError('An unexpected error occurred during polling.');
          return;
        }
      }

      // Schedule next poll using recursive setTimeout
      if (!cancelledRef.current) {
        timeoutIdRef.current = setTimeout(poll, POLL_MS);
      }
    };

    // Kick off first poll
    poll();

    // Cleanup: cancel pending callbacks and clear timeout
    return () => {
      cancelledRef.current = true;
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
      }
    };
  }, [jobId]);

  if (!jobId) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-red-600 font-bold">Invalid or missing Job ID.</p>
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold underline text-slate-800">
            <ArrowLeft className="w-4 h-4" /> Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // Determine current pipeline status
  const currentStatus = job?.status || 'pending';
  const isTerminal = currentStatus === 'success' || currentStatus === 'failed';
  const scratchpadEntries = job?.scratchpad || [];
  // Sort scratchpad entries by step order
  const sortedEntries = [...scratchpadEntries].sort((a, b) => a.step - b.step);

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-slate-700 hover:text-slate-900 font-medium text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">Back to Generator</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-500">ID:</span>
            <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {jobId.slice(0, 8)}...
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">

        {/* Status Header Banner */}
        <div className="bg-white border-2 border-slate-900 rounded-xl p-5 sm:p-6 shadow-brutal flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500">
                Job Lifecycle State
              </span>
              {!isTerminal && (
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-signal absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-600"></span>
                </span>
              )}
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 capitalize">
                {currentStatus === 'success' && 'Generation Completed'}
                {currentStatus === 'failed' && 'Generation Failed'}
                {currentStatus === 'running' && 'Pipeline Running…'}
                {currentStatus === 'pending' && 'Initializing Pipeline…'}
              </h1>

              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono font-bold uppercase tracking-wider border ${
                  currentStatus === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : currentStatus === 'failed'
                    ? 'bg-red-50 text-red-800 border-red-300'
                    : 'bg-blue-50 text-blue-800 border-blue-300'
                }`}
              >
                {currentStatus}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 font-mono">
              Job UUID: <span className="text-slate-900 select-all font-semibold">{jobId}</span>
            </p>
          </div>

          {/* Download Button (Only on status === 'success') */}
          {currentStatus === 'success' && (
            <div className="w-full sm:w-auto">
              <a
                href={`${BASE}/jobs/${jobId}/sdk`}
                download
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-lg bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-brutal-sm hover:bg-emerald-700 hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all"
              >
                <Download className="w-5 h-5" />
                <span>Download Python SDK</span>
              </a>
            </div>
          )}

          {/* Running Spinner Indicator */}
          {!isTerminal && !error && (
            <div className="flex items-center gap-2 text-slate-500 text-xs font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>Polling every 1.5s</span>
            </div>
          )}
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="p-4 rounded-xl bg-red-50 border-2 border-red-500 text-red-900 shadow-brutal-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Job Encountered An Error</h3>
              <p className="text-sm mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Pipeline Failed Details */}
        {currentStatus === 'failed' && !error && (
          <div className="p-4 rounded-xl bg-amber-50 border-2 border-amber-500 text-amber-900 shadow-brutal-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-sm">Pipeline failed.</h3>
              <p className="text-sm mt-0.5">See the feed below for schema violation details and bounded retry attempts.</p>
            </div>
          </div>
        )}

        {/* Scratchpad Live Feed Section */}
        <div className="bg-white border-2 border-slate-900 rounded-xl overflow-hidden shadow-brutal">
          <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider">
                Scratchpad Event Stream
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
              <span>{sortedEntries.length} events logged</span>
              <span className="w-1.5 h-1.5 rounded-full bg-slate-600"></span>
              <span>Reducer: operator.add</span>
            </div>
          </div>

          <div className="p-4 sm:p-6 bg-slate-50/60 min-h-[260px] space-y-3">
            {sortedEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-slate-400 space-y-3">
                <FileCode2 className="w-10 h-10 stroke-1" />
                <p className="text-sm font-mono">
                  {currentStatus === 'pending' ? 'Connecting to orchestrator…' : 'No scratchpad events logged yet.'}
                </p>
              </div>
            ) : (
              sortedEntries.map((entry) => (
                <FeedLine key={entry.step} entry={entry} />
              ))
            )}
          </div>

          {/* Footer note inside card */}
          <div className="px-5 py-2.5 bg-slate-100 border-t border-slate-200 text-[11px] font-mono text-slate-500 flex items-center justify-between">
            <span>Deterministic state snapshot persisted in SQLite checkpointer</span>
            {!isTerminal && <span className="animate-pulse text-blue-600 font-semibold">Active stream</span>}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-3">
          <div className="flex items-center gap-2">
            <span>AUTO-SDK ARCHITECT v1.0</span>
            <span>•</span>
            <span>STRICT BOUNDED DAG EXECUTION</span>
          </div>
          <div>
            <span>SPEC: RFC-8000</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
