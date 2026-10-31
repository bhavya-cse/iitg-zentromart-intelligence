import React from 'react';

export function Logo({ collapsed = false, className = '' }) {
  return (
    <div className={`flex items-center gap-3 select-none ${className}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      {/* Precision Geometric Hexagonal Core */}
      <div
        style={{
          width: '38px',
          height: '38px',
          borderRadius: '9px',
          background: 'linear-gradient(135deg, #17143F 0%, #29245B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(157, 104, 255, 0.3)',
          boxShadow: '0 4px 12px rgba(16, 14, 45, 0.45)',
          flexShrink: 0,
          position: 'relative',
        }}
      >
        <svg width="24" height="24" viewBox="0 0 32 32" fill="none">
          <polygon
            points="16,3 28,10 28,22 16,29 4,22 4,10"
            stroke="#9D68FF"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <polygon
            points="16,8 24,12.5 24,19.5 16,24 8,19.5 8,12.5"
            fill="#EDE7FA"
            fillOpacity="0.12"
            stroke="#EDE7FA"
            strokeWidth="1.2"
          />
          <circle cx="16" cy="16" r="3" fill="#723ECF" />
          <circle cx="16" cy="16" r="1.2" fill="#FFFFFF" />
        </svg>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              ZentroMart
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.62rem',
                fontWeight: 600,
                color: '#9D68FF',
                background: 'rgba(114, 62, 207, 0.25)',
                padding: '0.12rem 0.35rem',
                borderRadius: '4px',
                border: '1px solid rgba(157, 104, 255, 0.3)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              AI OPS
            </span>
          </div>
          <span
            style={{
              fontSize: '0.72rem',
              color: 'rgba(237, 231, 250, 0.65)',
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
