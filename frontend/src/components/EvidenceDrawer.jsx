import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ShieldCheck,
  Clock,
  Layers,
  Sparkles,
} from 'lucide-react';

export function EvidenceDrawer({ sources = [], className = '' }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedSource, setSelectedSource] = useState(0);

  if (!sources || sources.length === 0) {
    return null;
  }

  return (
    <div
      className={className}
      style={{
        marginTop: '0.75rem',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border-light)',
        backgroundColor: 'var(--light-bg)',
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Header bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '0.65rem 0.9rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isExpanded ? 'var(--soft-violet-subtle)' : '#FFFFFF',
          borderBottom: isExpanded ? '1px solid var(--border-light)' : 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sparkles size={14} color="#723ECF" />
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
            Grounded Policy Evidence ({sources.length} {sources.length === 1 ? 'source' : 'sources'} cited)
          </span>
          <span
            style={{
              fontSize: '0.68rem',
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--success-subtle)',
              color: 'var(--success)',
              fontWeight: 600,
            }}
          >
            Verified RAG
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted-text)', fontSize: '0.75rem' }}>
          <span>{isExpanded ? 'Collapse' : 'Inspect Evidence'}</span>
          {isExpanded ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Expanded evidence list & excerpt viewer */}
      {isExpanded && (
        <div style={{ padding: '0.9rem' }}>
          {/* Source Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.65rem',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '0.75rem',
            }}
          >
            {sources.map((src, idx) => {
              const isSelected = selectedSource === idx;
              const isLatest = src.is_active_policy || src.doc_id?.includes('v4');

              return (
                <button
                  key={idx}
                  onClick={() => setSelectedSource(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.45rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: isSelected ? 'var(--primary-indigo)' : '#FFFFFF',
                    color: isSelected ? '#FFFFFF' : 'var(--body-text)',
                    border: isSelected ? '1px solid var(--primary-indigo)' : '1px solid var(--border-light)',
                    fontSize: '0.76rem',
                    fontWeight: isSelected ? 600 : 500,
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? 'var(--shadow-xs)' : 'none',
                  }}
                >
                  <FileText size={13} color={isSelected ? '#9D68FF' : '#77758A'} />
                  <span>{src.doc_name || src.doc_id || `Doc ${idx + 1}`}</span>
                  {src.section_id && (
                    <span
                      style={{
                        fontSize: '0.65rem',
                        opacity: 0.8,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      §{src.section_id}
                    </span>
                  )}
                  {isLatest && (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        backgroundColor: '#21865B',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Source Details */}
          {sources[selectedSource] && (
            <div
              style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-light)',
                padding: '0.85rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.5rem',
                  fontSize: '0.75rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary-indigo)' }}>
                    {sources[selectedSource].title || sources[selectedSource].doc_name}
                  </span>
                  {sources[selectedSource].category && (
                    <span className="badge badge-violet">
                      {sources[selectedSource].category}
                    </span>
                  )}
                  {sources[selectedSource].effective_date && (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: 'var(--muted-text)',
                        fontSize: '0.7rem',
                      }}
                    >
                      <Clock size={11} />
                      Eff: {sources[selectedSource].effective_date}
                    </span>
                  )}
                </div>

                {sources[selectedSource].relevance_score !== undefined && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontFamily: 'var(--font-mono)' }}>
                    Match: {Math.round(sources[selectedSource].relevance_score * 100)}%
                  </span>
                )}
              </div>

              {/* Excerpt text */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.82rem',
                  color: 'var(--body-text)',
                  backgroundColor: 'var(--light-bg)',
                  padding: '0.65rem 0.8rem',
                  borderRadius: 'var(--radius-xs)',
                  borderLeft: '3px solid var(--primary-accent)',
                  lineHeight: 1.5,
                  maxHeight: '180px',
                  overflowY: 'auto',
                }}
              >
                {sources[selectedSource].text || sources[selectedSource].chunk_text || sources[selectedSource].excerpt}
              </div>

              {sources[selectedSource].precedence_note && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.7rem',
                    color: 'var(--muted-text)',
                    fontStyle: 'italic',
                  }}
                >
                  * {sources[selectedSource].precedence_note}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
