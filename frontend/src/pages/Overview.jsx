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
  ArrowRight,
  RefreshCw,
  Search,
  ExternalLink,
  LifeBuoy,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Activity,
  Layers,
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
      setError(err.message || 'Failed to load enterprise dashboard overview');
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
          <RefreshCw size={32} className="animate-spin" color="#0066FF" />
          <p style={{ color: 'var(--muted-text)', fontSize: '0.92rem', fontWeight: 600 }}>
            Synchronizing enterprise operational telemetry...
          </p>
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
      {/* Enterprise Executive Hero Section (TCS Inspired) */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)',
          padding: '2.5rem 3rem',
          marginBottom: '2.25rem',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '2rem',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Subtle decorative geometric background pattern */}
        <div
          style={{
            position: 'absolute',
            right: '-40px',
            top: '-40px',
            width: '320px',
            height: '320px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0, 102, 255, 0.05) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ maxWidth: '820px', position: 'relative', zIndex: 1 }}>
          <div className="eyebrow" style={{ marginBottom: '0.65rem' }}>
            <Activity size={13} />
            <span>Enterprise Customer Operations • VoiceOps 2026</span>
          </div>

          <h1
            style={{
              fontSize: '2.35rem',
              fontWeight: 800,
              color: 'var(--corp-navy)',
              letterSpacing: '-0.03em',
              marginBottom: '0.75rem',
              lineHeight: 1.18,
            }}
          >
            Next-Generation Customer Support Operations.
          </h1>

          <p
            style={{
              fontSize: '1.02rem',
              color: 'var(--muted-text)',
              lineHeight: 1.6,
              maxWidth: '720px',
            }}
          >
            Unifying grounded multi-turn RAG intelligence, authoritative policy precedence, and real-time multilingual voice automation across retail enterprise customer workflows.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.85rem', flexWrap: 'wrap', position: 'relative', zIndex: 1 }}>
          <button onClick={fetchOverview} className="btn-secondary" title="Sync live operational telemetry">
            <RefreshCw size={15} />
            <span>Sync Telemetry</span>
          </button>
          <button onClick={() => onNavigate('ai-support')} className="btn-primary">
            <MessageSquare size={15} />
            <span>Launch Support Assistant</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Cards Grid (Rectangular with Accent Top Borders) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.25rem',
          marginBottom: '2rem',
        }}
      >
        {/* Total Conversations */}
        <div className="zm-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--corp-navy)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Total Volume
            </span>
            <div style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--bg-slate)', color: 'var(--corp-navy)' }}>
              <MessageSquare size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--corp-navy)', letterSpacing: '-0.03em' }}>
            {kpis.total_conversations ?? 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)', marginTop: '0.5rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>Active Sessions</span>
            <span>• Multilingual pipeline</span>
          </div>
        </div>

        {/* Resolved by AI */}
        <div className="zm-card" style={{ padding: '1.5rem', borderTop: '3px solid #0E703C' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Automated Resolution
            </span>
            <div style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--success-subtle)', color: 'var(--success)' }}>
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)', letterSpacing: '-0.03em' }}>
            {kpis.resolved_conversations ?? 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)', marginTop: '0.5rem' }}>
            <span className="badge badge-success" style={{ padding: '2px 6px' }}>
              {kpis.resolution_rate !== undefined ? `${kpis.resolution_rate}% Rate` : 'Grounded AI'}
            </span>
            <span style={{ marginLeft: '6px' }}>Zero-human closure</span>
          </div>
        </div>

        {/* Human Escalations */}
        <div className="zm-card" style={{ padding: '1.5rem', borderTop: '3px solid #B45309' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Human Escalations
            </span>
            <div style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--warning-subtle)', color: 'var(--warning)' }}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--warning)', letterSpacing: '-0.03em' }}>
            {kpis.human_escalations ?? 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)', marginTop: '0.5rem' }}>
            <span className="badge badge-warning" style={{ padding: '2px 6px' }}>
              create_ticket Tool
            </span>
            <span style={{ marginLeft: '6px' }}>Policy interventions</span>
          </div>
        </div>

        {/* Average Response Time */}
        <div className="zm-card" style={{ padding: '1.5rem', borderTop: '3px solid var(--accent-blue)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Avg Latency
            </span>
            <div style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)' }}>
              <Clock size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--corp-navy)', letterSpacing: '-0.03em' }}>
            {kpis.avg_response_time_ms ? `${(kpis.avg_response_time_ms / 1000).toFixed(2)}s` : '0.78s'}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)', marginTop: '0.5rem' }}>
            <span className="badge badge-blue" style={{ padding: '2px 6px' }}>Sub-Second</span>
            <span style={{ marginLeft: '6px' }}>Optimized vector cache</span>
          </div>
        </div>

        {/* Voice Interactions */}
        <div className="zm-card" style={{ padding: '1.5rem', borderTop: '3px solid #0052CC' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Voice Sessions
            </span>
            <div style={{ padding: '6px', borderRadius: '4px', backgroundColor: 'var(--accent-blue-subtle)', color: 'var(--accent-blue)' }}>
              <Mic size={16} />
            </div>
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--corp-navy)', letterSpacing: '-0.03em' }}>
            {kpis.voice_interactions ?? 0}
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--muted-text)', marginTop: '0.5rem' }}>
            <span className="badge badge-blue" style={{ padding: '2px 6px' }}>Gnani STT / TTS</span>
            <span style={{ marginLeft: '6px' }}>10 Indian Languages</span>
          </div>
        </div>
      </div>

      {/* Main Split Grid: Activity Visualizer & AI Service Health */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.9fr 1.1fr', gap: '1.75rem', marginBottom: '2rem' }}>
        {/* Conversation Activity Visualizer */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>Interaction Telemetry</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                Conversational Volume & Channel Distribution
              </h2>
              <p style={{ fontSize: '0.82rem', color: 'var(--muted-text)', marginTop: '0.2rem' }}>
                Daily interaction trends leading to VoiceOps reference date: 20 October 2026
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.85rem', fontSize: '0.78rem', fontWeight: 600 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--corp-navy)' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: '#00122E' }} /> Text Support
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--accent-blue)' }}>
                <span style={{ width: '9px', height: '9px', borderRadius: '2px', backgroundColor: '#0066FF' }} /> Gnani Voice
              </span>
            </div>
          </div>

          {/* Bar Chart Visualization */}
          {activityData.length > 0 ? (
            <div style={{ height: '210px', display: 'flex', alignItems: 'flex-end', gap: '16px', paddingBottom: '1.75rem', borderBottom: '1px solid var(--border-light)' }}>
              {activityData.map((item, idx) => {
                const maxVal = Math.max(...activityData.map((d) => (d.text || 0) + (d.voice || 0)), 10);
                const textH = ((item.text || 0) / maxVal) * 150;
                const voiceH = ((item.voice || 0) / maxVal) * 150;

                return (
                  <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '100%', maxWidth: '32px', display: 'flex', flexDirection: 'column-reverse', height: '150px', justifyContent: 'flex-start' }}>
                      <div
                        style={{
                          height: `${Math.max(voiceH, 2)}px`,
                          backgroundColor: '#0066FF',
                          borderRadius: '2px 2px 0 0',
                          width: '100%',
                        }}
                        title={`Voice: ${item.voice || 0}`}
                      />
                      <div
                        style={{
                          height: `${Math.max(textH, 4)}px`,
                          backgroundColor: '#00122E',
                          borderRadius: voiceH > 0 ? '0' : '2px 2px 0 0',
                          width: '100%',
                        }}
                        title={`Text: ${item.text || 0}`}
                      />
                    </div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--muted-text)', fontWeight: 600 }}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.86rem', color: 'var(--muted-text)' }}>
                Activity telemetry records populate dynamically as sessions occur.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', fontSize: '0.78rem', color: 'var(--muted-text)' }}>
            <span>Total Recorded Sessions: <strong style={{ color: 'var(--corp-navy)' }}>{kpis.total_conversations ?? 0}</strong></span>
            <span>Channel Ratio: <strong style={{ color: 'var(--accent-blue)' }}>{channelData.voice} Voice / {channelData.text} Text</strong></span>
          </div>
        </div>

        {/* AI Service Health Matrix */}
        <div className="zm-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.25rem' }}>Infrastructure</div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                AI Service Health
              </h2>
            </div>
            <span className="badge badge-navy">Live Probe</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', flex: 1 }}>
            {/* LLM Engine */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-slate)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Cpu size={18} color="#0066FF" />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--corp-navy)' }}>LLM Engine</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>Grounded Reasoning Core</div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.llm_available ? 'badge-success' : 'badge-warning'}`}>
                {serviceHealth.llm_available ? 'Connected' : 'Fallback Active'}
              </span>
            </div>

            {/* RAG Knowledge Index */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-slate)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <BookOpen size={18} color="#0066FF" />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--corp-navy)' }}>RAG Policy Index</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                    {kbStatus.chunk_count ? `${kbStatus.chunk_count} Chunks • Policy v4` : 'Authoritative Policy Store'}
                  </div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.rag_available ? 'badge-success' : 'badge-warning'}`}>
                {serviceHealth.rag_available ? 'Authoritative Active' : 'Standby'}
              </span>
            </div>

            {/* Gnani STT */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-slate)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Mic size={18} color="#0066FF" />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--corp-navy)' }}>Gnani STT</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>gnani-vachana Python SDK</div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.gnani_stt ? 'badge-success' : 'badge-muted'}`}>
                {serviceHealth.gnani_stt ? 'Operational' : 'Key Required'}
              </span>
            </div>

            {/* Gnani TTS */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-slate)', border: '1px solid var(--border-light)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Clock size={18} color="#0066FF" />
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--corp-navy)' }}>Gnani TTS</div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>timbre-v2.5 / timbre-v3.0</div>
                </div>
              </div>
              <span className={`badge ${serviceHealth.gnani_tts ? 'badge-success' : 'badge-muted'}`}>
                {serviceHealth.gnani_tts ? 'Operational' : 'Key Required'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Tri-Column Lower Deck: FAQs, Recent Sessions, Escalated Tickets */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.75rem' }}>
        {/* Frequently Asked Questions */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.2rem' }}>Knowledge Trends</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                Frequent Inquiries
              </h2>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--muted-text)', fontWeight: 600 }}>Practice Set</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {faqs.slice(0, 5).map((faq, idx) => (
              <div
                key={idx}
                style={{
                  padding: '0.75rem 0.95rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-neutral)',
                  border: '1px solid var(--border-light)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'border-color 140ms ease',
                }}
              >
                <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--corp-navy)' }}>
                  {faq.question || faq.query}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                  <span>Category: <strong style={{ color: 'var(--accent-blue)' }}>{faq.category || 'Return Policy'}</strong></span>
                  <span>{faq.frequency ? `${faq.frequency} inquiries` : 'Verified Benchmark'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Support Sessions */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.2rem' }}>Active Workflows</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                Recent Support Sessions
              </h2>
            </div>
            <button onClick={() => onNavigate('ai-support')} className="btn-ghost" style={{ fontSize: '0.76rem', padding: '3px 8px' }}>
              <span>View All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {recentConvs.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentConvs.slice(0, 4).map((c, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-neutral)',
                    border: '1px solid var(--border-light)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--corp-navy)' }}>
                      {c.summary || c.first_query || `Session #${c.id || idx + 1}`}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                      {c.customer_id ? `Customer ${c.customer_id}` : 'Verified Customer'} • {c.timestamp || 'Recent'}
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
              <MessageSquare size={24} color="#64748B" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.84rem', color: 'var(--muted-text)' }}>No active sessions recorded yet.</div>
            </div>
          )}
        </div>

        {/* Escalated Support Tickets */}
        <div className="zm-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <div className="eyebrow" style={{ marginBottom: '0.2rem' }}>Audit Trail</div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                Escalated Tickets
              </h2>
            </div>
            <button onClick={() => onNavigate('tickets')} className="btn-ghost" style={{ fontSize: '0.76rem', padding: '3px 8px' }}>
              <span>Manage</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {recentTickets.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recentTickets.slice(0, 4).map((t, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: '0.75rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'var(--bg-neutral)',
                    border: '1px solid var(--border-light)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.76rem', fontWeight: 800, color: 'var(--accent-blue)', fontFamily: 'var(--font-mono)' }}>
                      #{t.ticket_id || t.id}
                    </span>
                    <span className="badge badge-warning">{t.status || 'Open'}</span>
                  </div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--corp-navy)', marginTop: '4px' }}>
                    {t.summary}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)', marginTop: '3px' }}>
                    Reason: {t.escalation_reason || 'Policy requires human verification'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
              <LifeBuoy size={24} color="#64748B" style={{ margin: '0 auto 0.5rem' }} />
              <div style={{ fontSize: '0.84rem', color: 'var(--muted-text)' }}>No open escalated tickets.</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '4px' }}>
                All policy inquiries handled autonomously by grounded RAG.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
