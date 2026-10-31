import React from 'react';
import { AlertCircle, FolderPlus, ArrowRight } from 'lucide-react';

export function EmptyState({
  icon: Icon = AlertCircle,
  title = 'No records found',
  description = 'There are no active records in this view.',
  actionLabel = null,
  onAction = null,
  secondaryAction = null,
}) {
  return (
    <div
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 'var(--radius-md)',
        border: '1px dashed var(--border-medium)',
        maxWidth: '540px',
        margin: '2rem auto',
      }}
    >
      <div
        style={{
          width: '52px',
          height: '52px',
          borderRadius: '50%',
          backgroundColor: 'var(--soft-violet-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary-accent)',
          marginBottom: '1rem',
          border: '1px solid var(--soft-violet)',
        }}
      >
        <Icon size={24} />
      </div>

      <h3
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--primary-indigo)',
          marginBottom: '0.45rem',
        }}
      >
        {title}
      </h3>

      <p
        style={{
          fontSize: '0.88rem',
          color: 'var(--muted-text)',
          maxWidth: '420px',
          lineHeight: 1.5,
          marginBottom: actionLabel ? '1.5rem' : '0',
        }}
      >
        {description}
      </p>

      {actionLabel && (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
