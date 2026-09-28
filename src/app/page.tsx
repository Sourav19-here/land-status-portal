'use client';

import React from 'react';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Header from '@/components/Header';
import SearchPortal from '@/components/SearchPortal';
import { AuthProvider } from '@/lib/authContext';

export default function HomePage() {
  return (
    <AuthProvider>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
        <DisclaimerBanner />
        <Header />

        <main className="container" style={{ flex: 1, paddingBottom: '3rem' }}>
          {/* Plain Page Header Bar (No Hero, No Gradient, No Decorative Pill) */}
          <div className="page-header-bar">
            <h1 className="page-title">Know Land Status — Parcel Search</h1>
            <p className="page-subtitle">
              Citizen Self-Declared Land Directory. Select administrative hierarchy (District → Mandal → Village) or search by Pattadar / Passbook Number.
            </p>
          </div>

          {/* Search Portal Component */}
          <SearchPortal />

          {/* Simple Utilitarian Reference Box */}
          <div
            style={{
              background: '#ffffff',
              border: '1px solid var(--border-color)',
              padding: '1rem',
              borderRadius: '2px',
              marginTop: '1.5rem',
              fontSize: '12px',
              color: 'var(--text-muted)',
            }}
          >
            <strong style={{ color: 'var(--govt-navy)' }}>Important Guidelines:</strong>
            <ul style={{ paddingLeft: '1.25rem', marginTop: '0.4rem', lineHeight: '1.6' }}>
              <li>
                This portal serves as a community land information directory. Every record is self-reported by registered users.
              </li>
              <li>
                All parcels carry an <strong>Unverified (Self-Declared)</strong> tag. Citizens can flag discrepancies or boundary conflicts using the &ldquo;Flag Incorrect&rdquo; action on any record.
              </li>
              <li>
                For legally certified title deeds, passbooks, or encumbrance certificates, refer directly to official state revenue offices.
              </li>
            </ul>
          </div>
        </main>

        {/* Utilitarian Footer */}
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
            <p style={{ marginBottom: '0.25rem' }}>
              Know Land Status Portal — Citizen Registry Prototype. Not affiliated with government revenue departments.
            </p>
            <p>© {new Date().getFullYear()} Independent Land Status Directory.</p>
          </div>
        </footer>
      </div>
    </AuthProvider>
  );
}
