import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  private handleRefresh = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            {/* FANZON Logo */}
            <div className="flex justify-center">
              <div className="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
                <span className="text-2xl font-bold tracking-tight">FANZON</span>
              </div>
            </div>

            {/* Error Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-destructive" />
              </div>
            </div>

            {/* Error Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Oops! Something went wrong
              </h1>
              <p className="text-muted-foreground">
                We're sorry, but something unexpected happened. Please try refreshing
                the page or go back to the homepage.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={this.handleRefresh}
                className="bg-primary hover:bg-primary/90"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh Page
              </Button>
              <Button
                variant="outline"
                onClick={this.handleGoHome}
              >
                Go to Homepage
              </Button>
            </div>

            {/* Support Info */}
            <p className="text-sm text-muted-foreground">
              If the problem persists, please contact our support team at{" "}
              <a
                href="mailto:support@fanzon.pk"
                className="text-primary hover:underline"
              >
                support@fanzon.pk
              </a>
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
