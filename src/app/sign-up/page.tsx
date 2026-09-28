'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Header from '@/components/Header';
import { AuthProvider, useAuth } from '@/lib/authContext';

function SignUpContent() {
  const router = useRouter();
  const { signUpWithEmail, signUpWithPhone, isSupabaseConnected } = useAuth();

  const [authMethod, setAuthMethod] = useState<'email' | 'phone'>('email');
  const [displayName, setDisplayName] = useState('');
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

    if (!displayName.trim()) {
      setErrorMsg('Please enter your full name as it should appear in declarations.');
      setLoading(false);
      return;
    }

    try {
      if (authMethod === 'email') {
        if (!email.trim()) {
          setErrorMsg('Please enter a valid email address.');
          setLoading(false);
          return;
        }
        const res = await signUpWithEmail(
          email.trim(),
          password || 'password123',
          displayName.trim(),
          phone.trim() || undefined
        );
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(
            isSupabaseConnected
              ? 'Registration submitted! Please verify your email.'
              : 'Citizen registration completed. Redirecting to portal...'
          );
          setTimeout(() => router.push('/'), 1200);
        }
      } else {
        if (!phone.trim()) {
          setErrorMsg('Please enter your mobile phone number.');
          setLoading(false);
          return;
        }
        const res = await signUpWithPhone(
          phone.trim(),
          password || 'password123',
          displayName.trim()
        );
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          setSuccessMsg(
            isSupabaseConnected
              ? 'Account created! Verification code sent to your phone.'
              : 'Mobile registration completed. Redirecting to portal...'
          );
          setTimeout(() => router.push('/'), 1200);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DisclaimerBanner />
      <Header />

      <main className="container" style={{ flex: 1, padding: '2rem 1rem 4rem' }}>
        <div style={{ maxWidth: '460px', margin: '0 auto' }}>
          {/* Page Title Bar */}
          <div className="page-header-bar" style={{ textAlign: 'center', margin: '0 0 1.25rem' }}>
            <h1 className="page-title" style={{ fontSize: '1.25rem' }}>Citizen Registration</h1>
            <p className="page-subtitle">Create account to submit and manage land parcel declarations</p>
          </div>

          <div className="search-card-container">
            {/* Method Tabs */}
            <div className="search-mode-tabs" style={{ marginBottom: '1rem' }}>
              <button
                type="button"
                className={`search-mode-tab ${authMethod === 'email' ? 'active' : ''}`}
                onClick={() => setAuthMethod('email')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Register via Email
              </button>
              <button
                type="button"
                className={`search-mode-tab ${authMethod === 'phone' ? 'active' : ''}`}
                onClick={() => setAuthMethod('phone')}
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Register via Mobile
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
              <div className="form-group">
                <label className="form-label" htmlFor="input-display-name">
                  <span>Full Name / Pattadar Name <span className="required">*</span></span>
                </label>
                <input
                  id="input-display-name"
                  type="text"
                  className="form-input"
                  placeholder="e.g. Sourav Kumar or Kotha Venkataiah"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required
                />
              </div>

              {authMethod === 'email' ? (
                <>
                  <div className="form-group">
                    <label className="form-label" htmlFor="input-signup-email">
                      <span>Email Address <span className="required">*</span></span>
                    </label>
                    <input
                      id="input-signup-email"
                      type="email"
                      className="form-input"
                      placeholder="e.g. citizen@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="input-signup-alt-phone">
                      <span>Contact Mobile Phone (Optional)</span>
                    </label>
                    <input
                      id="input-signup-alt-phone"
                      type="tel"
                      className="form-input"
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </>
              ) : (
                <div className="form-group">
                  <label className="form-label" htmlFor="input-signup-phone">
                    <span>Mobile Phone Number <span className="required">*</span></span>
                  </label>
                  <input
                    id="input-signup-phone"
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
                <label className="form-label" htmlFor="input-signup-pwd">
                  <span>Create Password <span className="required">*</span></span>
                </label>
                <input
                  id="input-signup-pwd"
                  type="password"
                  className="form-input"
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div
                style={{
                  padding: '0.65rem',
                  background: '#f8fafc',
                  border: '1px solid var(--border-color)',
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  borderRadius: '2px',
                }}
              >
                By registering, you agree that submitted land details are self-declared public records and subject to community dispute verification.
              </div>

              <div style={{ marginTop: '0.25rem' }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                  style={{ width: '100%', padding: '0.6rem' }}
                >
                  {loading ? 'Submitting Registration...' : 'Complete Registration'}
                </button>
              </div>
            </form>

            <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>
              Already registered?{' '}
              <Link href="/sign-in" style={{ color: 'var(--govt-navy)', fontWeight: 700 }}>
                Sign in here
              </Link>
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

export default function SignUpPage() {
  return (
    <AuthProvider>
      <SignUpContent />
    </AuthProvider>
  );
}
