import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryThis {
  state: State;
  props: Props;
  setState: (s: State) => void;
}

const Base = (React as unknown as { Component: new (props: Props) => unknown }).Component;

export class ErrorBoundary extends (Base as new (p: Props) => ErrorBoundaryThis) {
  declare state: State;
  declare props: Props;
  declare setState: (s: State) => void;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }): void {
    console.error('[ErrorBoundary]', error, info?.componentStack);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <AlertTriangle size={48} className="text-red-400 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Algo salió mal</h2>
        <p className="text-gray-400 text-sm max-w-md mb-6">
          {this.state.error?.message || 'Error inesperado. Probá recargar la página.'}
        </p>
        <div className="flex gap-3">
          <button onClick={this.reset} className="bg-dark-700 hover:bg-dark-600 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Reintentar
          </button>
          <button onClick={() => window.location.reload()} className="bg-brand hover:bg-brand/90 text-white px-5 py-2 rounded-lg text-sm font-medium">
            Recargar
          </button>
        </div>
      </div>
    );
  }
}
