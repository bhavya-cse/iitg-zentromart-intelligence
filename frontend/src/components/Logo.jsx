import React from 'react';

export function Logo({
  collapsed = false,
  size = 'md',
  theme = 'light',
  className = '',
  showTag = true,
}) {
  const iconDimensions = {
    sm: 28,
    md: 36,
    lg: 44,
  }[size] || 36;

  const isDark = theme === 'dark';

  return (
    <div
      className={`select-none ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: collapsed ? '0' : '0.85rem',
        textDecoration: 'none',
      }}
    >
      {/* Precision Geometric Z-Prism & Connected Intelligence Symbol */}
      <div
        style={{
          width: `${iconDimensions}px`,
          height: `${iconDimensions}px`,
          borderRadius: size === 'sm' ? '6px' : '9px',
          background: 'linear-gradient(135deg, #17143F 0%, #29245B 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px solid rgba(114, 62, 207, 0.28)',
          boxShadow: '0 3px 10px rgba(23, 20, 63, 0.16), 0 0 0 1px rgba(255, 255, 255, 0.06) inset',
          flexShrink: 0,
          position: 'relative',
          transition: 'transform var(--transition-fast)',
        }}
        title="ZentroMart Intelligence"
      >
        <svg
          width={Math.round(iconDimensions * 0.65)}
          height={Math.round(iconDimensions * 0.65)}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Subtle geometric grid background */}
          <path
            d="M16 2L29 9.5V22.5L16 30L3 22.5V9.5L16 2Z"
            stroke="#723ECF"
            strokeWidth="1.2"
            strokeOpacity="0.4"
          />
          {/* Isometric faceted Z-path of intelligence */}
          <path
            d="M9 10.5H23L11 21.5H23"
            stroke="#EDE7FA"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Neural connectivity nexus nodes */}
          <circle cx="23" cy="10.5" r="2.2" fill="#723ECF" stroke="#FFFFFF" strokeWidth="1" />
          <circle cx="9" cy="10.5" r="1.8" fill="#EDE7FA" />
          <circle cx="11" cy="21.5" r="1.8" fill="#EDE7FA" />
          <circle cx="23" cy="21.5" r="2.2" fill="#723ECF" stroke="#FFFFFF" strokeWidth="1" />
          {/* Central core node */}
          <circle cx="17" cy="16" r="1.5" fill="#723ECF" />
        </svg>
      </div>

      {!collapsed && (
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: size === 'lg' ? '1.45rem' : '1.25rem',
                fontWeight: 800,
                color: isDark ? '#FFFFFF' : 'var(--primary-indigo)',
                letterSpacing: '-0.028em',
              }}
            >
              ZentroMart
            </span>
            {showTag && (
              <span
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.62rem',
                  fontWeight: 700,
                  color: 'var(--accent-violet)',
                  background: 'var(--soft-violet)',
                  padding: '0.12rem 0.42rem',
                  borderRadius: 'var(--radius-xs)',
                  border: '1px solid rgba(114, 62, 207, 0.22)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                AI
              </span>
            )}
          </div>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              color: isDark ? 'rgba(255, 255, 255, 0.6)' : 'var(--muted-text)',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              marginTop: '1px',
            }}
          >
            Intelligence Platform
          </span>
        </div>
      )}
    </div>
  );
}
