import React from 'react';
import { AlertCircle, ArrowRight } from 'lucide-react';

export function EmptyState({
  icon: Icon = AlertCircle,
  title = 'No records available',
  description = 'There are no active records in this view.',
  actionLabel = null,
  onAction = null,
  secondaryAction = null,
}) {
  return (
    <div
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-xs)',
        maxWidth: '560px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '8px',
          backgroundColor: 'var(--accent-blue-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-blue)',
          marginBottom: '1.25rem',
          border: '1px solid rgba(0, 102, 255, 0.2)',
        }}
      >
        <Icon size={26} />
      </div>

      <h3
        style={{
          fontSize: '1.22rem',
          fontWeight: 800,
          color: 'var(--corp-navy)',
          marginBottom: '0.45rem',
          letterSpacing: '-0.02em',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.88rem',
          color: 'var(--muted-text)',
          maxWidth: '440px',
          lineHeight: 1.6,
          marginBottom: actionLabel ? '1.75rem' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && (
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <button onClick={onAction} className="btn-blue">
            <span>{actionLabel}</span>
            <ArrowRight size={15} />
          </button>
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
