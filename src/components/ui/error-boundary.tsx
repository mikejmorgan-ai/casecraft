'use client'

import React, { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface ErrorFallbackProps {
  error: Error
  resetErrorBoundary: () => void
  title?: string
  description?: string
}

/**
 * ErrorFallback - A professional error display component with retry capability
 */
export function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
}: ErrorFallbackProps) {
  return (
    <Card className="w-full max-w-lg mx-auto my-8 border-destructive/50">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 rounded-full bg-destructive/10 w-fit">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <CardTitle className="text-xl text-destructive">{title}</CardTitle>
        <CardDescription className="text-muted-foreground">
          {description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            View error details
          </summary>
          <div className="mt-3 p-3 rounded-md bg-muted/50 border">
            <p className="text-sm font-mono text-destructive break-all">
              {error.message}
            </p>
            {error.stack && (
              <pre className="mt-2 text-xs text-muted-foreground overflow-auto max-h-32">
                {error.stack}
              </pre>
            )}
          </div>
        </details>
      </CardContent>
      <CardFooter className="flex justify-center gap-3">
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Reload Page
        </Button>
        <Button onClick={resetErrorBoundary}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </CardFooter>
    </Card>
  )
}

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
  onReset?: () => void
  fallbackTitle?: string
  fallbackDescription?: string
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

/**
 * ErrorBoundary - A React error boundary class component
 * Catches JavaScript errors in child component tree and displays a fallback UI
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Use default ErrorFallback
      return (
        <ErrorFallback
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
          title={this.props.fallbackTitle}
          description={this.props.fallbackDescription}
        />
      )
    }

    return this.props.children
  }
}

/**
 * InlineErrorFallback - A compact error display for inline contexts
 */
export function InlineErrorFallback({
  error,
  resetErrorBoundary,
  className = '',
}: {
  error: Error
  resetErrorBoundary: () => void
  className?: string
}) {
  return (
    <div className={`flex items-center gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/30 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-destructive">Error loading content</p>
        <p className="text-xs text-muted-foreground truncate">{error.message}</p>
      </div>
      <Button
        variant="outline"
        size="sm"
        onClick={resetErrorBoundary}
      >
        <RefreshCw className="h-3 w-3 mr-1" />
        Retry
      </Button>
    </div>
  )
}

/**
 * ErrorAlert - Display error messages in a dismissible alert
 */
export function ErrorAlert({
  error,
  onDismiss,
  className = '',
}: {
  error: string | Error | null
  onDismiss?: () => void
  className?: string
}) {
  if (!error) return null

  const message = typeof error === 'string' ? error : error.message

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20 ${className}`}>
      <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-destructive font-medium">Error</p>
        <p className="text-sm text-destructive/80 mt-1">{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="shrink-0 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Dismiss
        </Button>
      )}
    </div>
  )
}

/**
 * SuccessAlert - Display success messages in a dismissible alert
 */
export function SuccessAlert({
  message,
  onDismiss,
  className = '',
}: {
  message: string | null
  onDismiss?: () => void
  className?: string
}) {
  if (!message) return null

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg bg-green-500/10 border border-green-500/20 ${className}`}>
      <div className="h-5 w-5 rounded-full bg-green-500 flex items-center justify-center shrink-0 mt-0.5">
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-green-700 dark:text-green-400">{message}</p>
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="shrink-0 text-green-700 dark:text-green-400 hover:bg-green-500/10"
        >
          Dismiss
        </Button>
      )}
    </div>
  )
}
