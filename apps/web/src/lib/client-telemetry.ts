type ClientErrorType = 'window_error' | 'unhandled_rejection'

export function installClientErrorReporting(): void {
  window.addEventListener('error', (event) => {
    reportClientError(
      'window_error',
      event.message || 'Unknown browser error',
      event.error instanceof Error ? event.error.stack : undefined,
    )
  })

  window.addEventListener('unhandledrejection', (event) => {
    const reason = event.reason
    reportClientError(
      'unhandled_rejection',
      reason instanceof Error ? reason.message : String(reason).slice(0, 500),
      reason instanceof Error ? reason.stack : undefined,
    )
  })
}

function reportClientError(
  type: ClientErrorType,
  message: string,
  stack?: string,
): void {
  const body = JSON.stringify({
    type,
    message: message.slice(0, 500),
    path: window.location.pathname.slice(0, 300),
    stack: stack?.slice(0, 2_000),
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/v1/telemetry/client-errors',
      new Blob([body], { type: 'application/json' }),
    )
    return
  }

  void fetch('/api/v1/telemetry/client-errors', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body,
    keepalive: true,
  }).catch(() => undefined)
}
