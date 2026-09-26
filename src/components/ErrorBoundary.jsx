import { Component } from 'react';

/**
 * Global Error Boundary — catches unhandled render errors in child components
 * and shows a friendly recovery UI instead of a black/blank screen.
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // Log to console for debugging
    console.error('[ErrorBoundary] Caught error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          padding: '40px 20px',
          fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        }}>
          <div style={{
            background: 'var(--surface, #1a1a2e)',
            border: '1px solid var(--border, rgba(255,255,255,0.1))',
            borderRadius: '16px',
            padding: '40px',
            maxWidth: '480px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            {/* Error icon */}
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '16px',
              background: 'rgba(239, 68, 68, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '28px',
            }}>
              ⚠️
            </div>

            <h2 style={{
              color: 'var(--text, #fff)',
              fontSize: '18px',
              fontWeight: 700,
              margin: '0 0 8px',
            }}>
              Sahifada xatolik yuz berdi
            </h2>

            <p style={{
              color: 'var(--text-muted, #999)',
              fontSize: '13px',
              lineHeight: '1.6',
              margin: '0 0 24px',
            }}>
              Ushbu sahifani yuklashda kutilmagan xatolik yuz berdi.
              Qayta urinib ko'ring yoki bosh sahifaga qayting.
            </p>

            {/* Error details (collapsible) */}
            {this.state.error && (
              <details style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '10px',
                padding: '12px',
                marginBottom: '20px',
                textAlign: 'left',
              }}>
                <summary style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: '8px',
                }}>
                  Xatolik tafsilotlari
                </summary>
                <pre style={{
                  color: 'var(--text-muted, #999)',
                  fontSize: '11px',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                  fontFamily: 'monospace',
                }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack && (
                    `\n\nComponent Stack:${this.state.errorInfo.componentStack}`
                  )}
                </pre>
              </details>
            )}

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  background: 'var(--primary, #2563EB)',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.target.style.opacity = '0.85'}
                onMouseOut={e => e.target.style.opacity = '1'}
              >
                🔄 Qayta urinish
              </button>
              <button
                onClick={this.handleGoHome}
                style={{
                  background: 'transparent',
                  color: 'var(--text-muted, #999)',
                  border: '1px solid var(--border, rgba(255,255,255,0.15))',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'opacity 0.2s',
                }}
                onMouseOver={e => e.target.style.opacity = '0.75'}
                onMouseOut={e => e.target.style.opacity = '1'}
              >
                🏠 Bosh sahifa
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
