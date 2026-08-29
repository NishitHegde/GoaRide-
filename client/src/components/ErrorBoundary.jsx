import React from 'react';
import { RefreshCw, Home, AlertTriangle } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('GoaRide App Error Captured by Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-900 text-white font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-slate-800/90 border border-slate-700 shadow-2xl text-center space-y-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
              <AlertTriangle className="w-8 h-8 animate-pulse" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Oops! Something went wrong</h2>
              <p className="text-xs text-slate-300 font-medium">
                The application encountered an unexpected runtime state. Don't worry, your session is safe!
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 text-left text-[11px] font-mono text-amber-300/90 overflow-x-auto max-h-32 border border-slate-800">
              {this.state.error?.toString() || 'Unknown Application Error'}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 font-extrabold text-xs text-white shadow-lg flex items-center justify-center gap-2 hover:scale-105 transition-transform"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Page</span>
              </button>

              <button
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.href = '/';
                }}
                className="py-3 px-4 rounded-2xl bg-slate-700 hover:bg-slate-600 font-bold text-xs text-slate-200 border border-slate-600 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
