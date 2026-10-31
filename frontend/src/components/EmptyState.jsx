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
      className="zm-card animate-fade-in"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-xs)',
        maxWidth: '560px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--soft-violet)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--accent-violet)',
          marginBottom: '1.25rem',
          border: '1px solid rgba(114, 62, 207, 0.2)',
        }}
      >
        <Icon size={26} />
      </div>

      <h3
        style={{
          fontSize: '1.22rem',
          fontWeight: 800,
          color: 'var(--primary-indigo)',
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
          <button onClick={onAction} className="btn-primary">
            <span>{actionLabel}</span>
            <ArrowRight size={15} />
          </button>
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
