import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  RefreshCw,
  FileText,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
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
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div className="eyebrow" style={{ marginBottom: '0.45rem' }}>
            <Layers size={13} />
            <span>Authoritative Policy Store • Multi-Turn Vector RAG</span>
          </div>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
            Knowledge Base
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.96rem' }}>
            Document directory, section chunk indices, and authoritative policy precedence hierarchy.
          </p>
        </div>

        <button
          onClick={handleReindex}
          disabled={reindexing}
          className="btn-secondary"
          title="Re-chunk and re-index Markdown policies into the vector store"
        >
          <RefreshCw size={15} className={reindexing ? 'animate-spin' : ''} />
          <span>{reindexing ? 'Re-indexing Knowledge...' : 'Refresh Knowledge Index'}</span>
        </button>
      </div>

      {/* Enterprise Policy Precedence Banner */}
      <div
        className="zm-card"
        style={{
          padding: '1.25rem 1.75rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid var(--accent-blue)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={22} color="#0066FF" />
          <div style={{ fontSize: '0.86rem', color: 'var(--body-text)' }}>
            <strong style={{ color: 'var(--corp-navy)' }}>Precedence Chain:</strong>{' '}
            <span style={{ color: 'var(--accent-blue)', fontWeight: 700 }}>Current Policies (v4)</span> →{' '}
            <span>Agent Guides</span> → <span>Help Documents</span> → <span>FAQs</span> →{' '}
            <span style={{ color: 'var(--muted-text)' }}>Marketing Documents</span>.
          </div>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--error)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AlertTriangle size={15} />
          <span>pol_returns_v4.md overrides superseded v3</span>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div
          style={{
            flex: 1,
            minWidth: '280px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Search
            size={16}
            color="#64748B"
            style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents by ID, policy section, or keywords..."
            style={{
              width: '100%',
              padding: '0.6rem 0.85rem 0.6rem 2.35rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              fontSize: '0.88rem',
            }}
          />
        </div>

        {/* Category Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                textTransform: 'capitalize',
                backgroundColor: selectedCategory === cat ? 'var(--corp-navy)' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--corp-navy)',
                border: selectedCategory === cat ? '1px solid var(--corp-navy)' : '1px solid var(--border-light)',
              }}
            >
              {cat === 'all' ? 'All Policies' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Split View: Document Directory on Left, Detailed Content Preview on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.3fr', gap: '1.75rem' }}>
        {/* Document List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                    padding: '1.15rem 1.35rem',
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border-light)',
                    backgroundColor: isSelected ? 'var(--accent-blue-subtle)' : '#FFFFFF',
                    boxShadow: isSelected ? '0 0 0 1px var(--accent-blue)' : 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={17} color={isSuperseded ? '#D13438' : '#0066FF'} />
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                        {doc.title || doc.id}
                      </span>
                    </div>

                    <span className={`badge ${isSuperseded ? 'badge-error' : 'badge-success'}`}>
                      {doc.status || 'Active'}
                    </span>
                  </div>

                  <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', lineHeight: 1.5, marginBottom: '0.75rem' }}>
                    {doc.summary || 'Authoritative policy guide and operational customer standards.'}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>ID: {doc.id}</span>
                      <span>•</span>
                      <span>{doc.chunks_count || 1} chunks</span>
                    </div>
                    {doc.effective_date && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {doc.effective_date}
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
              description="Ensure policies are indexed in the dataset directory and refresh."
              actionLabel="Refresh Documents"
              onAction={fetchKnowledgeBase}
            />
          )}
        </div>

        {/* Selected Document Detail View */}
        <div className="zm-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column' }}>
          {activeDoc ? (
            <div>
              {/* Document Header */}
              <div style={{ borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span className="badge badge-blue">{activeDoc.category || 'Policy'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--muted-text)' }}>
                    <Clock size={13} />
                    <span>Effective: {activeDoc.effective_date || 'Current'}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                  {activeDoc.title || activeDoc.id}
                </h2>
                <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
                  File: {activeDoc.filename || activeDoc.id}
                </div>
              </div>

              {/* Superseded Warning Banner if applies */}
              {(activeDoc.status === 'superseded' || activeDoc.id.includes('superseded')) && (
                <div
                  style={{
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--error-subtle)',
                    border: '1px solid rgba(209, 52, 56, 0.25)',
                    color: 'var(--error)',
                    fontSize: '0.82rem',
                    marginBottom: '1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                  }}
                >
                  <AlertTriangle size={16} />
                  <span>
                    <strong>Warning:</strong> This policy has been superseded by v4 and is not used for customer decisions.
                  </span>
                </div>
              )}

              {/* Sections & Chunks View */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--corp-navy)', marginBottom: '0.65rem' }}>
                  Indexed Policy Sections
                </h3>

                {activeDoc.sections && activeDoc.sections.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {activeDoc.sections.map((sec, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          backgroundColor: 'var(--bg-neutral)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                            {sec.title || `Section ${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)', fontWeight: 700 }}>
                            {sec.section_id || `SEC-${idx + 1}`}
                          </span>
                        </div>
                        <p style={{ fontSize: '0.84rem', color: 'var(--body-text)', lineHeight: 1.6 }}>
                          {sec.content || sec.text}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      padding: '1.15rem',
                      backgroundColor: 'var(--bg-neutral)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.84rem',
                      color: 'var(--body-text)',
                      lineHeight: 1.65,
                      whiteSpace: 'pre-wrap',
                      maxHeight: '420px',
                      overflowY: 'auto',
                    }}
                  >
                    {activeDoc.raw_content || activeDoc.content || 'Content indexed for vector search.'}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted-text)', fontSize: '0.9rem' }}>
              Select a policy from the directory to inspect its sections and vector chunks.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
