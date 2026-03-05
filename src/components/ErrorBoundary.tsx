'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#0f1823] text-white">
          <h1 className="text-xl font-bold mb-2">Algo deu errado</h1>
          <p className="text-white/70 text-sm mb-4 max-w-md text-center">
            A página encontrou um erro. Recarregue ou volte à página inicial.
          </p>
          <button
            type="button"
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 rounded-lg bg-white/20 hover:bg-white/30 text-sm"
          >
            Tentar novamente
          </button>
          <a
            href="/"
            className="mt-4 text-sm text-white/60 hover:text-white underline"
          >
            Voltar ao início
          </a>
        </div>
      );
    }
    return this.props.children;
  }
}
