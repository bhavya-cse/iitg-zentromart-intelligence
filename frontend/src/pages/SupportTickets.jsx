import React, { useState, useEffect } from 'react';
import {
  LifeBuoy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  User,
  Package,
  X,
  ShieldAlert,
  Layers,
} from 'lucide-react';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';

export function SupportTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);

  // New ticket form state
  const [newSummary, setNewSummary] = useState('');
  const [newCustomerRef, setNewCustomerRef] = useState('');
  const [newOrderRef, setNewOrderRef] = useState('');
  const [newReason, setNewReason] = useState('Damaged goods / exception requires manual review');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await api.getTickets({
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: searchQuery,
      });
      setTickets(res.tickets || []);
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSummary.trim()) return;

    setCreating(true);
    setCreateError(null);

    try {
      const res = await api.createTicket({
        summary: newSummary.trim(),
        customer_id: newCustomerRef.trim() || undefined,
        order_id: newOrderRef.trim() || undefined,
        escalation_reason: newReason,
      });

      if (res.created) {
        setCreateModalOpen(false);
        setNewSummary('');
        setNewCustomerRef('');
        setNewOrderRef('');
        fetchTickets();
      } else {
        setCreateError(res.message || 'Ticket creation was not confirmed by the backend system.');
      }
    } catch (err) {
      setCreateError(err.message || 'Error executing create_ticket tool.');
    } finally {
      setCreating(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      (t.ticket_id && t.ticket_id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.summary && t.summary.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.customer_id && t.customer_id.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="page-body">
      {/* Header */}
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
            <span>Human-in-the-Loop • Escalation Operations</span>
          </div>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
            Support Tickets & Escalations
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.96rem' }}>
            Auditable tickets automatically escalated when retail policy exceptions require human operations.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={fetchTickets} className="btn-secondary">
            <RefreshCw size={15} />
            <span>Refresh</span>
          </button>
          <button onClick={() => setCreateModalOpen(true)} className="btn-primary">
            <Plus size={16} />
            <span>Create Ticket</span>
          </button>
        </div>
      </div>

      {/* Escalation Policy Banner */}
      <div
        className="zm-card"
        style={{
          padding: '1.15rem 1.75rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #B45309',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldAlert size={20} color="#B45309" />
          <span style={{ fontSize: '0.86rem', color: 'var(--body-text)' }}>
            <strong style={{ color: 'var(--corp-navy)' }}>Escalation Protocol:</strong> The AI support agent only confirms ticket creation to the customer after <code>create_ticket(summary)</code> returns <code>created=True</code>.
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          Active Tickets: {tickets.length}
        </span>
      </div>

      {/* Filter & Search Bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '280px', position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} color="#64748B" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets by ID, summary, or customer reference..."
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

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'Open', 'In Progress', 'Resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: statusFilter === st ? 'var(--corp-navy)' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : 'var(--corp-navy)',
                border: statusFilter === st ? '1px solid var(--corp-navy)' : '1px solid var(--border-light)',
              }}
            >
              {st === 'all' ? 'All Tickets' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Tickets List */}
      <div className="zm-card" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.86rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-slate)', borderBottom: '1px solid var(--border-light)', color: 'var(--corp-navy)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 800 }}>
                <th style={{ padding: '0.85rem 1.15rem' }}>Ticket ID</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Summary & Context</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Customer / Order</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Escalation Reason</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Status</th>
                <th style={{ padding: '0.85rem 1.15rem' }}>Created At</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.length > 0 ? (
                filteredTickets.map((t) => (
                  <tr key={t.ticket_id} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: '0.95rem 1.15rem', fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--accent-blue)' }}>
                      #{t.ticket_id}
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div style={{ fontWeight: 700, color: 'var(--corp-navy)' }}>
                        {t.summary}
                      </div>
                      {t.resolution_status && (
                        <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)', marginTop: '2px' }}>
                          Assignment: {t.resolution_status}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.76rem' }}>
                        {t.customer_id && (
                          <span style={{ color: 'var(--corp-navy)', fontWeight: 700 }}>
                            {t.customer_id}
                          </span>
                        )}
                        {t.order_id && (
                          <span style={{ color: 'var(--muted-text)', fontFamily: 'var(--font-mono)' }}>
                            {t.order_id}
                          </span>
                        )}
                        {!t.customer_id && !t.order_id && (
                          <span style={{ color: 'var(--muted-text)' }}>—</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem', color: 'var(--body-text)', fontSize: '0.8rem' }}>
                      {t.escalation_reason || 'Policy requires human intervention'}
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem' }}>
                      <span
                        className={`badge ${
                          t.status === 'Resolved'
                            ? 'badge-success'
                            : t.status === 'In Progress'
                            ? 'badge-blue'
                            : 'badge-warning'
                        }`}
                      >
                        {t.status || 'Open'}
                      </span>
                    </td>
                    <td style={{ padding: '0.95rem 1.15rem', color: 'var(--muted-text)', fontSize: '0.76rem', whiteSpace: 'nowrap' }}>
                      {t.created_at || '2026-10-20 14:30'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted-text)' }}>
                    No support tickets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Create Ticket Modal */}
      {createModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 18, 46, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="zm-card"
            style={{
              width: '100%',
              maxWidth: '540px',
              padding: '2rem',
              backgroundColor: '#FFFFFF',
              boxShadow: 'var(--shadow-lg)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <LifeBuoy size={22} color="#0066FF" />
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--corp-navy)' }}>
                  Create Support Escalation Ticket
                </h2>
              </div>
              <button onClick={() => setCreateModalOpen(false)} className="btn-ghost" style={{ padding: '4px' }}>
                <X size={18} />
              </button>
            </div>

            {createError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--error-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(209, 52, 56, 0.25)',
                  color: 'var(--error)',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                }}
              >
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateTicket}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--corp-navy)', marginBottom: '0.4rem' }}>
                  Ticket Summary (Issue Description) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="e.g. Customer received damaged screen on order ORD-1022. Requesting immediate replacement."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--corp-navy)', marginBottom: '0.4rem' }}>
                    Customer ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCustomerRef}
                    onChange={(e) => setNewCustomerRef(e.target.value)}
                    placeholder="e.g. CUST-104"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--corp-navy)', marginBottom: '0.4rem' }}>
                    Order ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newOrderRef}
                    onChange={(e) => setNewOrderRef(e.target.value)}
                    placeholder="e.g. ORD-1022"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-medium)',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--corp-navy)', marginBottom: '0.4rem' }}>
                  Escalation Reason
                </label>
                <select
                  value={newReason}
                  onChange={(e) => setNewReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.88rem',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  <option value="Damaged goods / exception requires manual review">
                    Damaged goods / exception requires manual review
                  </option>
                  <option value="Delivery exceeded promised date beyond policy tolerance">
                    Delivery exceeded promised date beyond policy tolerance
                  </option>
                  <option value="Customer dispute on return eligibility">
                    Customer dispute on return eligibility
                  </option>
                  <option value="High-value refund authorization required">
                    High-value refund authorization required
                  </option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newSummary.trim()}
                  className="btn-primary"
                >
                  {creating ? 'Creating Ticket...' : 'Confirm Escalation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
