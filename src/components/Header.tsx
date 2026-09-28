'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/authContext';

export default function Header() {
  const pathname = usePathname();
  const { user, profile, signOut, isSupabaseConnected } = useAuth();

  const userIdentifier = user?.email || profile?.phone || user?.phone || profile?.display_name || user?.display_name;

  return (
    <header className="app-header">
      <div className="container header-inner">
        <Link href="/" className="brand-group">
          <div className="brand-title-wrap">
            <span className="brand-title">Know Land Status Portal</span>
            <span className="brand-subtitle">
              Telangana Land Parcel Directory (Citizen Declarations Prototype)
            </span>
          </div>
        </Link>

        <nav className="header-nav">
          <Link
            href="/"
            className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          >
            Search Parcel
          </Link>

          <Link
            href="/submit"
            className={`nav-link ${pathname === '/submit' ? 'active' : ''}`}
          >
            Submit Parcel
          </Link>

          <Link
            href="/my-submissions"
            className={`nav-link ${pathname === '/my-submissions' ? 'active' : ''}`}
          >
            My Submissions
          </Link>
        </nav>

        {/* Session-Aware Controls: Show Sign In link if logged out; Show user email + Sign Out if logged in */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <span
            style={{
              fontSize: '11px',
              padding: '2px 6px',
              borderRadius: '2px',
              background: isSupabaseConnected ? '#14532d' : '#854d0e',
              color: '#ffffff',
              fontWeight: 600,
            }}
          >
            {isSupabaseConnected ? 'Cloud DB' : 'Local Seed DB'}
          </span>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '11.5px',
                  color: '#ffffff',
                  maxWidth: '180px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
                title={userIdentifier}
              >
                {userIdentifier}
              </div>

              <button
                type="button"
                onClick={() => signOut()}
                style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-dark)',
                  color: '#991b1b',
                  padding: '3px 8px',
                  borderRadius: '2px',
                  fontSize: '11.5px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              style={{
                background: '#ffffff',
                border: '1px solid #ffffff',
                color: 'var(--govt-navy)',
                padding: '4px 10px',
                borderRadius: '2px',
                fontSize: '12px',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
