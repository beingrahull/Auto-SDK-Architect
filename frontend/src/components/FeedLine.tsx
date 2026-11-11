import React from 'react';
import type { ScratchpadEntry } from '../api';

interface FeedLineProps {
  entry: ScratchpadEntry;
}

export const FeedLine: React.FC<FeedLineProps> = ({ entry }) => {
  // One switch-equivalent map from event -> text-rendering function
  const renderContent = () => {
    const p = entry.payload || {};

    switch (entry.event) {
      case 'scrape.complete': {
        const bytes = typeof p.bytes === 'number' ? p.bytes.toLocaleString() : String(p.bytes ?? '0');
        return (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-slate-900">Documentation scraped successfully</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              {bytes} bytes
            </span>
          </div>
        );
      }

      case 'parse.complete': {
        const count = p.endpoint_count ?? '0';
        return (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-slate-900">Extracted API endpoint specifications</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-blue-50 text-blue-700 border border-blue-200">
              {String(count)} endpoints
            </span>
          </div>
        );
      }

      case 'validate.pass': {
        const valid = p.valid_count ?? '0';
        return (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-emerald-800">Schema validation passed</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
              {String(valid)} valid schemas
            </span>
          </div>
        );
      }

      case 'validate.fail': {
        const invalid = p.invalid_count ?? '0';
        const errors = Array.isArray(p.errors) ? p.errors : [];
        return (
          <div className="space-y-1.5 w-full">
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="font-semibold text-amber-900">Validation found schema violations</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-amber-50 text-amber-800 border border-amber-200">
                {String(invalid)} errors
              </span>
            </div>
            {errors.length > 0 && (
              <ul className="text-xs font-mono text-slate-600 bg-amber-50/60 p-2.5 rounded border border-amber-200/60 space-y-1">
                {errors.slice(0, 3).map((err, idx) => (
                  <li key={idx} className="truncate">
                    • {String(err)}
                  </li>
                ))}
                {errors.length > 3 && (
                  <li className="text-amber-700 italic font-sans">+ {errors.length - 3} more errors</li>
                )}
              </ul>
            )}
          </div>
        );
      }

      case 'fix.attempt': {
        const retry = p.retry ?? '1';
        const targets = p.targets ?? '0';
        return (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-indigo-900">Applying deterministic heuristic refinement</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">
              retry #{String(retry)} ({String(targets)} targets)
            </span>
          </div>
        );
      }

      case 'generate.complete': {
        const filename = String(p.filename || 'sdk.py');
        const methods = p.method_count ?? '0';
        return (
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="font-semibold text-emerald-950">Python client synthesis complete</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-100 text-emerald-900 border border-emerald-300">
              {filename}
            </span>
            <span className="text-xs text-slate-500 font-mono">({String(methods)} methods)</span>
          </div>
        );
      }

      default:
        // Unknown event: render raw event string gracefully
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-700">{entry.event}</span>
            {entry.payload && Object.keys(entry.payload).length > 0 && (
              <span className="text-xs text-slate-400 font-mono">
                {JSON.stringify(entry.payload)}
              </span>
            )}
          </div>
        );
    }
  };

  // Node badge color styles
  const getNodeColor = (node: string) => {
    switch (node) {
      case 'ScraperNode':
        return 'bg-slate-100 text-slate-700 border-slate-300';
      case 'ParserNode':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'ValidatorNode':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'FixNode':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'GeneratorNode':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  // Format timestamp (HH:MM:ss)
  const formatTime = (ts: string) => {
    try {
      const date = new Date(ts);
      return date.toTimeString().split(' ')[0] || ts;
    } catch {
      return ts;
    }
  };

  return (
    <div className="group flex items-start gap-3 sm:gap-4 py-3 px-3 sm:px-4 rounded-md border border-slate-200/80 bg-white hover:border-slate-300 transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
      {/* Monospaced step index */}
      <div className="flex-shrink-0 w-8 h-8 rounded bg-slate-900 text-white font-mono text-xs font-bold flex items-center justify-center tracking-tighter">
        {String(entry.step).padStart(2, '0')}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold uppercase tracking-wider border ${getNodeColor(
              entry.node
            )}`}
          >
            {entry.node}
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {formatTime(entry.ts)}
          </span>
        </div>

        <div className="text-sm">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};
