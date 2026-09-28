'use client';

import React, { useState } from 'react';
import { LandRecord } from '@/types';
import { useAuth } from '@/lib/authContext';

interface FlagModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LandRecord | null;
  onFlagSuccess?: (updatedRecordId: string) => void;
}

const COMMON_REASONS = [
  'Boundary extent overlap or contested survey number',
  'Incorrect owner name or deceased ancestor not updated',
  'Land was legally transferred / sold to another party',
  'Duplicate or fraudulent self-submission',
  'Incorrect land classification (e.g. not Agricultural)',
  'Other reason (described below)',
];

export default function FlagModal({
  isOpen,
  onClose,
  record,
  onFlagSuccess,
}: FlagModalProps) {
  const { user } = useAuth();
  const [selectedReason, setSelectedReason] = useState(COMMON_REASONS[0]);
  const [customDetail, setCustomDetail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const fullReason =
      selectedReason === 'Other reason (described below)'
        ? customDetail.trim()
        : customDetail.trim()
        ? `${selectedReason}: ${customDetail.trim()}`
        : selectedReason;

    if (!fullReason) {
      setErrorMsg('Please specify a reason for flagging this parcel.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/land-records/${record.id}/flag`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user?.id || 'demo-user-flag',
        },
        body: JSON.stringify({
          reason: fullReason,
          user_id: user?.id || 'demo-user-flag',
          user_email: user?.email || 'citizen@example.com',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to flag record');
      }

      setSuccess(true);
      if (onFlagSuccess) {
        onFlagSuccess(record.id);
      }
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while flagging this record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '14px', color: 'var(--govt-navy)' }}>
            Flag Parcel Record (Dispute Report)
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Parcel Summary Table */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            borderRadius: '2px',
            padding: '0.65rem',
            marginBottom: '1rem',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Survey Number:</span>
            <strong>{record.survey_number}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Owner in Record:</span>
            <span>{record.owner_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Village / Mandal:</span>
            <span>
              {record.village_name || 'Village'}, {record.mandal_name || 'Mandal'}
            </span>
          </div>
        </div>

        {success ? (
          <div
            style={{
              padding: '1.25rem',
              textAlign: 'center',
              background: '#f0fdf4',
              border: '1px solid #86efac',
              color: '#166534',
              fontSize: '13px',
              borderRadius: '2px',
            }}
          >
            <strong>✓ Flag Recorded</strong>
            <p style={{ marginTop: '4px', fontSize: '12px' }}>
              This parcel is now marked with a dispute tag. Other citizens will see the flag notification.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {errorMsg && (
              <div
                style={{
                  padding: '0.5rem',
                  background: '#fef2f2',
                  border: '1px solid #fca5a5',
                  color: '#991b1b',
                  fontSize: '12px',
                  borderRadius: '2px',
                }}
              >
                {errorMsg}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <span>Reason Category <span className="required">*</span></span>
              </label>
              <select
                className="form-select"
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
              >
                {COMMON_REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <span>Explanation / Additional Details</span>
              </label>
              <textarea
                className="form-input"
                rows={3}
                placeholder="Explain the specific conflict or inaccuracy..."
                value={customDetail}
                onChange={(e) => setCustomDetail(e.target.value)}
                style={{ resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-outline-rose"
                disabled={loading}
              >
                {loading ? 'Submitting...' : 'Submit Flag'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
