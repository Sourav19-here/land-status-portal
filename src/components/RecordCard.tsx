'use client';

import React, { useState } from 'react';
import { LandRecord } from '@/types';
import FlagModal from './FlagModal';

interface RecordCardProps {
  record: LandRecord;
  onRecordUpdated?: () => void;
  isOwner?: boolean;
  onEdit?: (record: LandRecord) => void;
  onDelete?: (record: LandRecord) => void;
}

export default function RecordCard({
  record,
  onRecordUpdated,
  isOwner = false,
  onEdit,
  onDelete,
}: RecordCardProps) {
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  // Plain bordered rectangular tags without icons or glows
  const renderStatusTag = (status: LandRecord['verification_status']) => {
    switch (status) {
      case 'verified':
        return <span className="status-tag status-verified">Verified</span>;
      case 'flagged':
        return <span className="status-tag status-flagged">Flagged Dispute</span>;
      case 'unverified':
      default:
        return <span className="status-tag status-unverified">Unverified (Self-Declared)</span>;
    }
  };

  const formattedDate = new Date(record.created_at).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });

  return (
    <>
      <article className="record-card">
        <div>
          {/* Top Row: Survey Number + Plain Bordered Status Tag */}
          <div className="record-top">
            <div className="parcel-survey-badge">
              <span>Survey No. {record.survey_number}</span>
            </div>
            {renderStatusTag(record.verification_status)}
          </div>

          {/* Owner details */}
          <div className="owner-name">{record.owner_name}</div>
          {record.father_name && (
            <div className="father-name">S/o, W/o, D/o: {record.father_name}</div>
          )}

          {/* Location Line */}
          <div
            style={{
              fontSize: '11.5px',
              color: 'var(--text-muted)',
              marginBottom: '0.65rem',
            }}
          >
            <strong>Location:</strong> {record.village_name || 'Village'}, {record.mandal_name || 'Mandal'}, {record.district_name || 'District'}
          </div>

          {/* Key Attributes Grid - Compact Table Style */}
          <div className="card-details-grid">
            <div className="detail-item">
              <span className="detail-label">Extent Area</span>
              <span className="detail-val">
                {record.extent_acres.toFixed(2)} Acres
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Classification</span>
              <span className="detail-val">{record.classification}</span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Passbook No.</span>
              <span className="detail-val">
                {record.passbook_number || '—'}
              </span>
            </div>

            <div className="detail-item">
              <span className="detail-label">Khata No.</span>
              <span className="detail-val">
                {record.khata_number || '—'}
              </span>
            </div>
          </div>

          {/* Dispute Notice if Flagged */}
          {record.verification_status === 'flagged' && (
            <div
              style={{
                padding: '0.4rem 0.6rem',
                border: '1px solid #fca5a5',
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: '11px',
                marginBottom: '0.65rem',
                borderRadius: '2px',
              }}
            >
              <strong>Notice:</strong> This parcel has been flagged with an active citizen dispute.
            </div>
          )}
        </div>

        {/* Footer with actions */}
        <div className="record-footer">
          <span>Submitted: {formattedDate}</span>

          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {isOwner ? (
              <button
                type="button"
                className="btn btn-outline-rose"
                onClick={() => onDelete && onDelete(record)}
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                }}
              >
                Delete Declaration
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-outline-rose"
                onClick={() => setFlagModalOpen(true)}
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                }}
              >
                Flag Incorrect
              </button>
            )}
          </div>
        </div>
      </article>

      <FlagModal
        isOpen={flagModalOpen}
        onClose={() => setFlagModalOpen(false)}
        record={record}
        onFlagSuccess={() => {
          if (onRecordUpdated) onRecordUpdated();
        }}
      />
    </>
  );
}
