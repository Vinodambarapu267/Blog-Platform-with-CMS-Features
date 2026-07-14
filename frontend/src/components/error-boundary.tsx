import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    
    console.error("[ErrorBoundary] Caught a render error:", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="bg-ambient flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-danger/15 text-danger">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Something broke on this page</h1>
            <p className="mt-2 max-w-md text-sm text-text-secondary">{this.state.error.message}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            <RotateCcw className="h-4 w-4" /> Reload
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
