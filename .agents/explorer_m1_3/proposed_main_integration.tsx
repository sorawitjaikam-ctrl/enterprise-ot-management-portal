import React, { StrictMode, Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerServiceWorker } from './pwa/registerServiceWorker';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught Error in Application:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-white text-center">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 max-w-lg shadow-2xl space-y-4">
            <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto text-2xl font-bold">
              ⚠️
            </div>
            <h1 className="text-xl font-extrabold text-white">เกิดข้อผิดพลาดของระบบ (Application Error)</h1>
            <p className="text-xs text-slate-400 font-mono bg-slate-900/80 p-3 rounded-xl border border-slate-800 text-left overflow-x-auto">
              {this.state.error?.toString() || "Unknown Error"}
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-lg"
              >
                ล้างข้อมูลแคชและโหลดใหม่ (Clear Cache & Reload)
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalErrorBoundary>
      <App />
    </GlobalErrorBoundary>
  </StrictMode>,
);

// Register Service Worker in production with update notifications
registerServiceWorker({
  onSuccess: (reg) => {
    console.info('[PWA] Service Worker active, scope:', reg.scope);
  },
  onUpdate: (reg) => {
    console.info('[PWA] New version ready, waiting to activate.');
  },
  onOfflineReady: () => {
    console.info('[PWA] App shell cached for offline access.');
  },
  onError: (err) => {
    console.warn('[PWA] SW registration failed:', err);
  }
});
