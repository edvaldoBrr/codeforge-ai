import React, { Component, ErrorInfo, ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CodeForge Runtime Error caught by boundary:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#0B0C12',
          color: '#F5F5FA',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '540px',
            width: '100%',
            backgroundColor: '#12141D',
            border: '1px solid #292C3B',
            borderRadius: '16px',
            padding: '28px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#F87171', margin: '0 0 8px 0' }}>
              Erro ao Inicializar o CodeForge
            </h2>
            <p style={{ fontSize: '13px', color: '#9699AC', margin: '0 0 16px 0', lineHeight: '1.5' }}>
              Ocorreu um problema ao carregar a interface. Clique abaixo para reiniciar ou limpar os dados corrompidos.
            </p>
            <div style={{
              backgroundColor: '#0B0C12',
              padding: '12px',
              borderRadius: '8px',
              border: '1px solid #292C3B',
              fontSize: '12px',
              color: '#FCA5A5',
              fontFamily: 'monospace',
              marginBottom: '20px',
              wordBreak: 'break-all'
            }}>
              {this.state.error?.message || 'Erro desconhecido'}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  flex: 1,
                  backgroundColor: '#8065F5',
                  color: '#FFFFFF',
                  border: 'none',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Recarregar Página
              </button>
              <button
                onClick={() => {
                  try { localStorage.clear(); } catch (_) {}
                  window.location.reload();
                }}
                style={{
                  backgroundColor: '#191C28',
                  color: '#9699AC',
                  border: '1px solid #292C3B',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Limpar Cache
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
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
