'use client';

import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log the error to an error reporting service if available
    console.error('Application Error:', error);
  }, [error]);

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-center">
          <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center text-destructive border border-destructive/20">
            <AlertCircle className="h-8 w-8" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-2xl font-bold tracking-tight">System Interruption</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A synchronization error occurred while processing your request. This has been logged for our technical team.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto h-11 px-6 bg-primary text-background font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all active:scale-95"
          >
            <RefreshCcw className="h-3.5 w-3.5" />
            Try Again
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto h-11 px-6 border border-border text-foreground font-bold text-xs uppercase tracking-widest rounded-sm flex items-center justify-center gap-2 hover:bg-secondary/50 transition-all active:scale-95"
          >
            <Home className="h-3.5 w-3.5" />
            Return Home
          </Link>
        </div>
        
        <div className="pt-8 border-t border-border/40">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40">
            Error ID: {error.digest || 'unknown'}
          </p>
        </div>
      </div>
    </div>
  );
}
