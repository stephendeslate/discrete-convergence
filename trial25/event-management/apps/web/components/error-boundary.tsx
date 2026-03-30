// TRACED:EM-FE-007
'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/30">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Something went wrong</h2>
          <p className="mt-2 text-red-600 dark:text-red-400">{this.state.error.message}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

export function ErrorBoundaryFallback({ error }: { error: Error }) {
  return (
    <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-6 dark:border-red-800 dark:bg-red-900/30">
      <h2 className="text-lg font-semibold text-red-800 dark:text-red-300">Something went wrong</h2>
      <p className="mt-2 text-red-600 dark:text-red-400">{error.message}</p>
    </div>
  );
}
