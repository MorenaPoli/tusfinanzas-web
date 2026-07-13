import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080810] text-white p-8 flex flex-col items-center justify-center relative">
          {/* Ambient blobs for styling */}
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-80 h-80 rounded-full bg-[#FF4D6A]/10 blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#8B5CF6]/10 blur-[100px]" />
          </div>

          <div className="max-w-lg w-full p-6 rounded-2xl glass-strong border border-red-500/30 text-center space-y-4 relative z-10 shadow-[0_10px_40px_rgba(0,0,0,0.6)]">
            <h2 className="text-lg font-bold text-[#FF4D6A]">Ocurrió un error en la interfaz</h2>
            <p className="text-xs text-white/50 leading-relaxed">
              La plataforma experimentó una excepción al procesar esta pantalla. Copiá el error a continuación para enviárnoslo:
            </p>
            <div className="p-4 rounded-xl bg-black/50 border border-white/5 text-left text-[10px] font-mono text-red-300 overflow-x-auto whitespace-pre-wrap max-h-60 leading-relaxed">
              {this.state.error?.toString()}
              {this.state.error?.stack && `\n\nStack Trace:\n${this.state.error.stack}`}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem('tusfinanzas_onboarding_completed'); // Reset onboarding just in case
                window.location.reload();
              }}
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-xs font-bold"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
