import React from 'react';

export function Logo({ collapsed = false, className = '' }) {
  return (
    <div
      className={`select-none ${className}`}
      style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}
    >
      {/* Precision Geometric Corporate Identity */}
      <div
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '6px',
          background: 'linear-gradient(135deg, #00122E 0%, #0A192F 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid #E2E8F0',
          boxShadow: '0 2px 8px rgba(0, 18, 46, 0.12)',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <svg width="22" height="22" viewBox="0 0 32 32" fill="none">
          <rect
            x="4"
            y="4"
            width="24"
            height="24"
            rx="4"
            stroke="#0066FF"
            strokeWidth="2"
          />
          <path
            d="M9 11H23L11 21H23"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="21" cy="11" r="2" fill="#0066FF" />
        </svg>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.22rem',
                fontWeight: 800,
                color: 'var(--corp-navy)',
                letterSpacing: '-0.025em',
              }}
            >
              ZentroMart
            </span>
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.64rem',
                fontWeight: 700,
                color: '#0066FF',
                background: '#E8F1FF',
                padding: '0.12rem 0.4rem',
                borderRadius: '3px',
                border: '1px solid rgba(0, 102, 255, 0.2)',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
              }}
            >
              ENTERPRISE
            </span>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--muted-text)',
              fontWeight: 500,
              letterSpacing: '0.02em',
            }}
          >
            Intelligence Platform
          </span>
        </div>
      )}
    </div>
  );
}
