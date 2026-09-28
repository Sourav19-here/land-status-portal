'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Header from '@/components/Header';
import { AuthProvider, useAuth, DEMO_USERS } from '@/lib/authContext';

function SignInContent() {
  const router = useRouter();
  const { user, signInWithEmail, signInWithPhone, switchDemoUser, isSupabaseConnected } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (authMethod === 'email') {
        if (!email.trim()) {
          setErrorMsg('Please enter your email address.');
          setLoading(false);
          return;
        }
        const res = await signInWithEmail(email.trim(), password || 'password123');
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Signed in successfully. Redirecting...');
          setTimeout(() => router.push('/'), 600);
        }
      } else {
        if (!phone.trim()) {
          setErrorMsg('Please enter your mobile phone number.');
          setLoading(false);
          return;
        }
        const res = await signInWithPhone(phone.trim(), password || 'password123');
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg('Signed in successfully. Redirecting...');
          setTimeout(() => router.push('/'), 600);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DisclaimerBanner />
      <Header />

      <main className="container" style={{ flex: 1, padding: '2rem 1rem 4rem' }}>
        <div style={{ maxWidth: '440px', margin: '0 auto' }}>
          {/* Page Title Bar */}
          <div className="page-header-bar" style={{ textAlign: 'center', margin: '0 0 1.25rem' }}>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Citizen Portal Sign In</h1>
            <p className="page-subtitle">Access self-declared land parcel directory services</p>
          </div>

          {/* Sign In Box */}
          <div className="search-card-container">
            {/* Method Tabs */}
            <div className="search-mode-tabs" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`search-mode-tab ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => setAuthMethod('email')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Sign In with Email
              </button>
              <button
                type="button"
                className={`search-mode-tab ${authMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setAuthMethod('phone')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Sign In with Mobile
              </button>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  fontSize: '12px',
                  marginBottom: '1rem',
                  borderRadius: '2px',
                }}
              >
                {errorMsg}
              </div>
            )}

            {successMsg && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  background: '#f0fdf4',
                  border: '1px solid #86efac',
                  color: '#166534',
                  fontSize: '12px',
                  marginBottom: '1rem',
                  borderRadius: '2px',
                }}
              >
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {authMethod === 'email' ? (
                <div className="form-group">
                  <label className="form-label" htmlFor="input-email">
                    <span>Registered Email Address <span className="required">*</span></span>
                  </label>
                  <input
                    id="input-email"
                    type="email"
                    className="form-input"
                    placeholder="e.g. sourav@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label" htmlFor="input-phone">
                    <span>Mobile Phone Number <span className="required">*</span></span>
                  </label>
                  <input
                    id="input-phone"
                    type="tel"
                    className="form-input"
                    placeholder="e.g. +91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label className="form-label" htmlFor="input-password">
                  <span>Password <span className="required">*</span></span>
                </label>
                <input
                  id="input-password"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  {loading ? 'Authenticating...' : 'Sign In to Account'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Don&apos;t have an account?{' '}
              <Link href="/sign-up" style={{ color: 'var(--govt-navy)', fontWeight: 700 }}>
                Register here
              </Link>
            </div>

            {/* Quick Demo Switcher */}
            <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--govt-navy)', marginBottom: '0.4rem' }}>
                Quick Persona Switcher (Test / Demo)
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
                        router.push('/');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.4rem 0.65rem',
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
                        <div style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          {demo.email} • {demo.phone}
                        </div>
                      </div>
                      {isActive && <span style={{ color: 'var(--govt-navy)', fontWeight: 700 }}>Active</span>}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer
        style={{
          borderTop: '1px solid var(--border-color)',
          background: '#ffffff',
          padding: '1.25rem 0',
          fontSize: '11.5px',
          color: 'var(--text-light)',
          textAlign: 'center',
        }}
      >
        <div className="container">
          <p>© {new Date().getFullYear()} Know Land Status — Indian Citizen Registry Clone</p>
        </div>
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <AuthProvider>
      <SignInContent />
    </AuthProvider>
  );
}
