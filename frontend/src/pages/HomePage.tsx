import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Terminal, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { generateSdk, ApiError } from '../api';

export const HomePage: React.FC = () => {
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault(); // Exactly one preventDefault in the whole app!
    if (!url.trim()) return;

    setError(null);
    setSubmitting(true);

    generateSdk(url.trim())
      .then((res) => {
        navigate(`/jobs/${res.job_id}`);
      })
      .catch((err: unknown) => {
        setSubmitting(false);
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError('An unexpected error occurred. Please try again.');
        }
      });
  }

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-slate-900 selection:text-white">
      {/* Top Header / Nav Brand */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-slate-900 flex items-center justify-center text-white font-mono font-black text-sm tracking-tight shadow-brutal-sm">
              AS
            </div>
            <div>
              <span className="font-bold text-slate-900 tracking-tight text-base sm:text-lg">
                AUTO-SDK <span className="font-normal text-slate-500 text-sm tracking-normal">ARCHITECT</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              FastAPI v1.0 • LangGraph
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-semibold tracking-wider bg-red-50 text-red-700 border border-red-200">
              US-STD 01
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 py-12 sm:py-20">
        <div className="w-full max-w-3xl mx-auto space-y-8">

          {/* Headline & Eyebrow */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-300/80 text-slate-800 text-xs font-mono uppercase tracking-wider font-semibold">
              <Terminal className="w-3.5 h-3.5 text-slate-700" />
              Deterministic Synthesis Engine
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.08]">
              Turn raw API docs into a <br className="hidden sm:inline" />
              <span className="underline decoration-slate-900 underline-offset-4 decoration-4">typed Python SDK</span>.
            </h1>
            <p className="text-slate-600 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              No hallucinatory LLMs in the codegen path. Pure schema extraction, Pydantic validation, and clean-bounded deterministic emission.
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white border-2 border-slate-900 rounded-xl p-5 sm:p-8 shadow-brutal transition-transform">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="docs-url"
                  className="block text-xs font-mono font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  API Documentation Endpoint URL
                </label>
                <div className="relative rounded-md shadow-sm">
                  <input
                    id="docs-url"
                    type="url"
                    required
                    disabled={submitting}
                    placeholder="https://docs.example.com/api"
                    value={url}
                    onChange={(e) => {
                      setUrl(e.target.value);
                      if (error) setError(null);
                    }}
                    className="block w-full rounded-lg border-2 border-slate-300 py-3.5 pl-4 pr-12 text-slate-900 placeholder:text-slate-400 focus:border-slate-900 focus:ring-0 sm:text-base font-mono transition-colors disabled:bg-slate-50 disabled:cursor-not-allowed"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <Sparkles className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
              </div>

              {/* Error Callout */}
              {error && (
                <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-2.5">
                  <div className="w-4 h-4 rounded-full bg-red-600 text-white flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0">
                    !
                  </div>
                  <span className="font-medium">{error}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="text-xs text-slate-500 font-mono flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-slate-400"></span>
                  Ready to invoke Firecrawl + LangGraph state machine
                </div>

                <button
                  type="submit"
                  disabled={submitting || !url.trim()}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-lg bg-slate-900 text-white font-bold text-sm sm:text-base shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 active:translate-x-1 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Starting…</span>
                    </>
                  ) : (
                    <>
                      <span>Generate SDK</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Value Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-lg p-3.5 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">90s Pipeline</h4>
                <p className="text-xs text-slate-600 mt-0.5">Scrapes, parses, and emits compiled Python clients in seconds.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-lg p-3.5 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Zero Hallucination</h4>
                <p className="text-xs text-slate-600 mt-0.5">Pydantic v2 strict typing ensures no hallucinated parameters.</p>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-sm border border-slate-200 rounded-lg p-3.5 flex items-start gap-3">
              <Terminal className="w-5 h-5 text-emerald-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider font-mono">Compiles-by-Design</h4>
                <p className="text-xs text-slate-600 mt-0.5">Deterministic f-string code synthesis tested against Python compiler.</p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-3">
          <div className="flex items-center gap-2">
            <span>AUTO-SDK ARCHITECT v1.0</span>
            <span>•</span>
            <span>PRECISION ENGINEERING SPECIFICATION</span>
          </div>
          <div>
            <span>SYSTEM STATUS: NORMAL</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
