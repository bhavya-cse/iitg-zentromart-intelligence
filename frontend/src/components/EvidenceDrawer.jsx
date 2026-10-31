import React, { useState } from 'react';
import {
  FileText,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Clock,
  Sparkles,
  ExternalLink,
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
        marginTop: '0.85rem',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border-card)',
        backgroundColor: 'var(--light-bg)',
        overflow: 'hidden',
        transition: 'all var(--transition-fast)',
      }}
    >
      {/* Header Bar */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          width: '100%',
          padding: '0.7rem 1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: isExpanded ? '#FFFFFF' : 'var(--surface-subtle)',
          borderBottom: isExpanded ? '1px solid var(--border-card)' : 'none',
          cursor: 'pointer',
          border: 'none',
          outline: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={14} color="#723ECF" />
          <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
            Grounded Policy Evidence ({sources.length} {sources.length === 1 ? 'source' : 'sources'} cited)
          </span>
          <span className="badge badge-violet" style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
            Verified RAG v4
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--muted-text)', fontSize: '0.76rem', fontWeight: 600 }}>
          <span>{isExpanded ? 'Hide Evidence' : 'Inspect Policy Citations'}</span>
          {isExpanded ? <ChevronUp size={15} color="#723ECF" /> : <ChevronDown size={15} />}
        </div>
      </button>

      {/* Expanded Evidence List & Excerpt Viewer */}
      {isExpanded && (
        <div style={{ padding: '1rem', backgroundColor: '#FFFFFF' }}>
          {/* Source Tabs */}
          <div
            style={{
              display: 'flex',
              gap: '0.5rem',
              overflowX: 'auto',
              paddingBottom: '0.75rem',
              borderBottom: '1px solid var(--border-light)',
              marginBottom: '0.85rem',
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
                    gap: '0.5rem',
                    padding: '0.4rem 0.85rem',
                    borderRadius: 'var(--radius-xs)',
                    backgroundColor: isSelected ? 'var(--primary-indigo)' : 'var(--light-bg)',
                    color: isSelected ? '#FFFFFF' : 'var(--primary-indigo)',
                    border: isSelected ? '1px solid var(--primary-indigo)' : '1px solid var(--border-light)',
                    fontSize: '0.78rem',
                    fontWeight: isSelected ? 700 : 600,
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <FileText size={13} color={isSelected ? '#EDE7FA' : '#77758A'} />
                  <span>{src.doc_name || src.doc_id || `Policy ${idx + 1}`}</span>
                  {src.section_id && (
                    <span
                      style={{
                        fontSize: '0.66rem',
                        fontFamily: 'var(--font-mono)',
                        opacity: isSelected ? 0.9 : 0.7,
                      }}
                    >
                      §{src.section_id}
                    </span>
                  )}
                  {isLatest && (
                    <span
                      style={{
                        width: '5.5px',
                        height: '5.5px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--success)',
                      }}
                      title="Active Precedence Policy"
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
                backgroundColor: 'var(--light-bg)',
                borderRadius: 'var(--radius-xs)',
                border: '1px solid var(--border-card)',
                padding: '1rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '0.65rem',
                  fontSize: '0.78rem',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary-indigo)' }}>
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
                        fontSize: '0.72rem',
                      }}
                    >
                      <Clock size={11} />
                      Effective: {sources[selectedSource].effective_date}
                    </span>
                  )}
                </div>

                {sources[selectedSource].relevance_score !== undefined && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-violet)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                    Match Confidence: {Math.round(sources[selectedSource].relevance_score * 100)}%
                  </span>
                )}
              </div>

              {/* Excerpt Text */}
              <div
                style={{
                  fontFamily: 'var(--font-body)',
                  fontSize: '0.84rem',
                  color: 'var(--body-text)',
                  backgroundColor: '#FFFFFF',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-xs)',
                  borderLeft: '3px solid var(--accent-violet)',
                  lineHeight: 1.6,
                  maxHeight: '200px',
                  overflowY: 'auto',
                }}
              >
                {sources[selectedSource].text || sources[selectedSource].chunk_text || sources[selectedSource].excerpt}
              </div>

              {sources[selectedSource].precedence_note && (
                <div
                  style={{
                    marginTop: '0.5rem',
                    fontSize: '0.72rem',
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
