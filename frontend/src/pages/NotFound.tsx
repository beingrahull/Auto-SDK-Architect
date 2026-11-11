import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 selection:bg-slate-900 selection:text-white">
      <div className="max-w-md w-full bg-white border-2 border-slate-900 rounded-xl p-8 shadow-brutal text-center space-y-5">
        <div className="w-12 h-12 bg-amber-100 border border-amber-300 rounded-full flex items-center justify-center mx-auto text-amber-700">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-slate-400">Error 404</span>
          <h1 className="text-2xl font-extrabold text-slate-900 mt-1">Page Not Found</h1>
          <p className="text-sm text-slate-600 mt-2">
            The page or route you are looking for does not exist in the v1 architecture.
          </p>
        </div>

        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-slate-900 text-white font-bold text-sm shadow-brutal-sm hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Generator</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
