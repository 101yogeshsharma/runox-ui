"use client";
import React from "react";
import { Box } from "../../atoms/Box";
import { Button } from "../Button";
import { rnx } from "../../utils/rnx";

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /**
   * Custom fallback UI. Receives the caught error and a reset callback.
   * When omitted, a default styled fallback with a retry button is rendered.
   */
  fallback?: (info: { error: Error; reset: () => void }) => React.ReactNode;
  /** Called when an error is caught (e.g. for reporting). */
  onError?: (error: Error, info: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  error: Error | null;
}

/**
 * Catches render-time errors in its subtree and renders a fallback instead of
 * crashing the whole page. Use around widget-level subtrees (dashboards,
 * charts, editors) so one broken section doesn't take down the app.
 *
 * ```tsx
 * <ErrorBoundary>
 *   <MyWidget />
 * </ErrorBoundary>
 * ```
 */
class ErrorBoundaryComponent extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  displayName = "ErrorBoundary";

  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Surface in dev so bugs aren't silently swallowed by the fallback.
    if (process.env.NODE_ENV !== "production") {
      console.error("[Runox UI - ErrorBoundary]", error, info.componentStack);
    }
    this.props.onError?.(error, info);
  }

  reset = () => this.setState({ error: null });

  render() {
    const { error } = this.state;
    if (error) {
      if (this.props.fallback) {
        return this.props.fallback({ error, reset: this.reset });
      }
      return (
        <Box
          role="alert"
          {...rnx({
            component: "ErrorBoundary",
            state: "error",
            action: "retry",
          })}
          className="rnx-error-boundary"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "var(--space-2)",
            padding: "var(--space-4)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            backgroundColor: "var(--card)",
            color: "var(--foreground)",
          }}
        >
          <strong style={{ fontSize: "var(--text-sm)" }}>
            Something went wrong
          </strong>
          <span
            style={{
              fontSize: "var(--text-xs)",
              color: "var(--muted-foreground)",
            }}
          >
            {process.env.NODE_ENV !== "production" ? error.message : null}
          </span>
          <Button size="sm" variant="outline" onClick={this.reset}>
            Try again
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}

export const ErrorBoundary = ErrorBoundaryComponent;
