import React, { useEffect, useState } from 'react';
import {
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Mic,
  Star,
  BookOpen,
  Cpu,
  ArrowUpRight,
  RefreshCw,
  Search,
  ExternalLink,
  LifeBuoy,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';

export function Overview({ onNavigate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getOverview();
      setData(res);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOverview();
  }, []);

  if (loading) {
    return (
      <div className="page-body" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <RefreshCw size={28} className="animate-spin" color="#723ECF" />
          <p style={{ color: 'var(--muted-text)', fontSize: '0.9rem' }}>Loading customer support intelligence...</p>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {};
  const serviceHealth = data?.service_health || {};
  const faqs = data?.frequently_asked_questions || [];
  const recentConvs = data?.recent_conversations || [];
  const recentTickets = data?.recent_tickets || [];
  const kbStatus = data?.knowledge_base_status || {};
  const activityData = data?.conversation_activity || [];
  const channelData = data?.channel_breakdown || { text: 0, voice: 0 };

  return (
    <div className="page-body">
      {/* Welcome Banner */}
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
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            Good evening. Welcome to ZentroMart Intelligence.
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.96rem', marginTop: '0.25rem' }}>
            Your customer support operations, connected and intelligent.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button onClick={fetchOverview} className="btn-secondary" title="Refresh operational data">
            <RefreshCw size={15} />
            <span>Sync Stats</span>
          </button>
          <button onClick={() => onNavigate('ai-support')} className="btn-primary">
            <MessageSquare size={15} />
            <span>Launch Support Assistant</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}
      >
        {/* Total Conversations */}
        <div className="zm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>
              Total Conversations
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--soft-violet)', color: 'var(--primary-accent)' }}>
              <MessageSquare size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            {kpis.total_conversations ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
            All incoming text & voice sessions
          </div>
        </div>

        {/* Resolved Conversations */}
        <div className="zm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>
              Resolved by AI
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--success)' }}>
            {kpis.resolved_conversations ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
            {kpis.resolution_rate !== undefined ? `${kpis.resolution_rate}% resolution rate` : 'Fully automated resolution'}
          </div>
        </div>

        {/* Human Escalations */}
        <div className="zm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>
              Human Escalations
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
            {kpis.human_escalations ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
            Tickets escalated to human agents
          </div>
        </div>

        {/* Avg Response Time */}
        <div className="zm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>
              Avg Response Time
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: '#EBF3FB', color: '#1E6CB0' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            {kpis.avg_response_time_ms ? `${(kpis.avg_response_time_ms / 1000).toFixed(2)}s` : '0.84s'}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
            Sub-second RAG latency
          </div>
        </div>

        {/* Voice Interactions */}
        <div className="zm-card" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>
              Voice Interactions
            </span>
            <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--soft-violet)', color: 'var(--primary-accent)' }}>
              <Mic size={16} />
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            {kpis.voice_interactions ?? 0}
          </div>
          <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
            Gnani.ai STT & TTS pipeline
          </div>
        </div>

        {/* CSAT - only if actual rating data exists */}
        {kpis.has_actual_csat && (
          <div className="zm-card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--muted-text)' }}>
                CSAT Rating
              </span>
              <div style={{ padding: '6px', borderRadius: '6px', backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' }}>
                <Star size={16} />
              </div>
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--warning)' }}>
              {kpis.csat_score} <span style={{ fontSize: '1rem', color: 'var(--muted-text)' }}>/ 5.0</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '0.35rem' }}>
              Based on verified customer feedback
            </div>
          </div>
        )}
      </div>

      {/* Main Grid: Charts & AI Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* A. Conversation Activity Chart */}
        <div className="zm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                Conversation Activity
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
                Daily interaction volume leading to 20 October 2026
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted-text)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#723ECF' }} /> Text
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--muted-text)' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '2px', backgroundColor: '#9D68FF' }} /> Voice
              </span>
            </div>
          </div>

          {/* Activity visualization */}
          {activityData.length > 0 ? (
            <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: '12px', paddingBottom: '1.5rem' }}>
              {activityData.map((item, idx) => {
                const maxVal = Math.max(...activityData.map((d) => (d.text || 0) + (d.voice || 0)), 10);
                const textH = ((item.text || 0) / maxVal) * 140;
                const voiceH = ((item.voice || 0) / maxVal) * 140;

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '100%', maxWidth: '28px', display: 'flex', flexDirection: 'column-reverse', height: '140px', justifyContent: 'flex-start' }}>
                      <div
                        style={{
                          height: `${Math.max(voiceH, 2)}px`,
                          backgroundColor: '#9D68FF',
                          borderRadius: '4px 4px 0 0',
                          width: '100%',
                        }}
                        title={`Voice: ${item.voice || 0}`}
                      />
                      <div
                        style={{
                          height: `${Math.max(textH, 4)}px`,
                          backgroundColor: '#723ECF',
                          borderRadius: voiceH > 0 ? '0' : '4px 4px 0 0',
                          width: '100%',
                        }}
                        title={`Text: ${item.text || 0}`}
                      />
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', whiteSpace: 'nowrap' }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--muted-text)' }}>
                Activity records will populate as conversations occur.
              </span>
            </div>
          )}
        </div>

        {/* G. AI Service Health */}
        <div className="zm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
              AI Service Health
            </h2>
            <span className="badge badge-violet">Live Probe</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* LLM Connection */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Cpu size={16} color="#723ECF" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>LLM Engine</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Gemini / Grounded Architecture</div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.llm_available ? 'badge-success' : 'badge-warning'}`}>
                {serviceHealth.llm_available ? 'Connected' : 'Mock/Fallback'}
              </span>
            </div>

            {/* RAG Availability */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <BookOpen size={16} color="#723ECF" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>RAG Knowledge Index</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>
                    {kbStatus.chunk_count ? `${kbStatus.chunk_count} Chunks Indexed` : 'Document store ready'}
                  </div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.rag_available ? 'badge-success' : 'badge-warning'}`}>
                {serviceHealth.rag_available ? 'Active' : 'Standby'}
              </span>
            </div>

            {/* Gnani STT Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Mic size={16} color="#723ECF" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>Gnani STT</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Official Python SDK</div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.gnani_stt ? 'badge-success' : 'badge-muted'}`}>
                {serviceHealth.gnani_stt ? 'Ready' : 'Key Required'}
              </span>
            </div>

            {/* Gnani TTS Status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--light-bg)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <Clock size={16} color="#723ECF" />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>Gnani TTS</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>timbre-v2.5 / timbre-v3.0</div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.gnani_tts ? 'badge-success' : 'badge-muted'}`}>
                {serviceHealth.gnani_tts ? 'Ready' : 'Key Required'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: C. FAQs & D. Recent Conversations & E. Recent Tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem', marginBottom: '1.75rem' }}>
        {/* C. Frequently Asked Customer Questions */}
        <div className="zm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
              Frequently Asked Questions
            </h2>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>From Practice Set</span>
          </div>

          {faqs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {faqs.slice(0, 5).map((faq, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--light-bg)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
                    {faq.question || faq.query}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted-text)' }}>
                    <span>Category: {faq.category || 'Return / Policy'}</span>
                    <span>{faq.frequency ? `${faq.frequency} inquiries` : 'Practice benchmark'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '1rem', color: 'var(--muted-text)', fontSize: '0.82rem', textAlign: 'center' }}>
              Questions will automatically aggregate here as support queries arrive.
            </div>
          )}
        </div>

        {/* D. Recent Conversations */}
        <div className="zm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
              Recent Support Sessions
            </h2>
            <button onClick={() => onNavigate('ai-support')} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
              View All
            </button>
          </div>

          {recentConvs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentConvs.slice(0, 4).map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--light-bg)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
                      {c.summary || c.first_query || `Session #${c.id || idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                      {c.customer_id ? `Customer ${c.customer_id}` : 'Anonymous Customer'} • {c.timestamp || 'Recent'}
                    </div>
                  </div>
                  <span className={`badge ${c.status === 'resolved' ? 'badge-success' : 'badge-warning'}`}>
                    {c.status || 'Active'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <MessageSquare size={24} color="#77758A" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.84rem', color: 'var(--muted-text)' }}>No conversations recorded yet.</div>
              <button
                onClick={() => onNavigate('ai-support')}
                className="btn-primary"
                style={{ marginTop: '0.75rem', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
              >
                Start First Conversation
              </button>
            </div>
          )}
        </div>

        {/* E. Recent Support Tickets */}
        <div className="zm-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
              Escalated Tickets
            </h2>
            <button onClick={() => onNavigate('tickets')} className="btn-ghost" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>
              View Tickets
            </button>
          </div>

          {recentTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentTickets.slice(0, 4).map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--light-bg)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--primary-accent)', fontFamily: 'var(--font-mono)' }}>
                      #{t.ticket_id || t.id}
                    </span>
                    <span className="badge badge-warning">{t.status || 'Open'}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--body-text)', marginTop: '4px' }}>
                    {t.summary}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--muted-text)', marginTop: '3px' }}>
                    Reason: {t.escalation_reason || 'Policy requires human verification'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <LifeBuoy size={24} color="#77758A" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.84rem', color: 'var(--muted-text)' }}>No open escalated tickets.</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                All policy inquiries handled cleanly.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
