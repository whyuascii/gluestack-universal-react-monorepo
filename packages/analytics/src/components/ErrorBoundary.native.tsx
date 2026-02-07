import React, { Component, type ErrorInfo, type ReactNode } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { analytics } from "../config/posthog.mobile";

interface Props {
  children: ReactNode;
  /**
   * Custom fallback component to render when an error occurs.
   * For a polished UI, pass GeneralError from @app/components:
   * @example
   * ```tsx
   * import { GeneralError } from "@app/components";
   *
   * <ErrorBoundary
   *   fallback={(error, info, retry) => (
   *     <GeneralError
   *       onRetry={retry}
   *       errorDetails={error.toString()}
   *       componentStack={info.componentStack}
   *     />
   *   )}
   * >
   *   {children}
   * </ErrorBoundary>
   * ```
   */
  fallback?: (error: Error, errorInfo: ErrorInfo, retry: () => void) => ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * ErrorBoundary component for React Native that captures errors and sends them to PostHog
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
    const client = analytics.getClient();
    if (client) {
      client.capture("$exception", {
        $exception_type: error.name,
        $exception_message: error.message,
        $exception_stack_trace: error.stack ?? "",
        $exception_component_stack: errorInfo.componentStack ?? "",
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
    if (__DEV__) {
      console.error("ErrorBoundary caught an error:", error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError && this.state.error && this.state.errorInfo) {
      // Render custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.state.errorInfo, this.handleRetry);
      }

      // Default error UI
      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <Text style={styles.title}>Something went wrong</Text>
            <Text style={styles.message}>
              We&apos;ve been notified and are working to fix the issue.
            </Text>

            {__DEV__ && (
              <ScrollView style={styles.detailsContainer}>
                <Text style={styles.detailsTitle}>Error Details (Development Only)</Text>
                <View style={styles.errorBox}>
                  <Text style={styles.errorText}>
                    <Text style={styles.bold}>Error:</Text> {this.state.error.toString()}
                    {"\n\n"}
                    <Text style={styles.bold}>Stack Trace:</Text>
                    {"\n"}
                    {this.state.error.stack}
                    {"\n\n"}
                    <Text style={styles.bold}>Component Stack:</Text>
                    {"\n"}
                    {this.state.errorInfo.componentStack}
                  </Text>
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={styles.button} onPress={this.handleRetry}>
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#d32f2f",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#666",
    marginBottom: 20,
  },
  detailsContainer: {
    maxHeight: 300,
    marginVertical: 20,
  },
  detailsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 10,
  },
  errorBox: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 4,
  },
  errorText: {
    fontSize: 12,
    fontFamily: "monospace",
  },
  bold: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#1976d2",
    padding: 15,
    borderRadius: 4,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
