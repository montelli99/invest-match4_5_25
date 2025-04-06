import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  children: ReactNode;
  onError?: (error: Error) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class AdminAnalyticsErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AdminAnalytics Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
    
    // Call the onError callback if provided
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 border-2 border-yellow-400/50 dark:border-yellow-400/30 bg-yellow-50/50 dark:bg-yellow-900/20 rounded-lg">
          <div className="text-center space-y-4">
            <h3 className="text-xl font-bold text-yellow-700 dark:text-yellow-400">Analytics Dashboard Error</h3>
            <p className="text-yellow-600 dark:text-yellow-300">An error occurred while rendering the analytics dashboard.</p>
            <div className="text-sm text-yellow-700 dark:text-yellow-300 p-4 bg-yellow-100/50 dark:bg-yellow-900/30 rounded overflow-auto max-h-40 text-left">
              <p className="font-semibold">Error: {this.state.error?.message || 'Unknown error'}</p>
              {this.state.errorInfo && (
                <details className="mt-2">
                  <summary className="cursor-pointer font-medium">Component Stack</summary>
                  <pre className="mt-2 whitespace-pre-wrap">{this.state.errorInfo.componentStack}</pre>
                </details>
              )}
            </div>
            <div className="flex justify-center space-x-4">
              <Button 
                onClick={() => {
                  this.setState({ hasError: false, error: null, errorInfo: null });
                }}
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  window.location.reload();
                }}
              >
                Reload Page
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
