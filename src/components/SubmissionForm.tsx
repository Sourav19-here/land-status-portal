'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/authContext';
import LocationSelector from './LocationSelector';
import FlagModal from './FlagModal';
import { LandRecord } from '@/types';

export default function SubmissionForm() {
  const router = useRouter();
  const { user } = useAuth();

  // Location fields
  const [districtId, setDistrictId] = useState('');
  const [mandalId, setMandalId] = useState('');
  const [villageId, setVillageId] = useState('');

  // Parcel fields
  const [surveyNumber, setSurveyNumber] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [extentAcres, setExtentAcres] = useState('');
  const [classification, setClassification] = useState('Agricultural');
  const [passbookNumber, setPassbookNumber] = useState('');
  const [khataNumber, setKhataNumber] = useState('');

  // Statuses
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [duplicateConflict, setDuplicateConflict] = useState<LandRecord | null>(null);
  const [successRecord, setSuccessRecord] = useState<LandRecord | null>(null);
  const [flagModalOpen, setFlagModalOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setDuplicateConflict(null);
    setSuccessRecord(null);

    if (!user) {
      setErrorMsg('You must be signed in to submit a land parcel declaration.');
      return;
    }

    if (!districtId || !mandalId || !villageId) {
      setErrorMsg('Please select District, Mandal, and Village.');
      return;
    }

    if (!surveyNumber.trim()) {
      setErrorMsg('Survey number is required.');
      return;
    }

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

    try {
      const res = await fetch('/api/land-records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          village_id: villageId,
          survey_number: surveyNumber.trim(),
          owner_name: ownerName.trim(),
          father_name: fatherName.trim() || undefined,
          extent_acres: extentNum,
          classification,
          passbook_number: passbookNumber.trim() || undefined,
          khata_number: khataNumber.trim() || undefined,
          user_id: user.id,
        }),
      });

      const json = await res.json();

      if (res.status === 409 && json.code === 'DUPLICATE_PARCEL') {
        setDuplicateConflict(json.existingRecord || null);
        setErrorMsg(
          "This parcel already has a submission — you can flag it if you believe it's incorrect."
        );
        return;
      }

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to submit land record');
      }

      setSuccessRecord(json.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during submission.');
    } finally {
      setLoading(false);
    }
  };

  // Success Confirmation View
  if (successRecord) {
    return (
      <div className="search-card-container" style={{ padding: '2rem' }}>
        <div
          style={{
            padding: '1rem',
            background: '#f0fdf4',
            border: '1px solid #86efac',
            color: '#166534',
            marginBottom: '1.25rem',
            borderRadius: '2px',
          }}
        >
          <strong style={{ fontSize: '14px', display: 'block', marginBottom: '4px' }}>
            ✓ Land Parcel Declaration Recorded
          </strong>
          <span>
            Parcel <strong>Sy. No. {successRecord.survey_number}</strong> ({successRecord.village_name || 'Village'}) has been saved under status <strong>Unverified (Self-Declared)</strong>.
          </span>
        </div>

        <div
          style={{
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            padding: '1rem',
            marginBottom: '1.5rem',
            borderRadius: '2px',
            fontSize: '12.5px',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Survey Number:</span>
            <strong>{successRecord.survey_number}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Owner:</span>
            <span>{successRecord.owner_name}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', borderBottom: '1px solid #e2e8f0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Extent:</span>
            <span>{successRecord.extent_acres} Acres</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
            <span style={{ color: 'var(--text-muted)' }}>Classification:</span>
            <span>{successRecord.classification}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setSuccessRecord(null);
              setSurveyNumber('');
              setOwnerName('');
              setFatherName('');
              setExtentAcres('');
              setPassbookNumber('');
              setKhataNumber('');
            }}
          >
            Submit Another Parcel
          </button>

          <Link href="/my-submissions" className="btn btn-primary">
            View in My Submissions →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="search-card-container">
        <div style={{ marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h2 style={{ fontSize: '1.15rem', color: 'var(--govt-navy)', marginBottom: '0.25rem' }}>
            Citizen Parcel Submission Form
          </h2>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Enter land parcel details. Submissions are public and searchable immediately.
          </p>
        </div>

        {/* Duplicate Conflict Warning */}
        {duplicateConflict && (
          <div
            style={{
              padding: '0.85rem 1rem',
              background: '#fffbeb',
              border: '1px solid #fcd34d',
              color: '#92400e',
              marginBottom: '1.25rem',
              borderRadius: '2px',
            }}
          >
            <strong>Duplicate Parcel Detected:</strong> A record already exists for Survey No.{' '}
            <strong>{duplicateConflict.survey_number}</strong> (declared by {duplicateConflict.owner_name}). Under v1 rules, records cannot be overwritten.
            <div style={{ marginTop: '0.65rem', display: 'flex', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-outline-rose"
                onClick={() => setFlagModalOpen(true)}
              >
                Flag Existing Record as Incorrect
              </button>
            </div>
          </div>
        )}

        {/* General Error Message */}
        {errorMsg && !duplicateConflict && (
          <div
            style={{
              padding: '0.65rem 1rem',
              background: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#991b1b',
              marginBottom: '1.25rem',
              borderRadius: '2px',
              fontSize: '12.5px',
            }}
          >
            {errorMsg}
          </div>
        )}

        {/* Section 1: Location */}
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--govt-navy)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          1. Location Hierarchy
        </div>
        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <LocationSelector
            selectedDistrictId={districtId}
            selectedMandalId={mandalId}
            selectedVillageId={villageId}
            required
            onChange={(loc) => {
              setDistrictId(loc.district_id || '');
              setMandalId(loc.mandal_id || '');
              setVillageId(loc.village_id || '');
            }}
          />
        </div>

        {/* Section 2: Parcel Specifics */}
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--govt-navy)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>
          2. Parcel Particulars
        </div>
        <div className="form-grid" style={{ marginBottom: '1.25rem' }}>
          <div className="form-group">
            <label className="form-label" htmlFor="input-survey-no">
              <span>Survey Number <span className="required">*</span></span>
            </label>
            <input
              id="input-survey-no"
              type="text"
              className="form-input"
              placeholder="e.g. 142/A"
              value={surveyNumber}
              onChange={(e) => setSurveyNumber(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-owner-name">
              <span>Pattadar / Owner Name <span className="required">*</span></span>
            </label>
            <input
              id="input-owner-name"
              type="text"
              className="form-input"
              placeholder="Full name as in record"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-father-name">
              <span>Father / Husband Name</span>
            </label>
            <input
              id="input-father-name"
              type="text"
              className="form-input"
              placeholder="e.g. K. Ramulu"
              value={fatherName}
              onChange={(e) => setFatherName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-extent">
              <span>Extent Area (Acres) <span className="required">*</span></span>
            </label>
            <input
              id="input-extent"
              type="number"
              step="0.01"
              min="0.01"
              className="form-input"
              placeholder="e.g. 2.45"
              value={extentAcres}
              onChange={(e) => setExtentAcres(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="select-classification">
              <span>Classification <span className="required">*</span></span>
            </label>
            <select
              id="select-classification"
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
            <label className="form-label" htmlFor="input-passbook">
              <span>Passbook Number</span>
            </label>
            <input
              id="input-passbook"
              type="text"
              className="form-input"
              placeholder="e.g. T0712004589"
              value={passbookNumber}
              onChange={(e) => setPassbookNumber(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="input-khata">
              <span>Khata Number</span>
            </label>
            <input
              id="input-khata"
              type="text"
              className="form-input"
              placeholder="e.g. KH-1042"
              value={khataNumber}
              onChange={(e) => setKhataNumber(e.target.value)}
            />
          </div>
        </div>

        {/* Declaration Confirmation Box */}
        <div
          style={{
            padding: '0.75rem',
            background: '#f8fafc',
            border: '1px solid var(--border-color)',
            marginBottom: '1.25rem',
            fontSize: '11.5px',
            color: 'var(--text-muted)',
            borderRadius: '2px',
          }}
        >
          <strong>Self-Declaration:</strong> By clicking Submit, you declare that the information provided is accurate to the best of your knowledge. This submission will be labeled as Unverified in the public directory.
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => router.push('/')}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Parcel Record'}
          </button>
        </div>
      </form>

      {duplicateConflict && (
        <FlagModal
          isOpen={flagModalOpen}
          onClose={() => setFlagModalOpen(false)}
          record={duplicateConflict}
          onFlagSuccess={() => {
            setDuplicateConflict(null);
            setErrorMsg(null);
          }}
        />
      )}
    </>
  );
}
