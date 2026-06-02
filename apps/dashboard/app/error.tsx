"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="card max-w-md w-full text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
          <AlertTriangle size={32} className="text-red-400" />
        </div>
        <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
        <p className="mt-2 text-sm text-slate-400">An unexpected error occurred. Our team has been notified.</p>
        {error.digest && <p className="mt-2 text-xs text-slate-600 font-mono">Error ID: {error.digest}</p>}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={reset} className="btn-primary">
            <RefreshCw size={16} /> Try Again
          </button>
          <Link href="/" className="btn-secondary">
            <Home size={16} /> Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
