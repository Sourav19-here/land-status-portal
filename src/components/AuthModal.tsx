'use client';

import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '@/lib/authContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'signin' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultMode = 'signin' }: AuthModalProps) {
  const { user, isSupabaseConnected, signInWithEmail, signUpWithEmail, switchDemoUser } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg('Please enter a valid email.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (mode === 'signup') {
        const res = await signUpWithEmail(email, password || 'password123');
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(
            isSupabaseConnected
              ? 'Registration submitted! Please verify your email.'
              : 'Citizen account created and signed in.'
          );
          setTimeout(() => onClose(), 1000);
        }
      } else {
        const res = await signInWithEmail(email, password || 'password123');
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Signed in successfully.');
          setTimeout(() => onClose(), 800);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '14px', color: 'var(--govt-navy)' }}>
            {mode === 'signin' ? 'Citizen Sign In' : 'Create Citizen Account'}
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '12px', marginBottom: '1rem', color: 'var(--text-muted)' }}>
          {isSupabaseConnected
            ? 'Sign in via Supabase Auth credentials.'
            : 'Select a pre-seeded test profile below or enter any email to authenticate.'}
        </p>

        {errorMsg && (
          <div
            style={{
              padding: '0.5rem',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              fontSize: '12px',
              marginBottom: '0.75rem',
              borderRadius: '2px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div
            style={{
              padding: '0.5rem',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              fontSize: '12px',
              marginBottom: '0.75rem',
              borderRadius: '2px',
            }}
          >
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label">
              <span>Email Address <span className="required">*</span></span>
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="citizen@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">
              <span>Password</span>
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Register'}
            </button>
          </div>
        </form>

        <div style={{ marginTop: '0.75rem', fontSize: '11.5px', color: 'var(--text-muted)' }}>
          {mode === 'signin' ? (
            <>
              Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => setMode('signup')}
                style={{ background: 'none', border: 'none', color: 'var(--govt-navy)', cursor: 'pointer', fontWeight: 600 }}
              >
                Register here
              </button>
            </>
          ) : (
            <>
              Already registered?{' '}
              <button
                type="button"
                onClick={() => setMode('signin')}
                style={{ background: 'none', border: 'none', color: 'var(--govt-navy)', cursor: 'pointer', fontWeight: 600 }}
              >
                Sign in here
              </button>
            </>
          )}
        </div>

        {/* Quick Demo Switcher Section */}
        <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--govt-navy)', marginBottom: '0.5rem' }}>
            Switch Test Profile (One-Click)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            {DEMO_USERS.map((demo) => {
              const isActive = user?.id === demo.id;
              return (
                <button
                  key={demo.id}
                  type="button"
                  onClick={() => {
                    switchDemoUser(demo);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.65rem',
                    borderRadius: '2px',
                    background: isActive ? '#e2e8f0' : '#ffffff',
                    border: `1px solid ${isActive ? 'var(--govt-navy)' : 'var(--border-color)'}`,
                    color: 'var(--text-main)',
                    cursor: 'pointer',
                    fontSize: '11.5px',
                    textAlign: 'left',
                  }}
                >
                  <div>
                    <strong>{demo.display_name}</strong>
                    <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>{demo.email}</div>
                  </div>
                  {isActive && <span style={{ color: 'var(--govt-navy)', fontWeight: 700 }}>Active</span>}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
