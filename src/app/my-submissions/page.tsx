'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import DisclaimerBanner from '@/components/DisclaimerBanner';
import Header from '@/components/Header';
import RecordCard from '@/components/RecordCard';
import AuthModal from '@/components/AuthModal';
import { AuthProvider, useAuth } from '@/lib/authContext';
import { LandRecord } from '@/types';

function MySubmissionsContent() {
  const { user } = useAuth();
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const fetchMyRecords = async () => {
    if (!user) return;
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/land-records/mine?user_id=${encodeURIComponent(user.id)}`, {
        headers: {
          'x-user-id': user.id,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to fetch submissions');
      }

      setRecords(json.data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error loading your land declarations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMyRecords();
    }
  }, [user]);

  const handleDeleteRecord = async (record: LandRecord) => {
    if (!user) return;
    if (!window.confirm(`Are you sure you want to delete Survey No. ${record.survey_number}? This will free the parcel for new declarations.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/land-records/${record.id}?user_id=${encodeURIComponent(user.id)}`, {
        method: 'DELETE',
        headers: {
          'x-user-id': user.id,
        },
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to delete record');
      }

      fetchMyRecords();
    } catch (err: any) {
      alert(err.message || 'Error occurred while deleting record');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-page)' }}>
      <DisclaimerBanner />
      <Header />

      <main className="container" style={{ flex: 1, padding: '1.25rem 1rem 3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="page-header-bar" style={{ flex: 1, margin: 0 }}>
            <h1 className="page-title">My Land Submissions</h1>
            <p className="page-subtitle">
              Declarations submitted by {user?.display_name || user?.email || 'Guest'}.
            </p>
          </div>

          {user && (
            <Link href="/submit" className="btn btn-primary" style={{ height: 'fit-content' }}>
              + Declare New Parcel
            </Link>
          )}
        </div>

        {!user ? (
          <div className="search-card-container" style={{ textAlign: 'center', padding: '2rem' }}>
            <h3 style={{ fontSize: '14px', marginBottom: '0.5rem', color: 'var(--govt-navy)' }}>
              Authentication Required
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1.25rem', color: 'var(--text-muted)' }}>
              Sign in with your citizen account to view and manage your submitted declarations.
            </p>
            <Link
              href="/sign-in"
              className="btn btn-primary"
            >
              Sign In to View Submissions
            </Link>
          </div>
        ) : loading ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div className="spinner" style={{ margin: '0 auto 0.75rem' }} />
            <p style={{ color: 'var(--text-muted)' }}>Loading submitted parcel records...</p>
          </div>
        ) : errorMsg ? (
          <div
            style={{
              padding: '0.65rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              marginBottom: '1rem',
              borderRadius: '2px',
            }}
          >
            {errorMsg}
          </div>
        ) : records.length > 0 ? (
          <div className="results-grid">
            {records.map((record) => (
              <RecordCard
                key={record.id}
                record={record}
                isOwner={true}
                onDelete={handleDeleteRecord}
                onRecordUpdated={fetchMyRecords}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3 style={{ fontSize: '14px', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              No Submissions Found
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1rem', color: 'var(--text-muted)' }}>
              You have not submitted any land parcels under this account.
            </p>
            <Link href="/submit" className="btn btn-primary">
              Submit Your First Parcel
            </Link>
          </div>
        )}
      </main>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}

export default function MySubmissionsPage() {
  return (
    <AuthProvider>
      <MySubmissionsContent />
    </AuthProvider>
  );
}
