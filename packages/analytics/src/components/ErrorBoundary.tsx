import posthog from "posthog-js";
import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, errorInfo: ErrorInfo) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component that captures React errors and sends them to PostHog
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Capture error with PostHog
    if (typeof window !== "undefined" && posthog) {
      posthog.capture("$exception", {
        $exception_type: error.name,
        $exception_message: error.message,
        $exception_stack_trace: error.stack,
        $exception_component_stack: errorInfo.componentStack,
        $exception_source: "react-error-boundary",
      });
    }

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState({
      errorInfo,
    });

    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo);
      }

      // Default error UI
      return (
        <div style={{ padding: "20px", maxWidth: "600px", margin: "50px auto" }}>
          <h1 style={{ color: "#d32f2f" }}>Something went wrong</h1>
          <p>We&apos;ve been notified and are working to fix the issue.</p>
          {process.env.NODE_ENV === "development" && (
            <details style={{ marginTop: "20px" }}>
              <summary style={{ cursor: "pointer", marginBottom: "10px" }}>
                Error Details (Development Only)
              </summary>
              <pre
                style={{
                  background: "#f5f5f5",
                  padding: "15px",
                  borderRadius: "4px",
                  overflow: "auto",
                }}
              >
                <strong>Error:</strong> {this.state.error.toString()}
                {"\n\n"}
                <strong>Stack Trace:</strong>
                {"\n"}
                {this.state.error.stack}
                {"\n\n"}
                <strong>Component Stack:</strong>
                {"\n"}
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: "20px",
              padding: "10px 20px",
              background: "#1976d2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
