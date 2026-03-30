'use client';

import { ErrorBoundary } from '../../components/error-boundary';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}): React.ReactElement {
  return <ErrorBoundary error={error} reset={reset} />;
}
