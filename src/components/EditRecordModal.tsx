'use client';

import React, { useState, useEffect } from 'react';
import { LandRecord } from '@/types';
import { useAuth } from '@/lib/authContext';

interface EditRecordModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: LandRecord | null;
  onSuccess: (updated: LandRecord) => void;
}

export default function EditRecordModal({
  isOpen,
  onClose,
  record,
  onSuccess,
}: EditRecordModalProps) {
  const { user } = useAuth();

  const [ownerName, setOwnerName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [extentAcres, setExtentAcres] = useState('');
  const [classification, setClassification] = useState('Agricultural');
  const [passbookNumber, setPassbookNumber] = useState('');
  const [khataNumber, setKhataNumber] = useState('');

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (record) {
      setOwnerName(record.owner_name || '');
      setFatherName(record.father_name || '');
      setExtentAcres(record.extent_acres ? record.extent_acres.toString() : '');
      setClassification(record.classification || 'Agricultural');
      setPassbookNumber(record.passbook_number || '');
      setKhataNumber(record.khata_number || '');
    }
  }, [record]);

  if (!isOpen || !record) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!ownerName.trim()) {
      setErrorMsg('Owner/Pattadar name is required.');
      return;
    }

    const extentNum = parseFloat(extentAcres);
    if (isNaN(extentNum) || extentNum <= 0) {
      setErrorMsg('Extent area must be a valid positive number in acres.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`/api/land-records/${record.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          user_id: user.id,
          updates: {
            owner_name: ownerName.trim(),
            father_name: fatherName.trim() || undefined,
            extent_acres: extentNum,
            classification,
            passbook_number: passbookNumber.trim() || undefined,
            khata_number: khataNumber.trim() || undefined,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to update record');
      }

      onSuccess(json.data);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred while updating the record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 style={{ fontSize: '14px', color: 'var(--govt-navy)' }}>
            Edit Land Parcel Declaration
          </h3>
          <button className="modal-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Locked Parcel Identifiers */}
        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            padding: '0.65rem',
            borderRadius: '2px',
            marginBottom: '1rem',
            fontSize: '12px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
            <span style={{ color: 'var(--text-muted)' }}>Survey Number (Locked):</span>
            <strong>{record.survey_number}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: 'var(--text-muted)' }}>Location (Locked):</span>
            <span>
              {record.village_name || 'Village'}, {record.mandal_name || 'Mandal'}, {record.district_name || 'District'}
            </span>
          </div>
        </div>

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

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-owner-name">
              <span>Owner / Pattadar Name <span className="required">*</span></span>
            </label>
            <input
              id="edit-owner-name"
              type="text"
              className="form-input"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-father-name">
              <span>Father / Husband / Guardian Name</span>
            </label>
            <input
              id="edit-father-name"
              type="text"
              className="form-input"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-extent">
              <span>Extent Area (Acres) <span className="required">*</span></span>
            </label>
            <input
              id="edit-extent"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              value={extentAcres}
              onChange={(e) => setExtentAcres(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-classification">
              <span>Classification <span className="required">*</span></span>
            </label>
            <select
              id="edit-classification"
              className="form-select"
              value={classification}
              onChange={(e) => setClassification(e.target.value)}
            >
              <option value="Agricultural">Agricultural</option>
              <option value="Residential">Residential</option>
              <option value="Commercial">Commercial</option>
              <option value="Industrial">Industrial</option>
              <option value="Mixed Use">Mixed Use</option>
              <option value="Government / Assigned">Government / Assigned</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-passbook">
              <span>Passbook Number</span>
            </label>
            <input
              id="edit-passbook"
              type="text"
              className="form-input"
              value={passbookNumber}
              onChange={(e) => setPassbookNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-khata">
              <span>Khata Number</span>
            </label>
            <input
              id="edit-khata"
              type="text"
              className="form-input"
              value={khataNumber}
              onChange={(e) => setKhataNumber(e.target.value)}
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
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
