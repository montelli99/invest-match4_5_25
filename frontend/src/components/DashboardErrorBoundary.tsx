import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class DashboardErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Error:', error);
    console.error('Component Stack:', errorInfo.componentStack);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto py-6">
          <Card className="p-6 border-2 border-red-400 bg-red-50">
            <div className="text-center space-y-4">
              <h1 className="text-2xl font-bold text-red-700">Admin Dashboard Error</h1>
              <p className="text-red-600">An error occurred while loading the Admin Dashboard.</p>
              <div className="text-sm text-red-500 p-4 bg-red-100 rounded overflow-auto max-h-40 text-left">
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
                    // Force a full page reload
                    window.location.reload();
                  }}
                >
                  Reload Page
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    this.setState({ hasError: false, error: null, errorInfo: null });
                  }}
                >
                  Try Again
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    window.location.href = '/';
                  }}
                >
                  Return to Home
                </Button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
