import { useState } from 'react';
import type { FormEvent } from 'react';

const AUTH_TOKEN_KEY = 'sp_auth_token';

export function setAuthToken(token: string) {
  sessionStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function getAuthToken(): string | null {
  return sessionStorage.getItem(AUTH_TOKEN_KEY);
}

export function clearAuthToken() {
  sessionStorage.removeItem(AUTH_TOKEN_KEY);
}

const Login = ({ onLogin }: { onLogin: () => void }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.token) {
        setAuthToken(data.token);
        onLogin();
      } else {
        setError(data.error || 'Contraseña incorrecta');
        setPassword('');
      }
    } catch {
      setError('Error de conexión. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f5f9',
    }}>
      <style>
        {`\n          @keyframes loginFadeInUp {\n            from {\n              opacity: 0;\n              transform: translateY(16px) scale(0.98);\n            }\n            to {\n              opacity: 1;\n              transform: translateY(0) scale(1);\n            }\n          }\n        `}
      </style>
      <div style={{
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        padding: '2.5rem 2rem',
        width: '100%',
        maxWidth: '380px',
        animation: 'loginFadeInUp 420ms ease-out',
      }}>
        {/* Logo / cabecera */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            overflow: 'hidden',
          }}>
            <img 
              src="/Logo syp.png" 
              alt="Logo SYP" 
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
          <h1 style={{ fontSize: '1.375rem', fontWeight: '700', color: '#1e293b', margin: 0 }}>
            Acceso restringido
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '0.375rem' }}>
            Ingrese la contraseña para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1.25rem' }}>
            <label
              htmlFor="password"
              style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.5rem' }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoFocus
                autoComplete="current-password"
                placeholder="••••••••••••"
                style={{
                  width: '100%',
                  padding: '0.625rem 2.75rem 0.625rem 0.875rem',
                  border: error ? '1px solid #ef4444' : '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '1rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => { e.target.style.borderColor = '#1e3a8a'; }}
                onBlur={e => { e.target.style.borderColor = error ? '#ef4444' : '#d1d5db'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{
                  position: 'absolute',
                  right: '0.625rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9ca3af',
                  padding: '0',
                  display: 'flex',
                  alignItems: 'center',
                }}
                tabIndex={-1}
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                    <circle cx="12" cy="12" r="3"/>
                  </svg>
                )}
              </button>
            </div>
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.8125rem', marginTop: '0.375rem', margin: '0.375rem 0 0 0' }}>
                {error}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: loading || !password ? '#6f86d6' : '#0b1f66',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '0.9375rem',
              fontWeight: '600',
              cursor: loading || !password ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>

          <p style={{ color: '#64748b', fontSize: '0.8125rem', textAlign: 'center', margin: '0.85rem 0 0 0' }}>
            Si tiene alguna pregunta, contacte al area de Automatizacion.
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;