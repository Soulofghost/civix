import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("CRITICAL SYSTEM FAILURE:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0A0B10] flex flex-col items-center justify-center p-6 text-center">
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-rose-500/20 rounded-full blur-2xl animate-pulse"></div>
            <AlertTriangle size={64} className="text-rose-500 relative z-10" />
          </div>
          <h1 className="text-3xl font-black italic text-white uppercase tracking-tighter mb-4">
            Protocol Breach Detected
          </h1>
          <p className="text-white/40 max-w-md mb-8 font-medium">
            The neural interface encountered a critical exception. System stability has been compromised, but fail-safe protocols are active.
          </p>
          <div className="flex gap-4">
            <button 
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-bold hover:bg-white/10 transition-all"
            >
              <RefreshCw size={18} /> Re-Initialize
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold shadow-lg shadow-purple-600/20 hover:scale-105 transition-all"
            >
              <Home size={18} /> Return Home
            </button>
          </div>
          <div className="mt-12 p-4 bg-black/40 border border-white/5 rounded-2xl w-full max-w-2xl text-left">
            <p className="text-[10px] font-mono text-rose-400/60 uppercase mb-2">Error Log Snippet:</p>
            <pre className="text-xs font-mono text-white/30 overflow-auto max-h-32 custom-scrollbar">
              {this.state.error?.toString()}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
