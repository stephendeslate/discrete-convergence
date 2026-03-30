// TRACED:WEB-ERROR-BOUNDARY — Error boundary component
'use client';

import { Component, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div role="alert" className={cn('bg-red-50 border border-red-200 rounded-lg p-6 dark:bg-red-900/30 dark:border-red-800')}>
          <h2 className={cn('text-lg font-semibold text-red-800 dark:text-red-300')}>Something went wrong</h2>
          <p className={cn('mt-2 text-sm text-red-700 dark:text-red-400')}>{this.state.error?.message}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className={cn('mt-4 rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700 dark:bg-red-500')}
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
