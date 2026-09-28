'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Header from '@/components/Header';
import SubmissionForm from '@/components/SubmissionForm';
import AuthModal from '@/components/AuthModal';
import { AuthProvider, useAuth } from '@/lib/authContext';

function SubmitPageContent() {
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DisclaimerBanner />
      <Header />

      <main className="container" style={{ flex: 1, padding: '1.25rem 1rem 3rem' }}>
        <div className="page-header-bar">
          <h1 className="page-title">Submit Land Parcel Declaration</h1>
          <p className="page-subtitle">
            Citizen registration form. Submitted records are added to the directory under &quot;Unverified&quot; status.
          </p>
        </div>

        {!user ? (
          <div className="search-card-container" style={{ padding: '2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '0.5rem', color: 'var(--govt-navy)' }}>
              Citizen Sign-In Required
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.25rem', color: 'var(--text-muted)' }}>
              You must be signed in to submit a land parcel declaration.
            </p>
            <Link
              href="/sign-in"
              className="btn btn-primary"
            >
              Sign In to Proceed
            </Link>
          </div>
        ) : (
          <SubmissionForm />
        )}

        <div
          style={{
            marginTop: '1.5rem',
            padding: '0.85rem',
            background: '#ffffff',
            border: '1px solid var(--border-color)',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            borderRadius: '2px',
          }}
        >
          <strong>Policy Note:</strong> Under the first-submitter-wins rule, a (Village + Survey Number) pair can only have one active submission. If an entry already exists, use the Flag action on the existing record.
        </div>
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function SubmitPage() {
  return (
    <AuthProvider>
      <SubmitPageContent />
    </AuthProvider>
  );
}
