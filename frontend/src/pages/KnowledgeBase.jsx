import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  RefreshCw,
  FileText,
  Clock,
  Layers,
  ShieldCheck,
  AlertTriangle,
  ChevronRight,
  Filter,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';

export function KnowledgeBase() {
  const [kbData, setKbData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reindexing, setReindexing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeDoc, setActiveDoc] = useState(null);

  const fetchKnowledgeBase = async () => {
    try {
      setLoading(true);
      const res = await api.getKnowledgeBase();
      setKbData(res);
      if (res.documents && res.documents.length > 0 && !activeDoc) {
        setActiveDoc(res.documents[0]);
      }
    } catch (err) {
      console.error('Failed to load KB:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKnowledgeBase();
  }, []);

  const handleReindex = async () => {
    try {
      setReindexing(true);
      await api.reindexKnowledgeBase();
      await fetchKnowledgeBase();
    } catch (err) {
      alert(`Reindexing failed: ${err.message}`);
    } finally {
      setReindexing(false);
    }
  };

  const documents = kbData?.documents || [];
  const categories = ['all', ...new Set(documents.map((d) => d.category).filter(Boolean))];

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.id && doc.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (doc.summary && doc.summary.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="page-body">
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '1.75rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-violet">Policy Grounding Core</span>
            <span className="badge badge-success">
              {kbData?.total_chunks ? `${kbData.total_chunks} Chunks Indexed` : 'Vector Indexed'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            Knowledge Base
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.94rem' }}>
            Authoritative documents, section IDs, chunk indices, and policy precedence rules.
          </p>
        </div>

        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="btn-secondary"
          title="Re-chunk and re-index all Markdown policies into the vector store"
        >
          <RefreshCw size={15} className={reindexing ? 'animate-spin' : ''} />
          <span>{reindexing ? 'Re-indexing Knowledge...' : 'Refresh Knowledge Index'}</span>
        </button>
      </div>

      {/* Policy Precedence Architecture Notice */}
      <div
        className="zm-card"
        style={{
          padding: '1rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #723ECF',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} color="#723ECF" />
          <div style={{ fontSize: '0.82rem', color: 'var(--body-text)' }}>
            <strong>Precedence Chain:</strong>{' '}
            <span style={{ color: 'var(--primary-indigo)', fontWeight: 600 }}>Current Policies</span> →{' '}
            <span>Agent Guides</span> → <span>Help Documents</span> → <span>FAQs</span> →{' '}
            <span style={{ color: 'var(--muted-text)' }}>Marketing Documents</span>.
          </div>
        </div>

        <div style={{ fontSize: '0.74rem', color: '#C94C59', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
          <AlertTriangle size={14} />
          <span>pol_returns_v4.md overrides superseded v3</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '260px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            color="#77758A"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by ID, policy section, or keywords..."
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem 0.55rem 2.25rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                textTransform: 'capitalize',
                backgroundColor: selectedCategory === cat ? 'var(--primary-indigo)' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--body-text)',
                border: selectedCategory === cat ? '1px solid var(--primary-indigo)' : '1px solid var(--border-light)',
              }}
            >
              {cat === 'all' ? 'All Policies' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Split View: Document Directory on Left, Detailed Content Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.5rem' }}>
        {/* Document List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredDocs.length > 0 ? (
            filteredDocs.map((doc) => {
              const isSelected = activeDoc?.id === doc.id;
              const isSuperseded = doc.status === 'superseded' || doc.id.includes('superseded');

              return (
                <div
                  key={doc.id}
                  onClick={() => setActiveDoc(doc)}
                  className="zm-card"
                  style={{
                    padding: '1rem 1.15rem',
                    cursor: 'pointer',
                    borderColor: isSelected ? '#723ECF' : 'var(--border-light)',
                    backgroundColor: isSelected ? 'var(--soft-violet-subtle)' : '#FFFFFF',
                    boxShadow: isSelected ? '0 0 0 1px #723ECF' : 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.35rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={16} color={isSuperseded ? '#C94C59' : '#723ECF'} />
                      <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                        {doc.title || doc.id}
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <span className={`badge ${isSuperseded ? 'badge-error' : 'badge-success'}`}>
                        {doc.status || 'Active'}
                      </span>
                    </div>
                  </div>

                  <p style={{ fontSize: '0.78rem', color: 'var(--muted-text)', lineHeight: 1.45, marginBottom: '0.65rem' }}>
                    {doc.summary || 'Policy guide and operational guidelines.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {doc.id}</span>
                      <span>•</span>
                      <span>{doc.chunks_count || 1} chunks</span>
                    </div>
                    {doc.effective_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Calendar size={11} /> {doc.effective_date}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <EmptyState
              icon={BookOpen}
              title="No documents matching query"
              description="Ensure the dataset documents are placed in the dataset folder and refresh."
              actionLabel="Refresh Documents"
              onAction={fetchKnowledgeBase}
            />
          )}
        </div>

        {/* Selected Document Detail View */}
        <div className="zm-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          {activeDoc ? (
            <div>
              {/* Document Header */}
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
                  <span className="badge badge-violet">{activeDoc.category || 'Policy'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
                    <Clock size={13} />
                    <span>Effective: {activeDoc.effective_date || 'Current'}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                  {activeDoc.title || activeDoc.id}
                </h2>
                <div style={{ fontSize: '0.76rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginTop: '0.25rem' }}>
                  File: {activeDoc.filename || activeDoc.id}
                </div>
              </div>

              {/* Superseded Warning Banner if applies */}
              {(activeDoc.status === 'superseded' || activeDoc.id.includes('superseded')) && (
                <div
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--error-subtle)',
                    border: '1px solid rgba(201, 76, 89, 0.2)',
                    color: 'var(--error)',
                    fontSize: '0.78rem',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={15} />
                  <span>
                    <strong>Warning:</strong> This policy has been superseded by v4 and is not used for customer decisions.
                  </span>
                </div>
              )}

              {/* Sections & Chunks View */}
              <div style={{ marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.5rem' }}>
                  Indexed Policy Sections
                </h3>

                {activeDoc.sections && activeDoc.sections.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                    {activeDoc.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem 0.9rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--light-bg)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                            {sec.title || `Section ${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: '#723ECF' }}>
                            {sec.section_id || `SEC-${idx + 1}`}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--body-text)', lineHeight: 1.5 }}>
                          {sec.content || sec.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--light-bg)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.82rem',
                      color: 'var(--body-text)',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '400px',
                      overflowY: 'auto',
                    }}
                  >
                    {activeDoc.raw_content || activeDoc.content || 'Content indexed for vector search.'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-text)', fontSize: '0.88rem' }}>
              Select a document from the left list to inspect its policy sections and vector chunks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
