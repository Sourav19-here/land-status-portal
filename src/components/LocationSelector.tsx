'use client';

import React, { useState, useEffect } from 'react';
import { District, Mandal, Village } from '@/types';

interface LocationSelectorProps {
  selectedDistrictId?: string;
  selectedMandalId?: string;
  selectedVillageId?: string;
  onChange: (location: {
    district_id?: string;
    mandal_id?: string;
    village_id?: string;
    district_name?: string;
    mandal_name?: string;
    village_name?: string;
  }) => void;
  required?: boolean;
  disabled?: boolean;
}

export default function LocationSelector({
  selectedDistrictId = '',
  selectedMandalId = '',
  selectedVillageId = '',
  onChange,
  required = false,
  disabled = false,
}: LocationSelectorProps) {
  const [districts, setDistricts] = useState<District[]>([]);
  const [mandals, setMandals] = useState<Mandal[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMandals, setLoadingMandals] = useState(false);
  const [loadingVillages, setLoadingVillages] = useState(false);

  // 1. Fetch all districts on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingDistricts(true);
    fetch('/api/districts')
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setDistricts(json.data || []);
        }
      })
      .catch((err) => console.error('Failed to load districts:', err))
      .finally(() => {
        if (isMounted) setLoadingDistricts(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fetch mandals when selectedDistrictId changes
  useEffect(() => {
    if (!selectedDistrictId) {
      setMandals([]);
      setVillages([]);
      return;
    }

    let isMounted = true;
    setLoadingMandals(true);
    fetch(`/api/mandals?district_id=${encodeURIComponent(selectedDistrictId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setMandals(json.data || []);
        }
      })
      .catch((err) => console.error('Failed to load mandals:', err))
      .finally(() => {
        if (isMounted) setLoadingMandals(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedDistrictId]);

  // 3. Fetch villages when selectedMandalId changes
  useEffect(() => {
    if (!selectedMandalId) {
      setVillages([]);
      return;
    }

    let isMounted = true;
    setLoadingVillages(true);
    fetch(`/api/villages?mandal_id=${encodeURIComponent(selectedMandalId)}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setVillages(json.data || []);
        }
      })
      .catch((err) => console.error('Failed to load villages:', err))
      .finally(() => {
        if (isMounted) setLoadingVillages(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMandalId]);

  const handleDistrictChange = (dId: string) => {
    const district = districts.find((d) => d.id === dId);
    onChange({
      district_id: dId || undefined,
      mandal_id: undefined,
      village_id: undefined,
      district_name: district?.name,
      mandal_name: undefined,
      village_name: undefined,
    });
  };

  const handleMandalChange = (mId: string) => {
    const district = districts.find((d) => d.id === selectedDistrictId);
    const mandal = mandals.find((m) => m.id === mId);
    onChange({
      district_id: selectedDistrictId || undefined,
      mandal_id: mId || undefined,
      village_id: undefined,
      district_name: district?.name,
      mandal_name: mandal?.name,
      village_name: undefined,
    });
  };

  const handleVillageChange = (vId: string) => {
    const district = districts.find((d) => d.id === selectedDistrictId);
    const mandal = mandals.find((m) => m.id === selectedMandalId);
    const village = villages.find((v) => v.id === vId);
    onChange({
      district_id: selectedDistrictId || undefined,
      mandal_id: selectedMandalId || undefined,
      village_id: vId || undefined,
      district_name: district?.name,
      mandal_name: mandal?.name,
      village_name: village?.name,
    });
  };

  return (
    <>
      {/* District Dropdown */}
      <div className="form-group">
        <label className="form-label" htmlFor="select-district">
          <span>District {required && <span className="required">*</span>}</span>
          {loadingDistricts && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loading...</span>}
        </label>
        <select
          id="select-district"
          className="form-select"
          value={selectedDistrictId}
          onChange={(e) => handleDistrictChange(e.target.value)}
          disabled={disabled || loadingDistricts}
          required={required}
        >
          <option value="">-- Select District --</option>
          {districts.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name} {d.code ? `(${d.code})` : ''}
            </option>
          ))}
        </select>
      </div>

      {/* Mandal Dropdown */}
      <div className="form-group">
        <label className="form-label" htmlFor="select-mandal">
          <span>Mandal {required && <span className="required">*</span>}</span>
          {loadingMandals && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loading...</span>}
        </label>
        <select
          id="select-mandal"
          className="form-select"
          value={selectedMandalId}
          onChange={(e) => handleMandalChange(e.target.value)}
          disabled={disabled || !selectedDistrictId || loadingMandals}
          required={required}
        >
          <option value="">
            {!selectedDistrictId ? '-- Select District First --' : '-- Select Mandal --'}
          </option>
          {mandals.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      {/* Village Dropdown */}
      <div className="form-group">
        <label className="form-label" htmlFor="select-village">
          <span>Village {required && <span className="required">*</span>}</span>
          {loadingVillages && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Loading...</span>}
        </label>
        <select
          id="select-village"
          className="form-select"
          value={selectedVillageId}
          onChange={(e) => handleVillageChange(e.target.value)}
          disabled={disabled || !selectedMandalId || loadingVillages}
          required={required}
        >
          <option value="">
            {!selectedMandalId ? '-- Select Mandal First --' : '-- Select Village --'}
          </option>
          {villages.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
    </>
  );
}
