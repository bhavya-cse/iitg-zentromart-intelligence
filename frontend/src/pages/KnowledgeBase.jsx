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
  CheckCircle2,
  ChevronRight,
  Filter,
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
    <div className="page-body animate-fade-in">
      {/* Page Title & Actions */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1.25rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.45rem' }}>
            <span className="badge badge-violet">Authoritative Policy Store</span>
            <span className="badge badge-muted">Multi-Turn Vector RAG</span>
          </div>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
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
          borderLeft: '4px solid var(--accent-violet)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <ShieldCheck size={22} color="#723ECF" />
          <div style={{ fontSize: '0.86rem', color: 'var(--body-text)' }}>
            <strong style={{ color: 'var(--primary-indigo)' }}>Precedence Chain:</strong>{' '}
            <span style={{ color: 'var(--accent-violet)', fontWeight: 700 }}>Current Policies (v4)</span> →{' '}
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
              padding: '0.62rem 0.85rem 0.62rem 2.35rem',
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
                backgroundColor: selectedCategory === cat ? 'var(--primary-indigo)' : '#FFFFFF',
                color: selectedCategory === cat ? '#FFFFFF' : 'var(--primary-indigo)',
                border: selectedCategory === cat ? '1px solid var(--primary-indigo)' : '1px solid var(--border-card)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
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
                  className="zm-card zm-card-interactive"
                  style={{
                    padding: '1.15rem 1.35rem',
                    borderColor: isSelected ? 'var(--accent-violet)' : 'var(--border-card)',
                    backgroundColor: isSelected ? 'var(--soft-violet-subtle)' : '#FFFFFF',
                    boxShadow: isSelected ? 'var(--shadow-sm)' : 'var(--shadow-xs)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.45rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <FileText size={17} color={isSuperseded ? '#C94C59' : '#723ECF'} />
                      <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
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
                  <span className="badge badge-violet">{activeDoc.category || 'Policy'}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.76rem', color: 'var(--muted-text)' }}>
                    <Clock size={13} />
                    <span>Effective: {activeDoc.effective_date || 'Current'}</span>
                  </div>
                </div>

                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
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
                    border: '1px solid var(--error-border)',
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
                <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: 'var(--primary-indigo)', marginBottom: '0.65rem' }}>
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
                          backgroundColor: 'var(--light-bg)',
                          border: '1px solid var(--border-card)',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                          <span style={{ fontSize: '0.84rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                            {sec.title || `Section ${idx + 1}`}
                          </span>
                          <span style={{ fontSize: '0.72rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-violet)', fontWeight: 700 }}>
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
                      backgroundColor: 'var(--light-bg)',
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
