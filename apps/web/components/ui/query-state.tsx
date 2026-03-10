import type { ReactNode } from "react";

type QueryStateProps = Readonly<{
  children: ReactNode;
  emptyMessage: string;
  hasData: boolean;
  isLoading: boolean;
  loadingMessage: string;
  error?: Error | null;
}>;

export function QueryState({
  children,
  emptyMessage,
  error,
  hasData,
  isLoading,
  loadingMessage,
}: Readonly<QueryStateProps>) {
  if (isLoading) {
    return <div className="text-sm text-muted">{loadingMessage}</div>;
  }

  if (error) {
    return <div className="text-sm text-danger">{error.message}</div>;
  }

  if (!hasData) {
    return <div className="text-sm text-muted">{emptyMessage}</div>;
  }

  return <>{children}</>;
}
