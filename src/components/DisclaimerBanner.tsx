'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';

export default function DisclaimerBanner() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="disclaimer-banner">
      <div className="disclaimer-inner">
        <div className="disclaimer-content">
          <span className="disclaimer-badge">Public Notice</span>
          <span>
            <strong>Citizen Self-Declared Directory:</strong> This portal is an independent community-populated database. It is not an official government record and is not connected to Bhu Bharati, Dharani, or the Registration & Stamps Department.
          </span>
        </div>
        <button
          onClick={() => setDismissed(true)}
          style={{
            background: 'none',
            border: 'none',
            color: '#78350f',
            cursor: 'pointer',
            padding: '2px 4px',
            fontSize: '14px',
            lineHeight: 1,
          }}
          title="Dismiss notice"
          aria-label="Dismiss banner"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
