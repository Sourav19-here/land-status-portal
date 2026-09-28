'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { LandRecord, VerificationStatus } from '@/types';
import LocationSelector from './LocationSelector';
import RecordCard from './RecordCard';

export default function SearchPortal() {
  const [activeTab, setActiveTab] = useState<'location' | 'owner'>('location');

  // Location search inputs
  const [districtId, setDistrictId] = useState('');
  const [mandalId, setMandalId] = useState('');
  const [villageId, setVillageId] = useState('');
  const [surveyNumber, setSurveyNumber] = useState('');

  // Owner / Passbook search inputs
  const [ownerOrPassbookQuery, setOwnerOrPassbookQuery] = useState('');

  // Extensible Filters
  const [classificationFilter, setClassificationFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<VerificationStatus | ''>('');
  const [extentMin, setExtentMin] = useState('');
  const [extentMax, setExtentMax] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Results & Loading
  const [records, setRecords] = useState<LandRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Perform Search
  const executeSearch = useCallback(async () => {
    setLoading(true);
    setErrorMsg(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();

      if (activeTab === 'location') {
        if (districtId) params.append('district_id', districtId);
        if (mandalId) params.append('mandal_id', mandalId);
        if (villageId) params.append('village_id', villageId);
        if (surveyNumber.trim()) params.append('survey_number', surveyNumber.trim());
      } else {
        const q = ownerOrPassbookQuery.trim();
        if (q) {
          params.append('owner_name', q);
          params.append('passbook_number', q);
        }
      }

      // Append Extensible Filters
      if (classificationFilter) params.append('classification', classificationFilter);
      if (verificationFilter) params.append('verification_status', verificationFilter);
      if (extentMin) params.append('extent_min', extentMin);
      if (extentMax) params.append('extent_max', extentMax);

      const res = await fetch(`/api/land-status?${params.toString()}`);
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to search records');
      }

      setRecords(json.data || []);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while querying land registry.');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  }, [
    activeTab,
    districtId,
    mandalId,
    villageId,
    surveyNumber,
    ownerOrPassbookQuery,
    classificationFilter,
    verificationFilter,
    extentMin,
    extentMax,
  ]);

  useEffect(() => {
    executeSearch();
  }, []);

  const handleResetFilters = () => {
    setDistrictId('');
    setMandalId('');
    setVillageId('');
    setSurveyNumber('');
    setOwnerOrPassbookQuery('');
    setClassificationFilter('');
    setVerificationFilter('');
    setExtentMin('');
    setExtentMax('');
  };

  const activeFilterCount =
    (classificationFilter ? 1 : 0) +
    (verificationFilter ? 1 : 0) +
    (extentMin || extentMax ? 1 : 0);

  return (
    <div>
      {/* Flat White Container */}
      <div className="search-card-container">
        {/* Government Portal Tab Header */}
        <div className="search-mode-tabs" role="tablist">
          <button
            role="tab"
            aria-selected={activeTab === 'location'}
            className={`search-mode-tab ${activeTab === 'location' ? 'active' : ''}`}
            onClick={() => setActiveTab('location')}
          >
            Search by Location (District / Mandal / Village)
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'owner'}
            className={`search-mode-tab ${activeTab === 'owner' ? 'active' : ''}`}
            onClick={() => setActiveTab('owner')}
          >
            Search by Owner Name / Passbook No.
          </button>
        </div>

        {/* Tab 1: By Location */}
        {activeTab === 'location' && (
          <div className="form-grid" style={{ marginBottom: '1rem' }}>
            <LocationSelector
              selectedDistrictId={districtId}
              selectedMandalId={mandalId}
              selectedVillageId={villageId}
              onChange={(loc) => {
                setDistrictId(loc.district_id || '');
                setMandalId(loc.mandal_id || '');
                setVillageId(loc.village_id || '');
              }}
            />

            <div className="form-group">
              <label className="form-label" htmlFor="survey-number-input">
                <span>Survey Number</span>
              </label>
              <input
                id="survey-number-input"
                type="text"
                className="form-input"
                placeholder="e.g. 142/A or 208"
                value={surveyNumber}
                onChange={(e) => setSurveyNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              />
            </div>
          </div>
        )}

        {/* Tab 2: By Owner / Passbook */}
        {activeTab === 'owner' && (
          <div style={{ marginBottom: '1rem' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="owner-passbook-query">
                <span>Owner / Pattadar Name or Passbook Number</span>
              </label>
              <input
                id="owner-passbook-query"
                type="text"
                className="form-input"
                placeholder="Enter Pattadar / Owner name (e.g. Venkataiah) or Passbook ID (e.g. T0712004589)"
                value={ownerOrPassbookQuery}
                onChange={(e) => setOwnerOrPassbookQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch()}
              />
            </div>
          </div>
        )}

        {/* Action Row & Extensible Filter Toggle */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.75rem',
            paddingTop: '0.75rem',
            borderTop: '1px solid var(--border-light)',
          }}
        >
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => setFiltersOpen(!filtersOpen)}
            style={{ fontSize: '12px' }}
          >
            <span>Additional Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}</span>
            <span>{filtersOpen ? '▲' : '▼'}</span>
          </button>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleResetFilters}
            >
              Reset
            </button>

            <button
              type="button"
              className="btn btn-primary"
              onClick={executeSearch}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner" />
                  <span>Searching...</span>
                </>
              ) : (
                <span>Fetch Records</span>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Filter Panel */}
        {filtersOpen && (
          <div
            style={{
              marginTop: '0.85rem',
              padding: '0.85rem',
              background: '#f8fafc',
              border: '1px solid var(--border-color)',
              borderRadius: '2px',
            }}
          >
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Classification</label>
                <select
                  className="form-select"
                  value={classificationFilter}
                  onChange={(e) => setClassificationFilter(e.target.value)}
                >
                  <option value="">All Classifications</option>
                  <option value="Agricultural">Agricultural</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
                  <option value="Mixed Use">Mixed Use</option>
                  <option value="Government / Assigned">Government / Assigned</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Verification Status</label>
                <select
                  className="form-select"
                  value={verificationFilter}
                  onChange={(e) => setVerificationFilter(e.target.value as VerificationStatus | '')}
                >
                  <option value="">All Statuses</option>
                  <option value="unverified">Unverified (Self-Declared)</option>
                  <option value="flagged">Flagged Dispute</option>
                  <option value="verified">Verified Record</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Min Extent (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 1.0"
                  value={extentMin}
                  onChange={(e) => setExtentMin(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Max Extent (Acres)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="form-input"
                  placeholder="e.g. 10.0"
                  value={extentMax}
                  onChange={(e) => setExtentMax(e.target.value)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-count">
          {loading ? (
            <span>Querying registry...</span>
          ) : (
            <span>
              Total Records Found: <strong>{records.length}</strong>
            </span>
          )}
        </div>

        <Link href="/submit" className="btn btn-secondary" style={{ fontSize: '12px' }}>
          + Submit New Parcel
        </Link>
      </div>

      {/* Error state */}
      {errorMsg && (
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
      )}

      {/* Results Grid or Empty State */}
      {records.length > 0 ? (
        <div className="results-grid">
          {records.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onRecordUpdated={executeSearch}
            />
          ))}
        </div>
      ) : (
        !loading &&
        hasSearched && (
          <div className="empty-state">
            <h3 style={{ fontSize: '14px', marginBottom: '0.35rem', color: 'var(--text-main)' }}>
              No Land Parcel Records Found
            </h3>
            <p style={{ maxWidth: '440px', margin: '0 auto 1rem', color: 'var(--text-muted)' }}>
              No self-declared submissions currently match the query criteria.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetFilters}
              >
                Clear Criteria
              </button>
              <Link href="/submit" className="btn btn-primary">
                Submit Parcel Details
              </Link>
            </div>
          </div>
        )
      )}
    </div>
  );
}
