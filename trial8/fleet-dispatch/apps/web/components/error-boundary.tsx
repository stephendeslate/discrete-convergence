'use client';

import { useEffect } from 'react';
import { reportFrontendError } from '@/lib/actions';

export function ErrorBoundaryReporter({ error }: { error: Error }) {
  useEffect(() => {
    reportFrontendError({ message: error.message, stack: error.stack });
  }, [error]);

  return null;
}
