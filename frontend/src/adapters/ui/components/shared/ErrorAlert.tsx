interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div className="rounded-md bg-red-50 p-4 border border-red-200">
      <div className="flex items-start gap-3">
        <span className="text-red-600 text-xl">⚠️</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-red-800">{message}</p>
          {onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 text-sm text-red-700 underline hover:text-red-900"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
