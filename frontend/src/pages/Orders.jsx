import React, { useState, useEffect } from 'react';
import {
  Package,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Lock,
  Unlock,
  CheckCircle2,
  Clock,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  User,
  MapPin,
  Calendar,
  CreditCard,
  X,
} from 'lucide-react';
import { api } from '../services/api';
import { EmptyState } from '../components/EmptyState';

export function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Verification modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [targetOrderForVerify, setTargetOrderForVerify] = useState(null);
  const [verificationInput, setVerificationInput] = useState('');
  const [verifiedOrders, setVerifiedOrders] = useState({}); // order_id -> bool
  const [verifyError, setVerifyError] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.getOrders({
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      setOrders(res.orders || []);
      if (res.orders && res.orders.length > 0 && !selectedOrder) {
        setSelectedOrder(res.orders[0]);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
  };

  const openVerifyModal = (order) => {
    setTargetOrderForVerify(order);
    setVerificationInput('');
    setVerifyError(null);
    setVerifyModalOpen(true);
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!targetOrderForVerify) return;

    setVerifyLoading(true);
    setVerifyError(null);

    try {
      const res = await api.lookupOrder({
        order_id: targetOrderForVerify.order_id,
        verification_credential: verificationInput.trim(),
      });

      if (res.verified) {
        setVerifiedOrders((prev) => ({
          ...prev,
          [targetOrderForVerify.order_id]: true,
        }));
        setSelectedOrder(res.order_details);
        setVerifyModalOpen(false);
      } else {
        setVerifyError(res.reason || 'Verification failed. Customer ID or credential does not match.');
      }
    } catch (err) {
      setVerifyError(err.message || 'Verification service error.');
    } finally {
      setVerifyLoading(false);
    }
  };

  const isOrderVerified = (orderId) => !!verifiedOrders[orderId];

  return (
    <div className="page-body">
      {/* Title */}
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
            <span className="badge badge-violet">Enterprise Records</span>
            <span className="badge badge-success">
              {orders.length > 0 ? `${orders.length} Orders Synchronized` : 'Database Connected'}
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            Order Management
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.94rem' }}>
            Customer verification enforcement, delivery tracking, and return window evaluations.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn-secondary" title="Sync orders with dataset">
          <RefreshCw size={15} />
          <span>Refresh Records</span>
        </button>
      </div>

      {/* Security Verification Policy Banner */}
      <div
        className="zm-card"
        style={{
          padding: '0.9rem 1.25rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid #21865B',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <ShieldCheck size={18} color="#21865B" />
          <span style={{ fontSize: '0.82rem', color: 'var(--body-text)' }}>
            <strong>Privacy Protocol:</strong> Customer verification is strictly required before exposing private order details or processing return claims.
          </span>
        </div>
        <span style={{ fontSize: '0.74rem', color: 'var(--muted-text)', fontFamily: 'var(--font-mono)' }}>
          Reference Date: 20-Oct-2026
        </span>
      </div>

      {/* Search & Status Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.5rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '280px', display: 'flex', gap: '0.5rem' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="#77758A" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (ORD-...), Customer ID (CUST-...), or Pincode..."
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
          <button type="submit" className="btn-secondary" style={{ padding: '0.55rem 1rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.45rem', overflowX: 'auto' }}>
          {['all', 'Delivered', 'In Transit', 'Returned', 'Refunded', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.45rem 0.85rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.78rem',
                fontWeight: 600,
                backgroundColor: statusFilter === st ? 'var(--primary-indigo)' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : 'var(--body-text)',
                border: statusFilter === st ? '1px solid var(--primary-indigo)' : '1px solid var(--border-light)',
              }}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Order Table on Left, Order Detail View on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: '1.5rem' }}>
        {/* Orders Table */}
        <div className="zm-card" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--light-bg)', borderBottom: '1px solid var(--border-light)', color: 'var(--muted-text)', fontSize: '0.74rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Order ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Customer</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Order Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Verification</th>
                </tr>
              </thead>
              <tbody>
                {orders.length > 0 ? (
                  orders.map((ord) => {
                    const isSelected = selectedOrder?.order_id === ord.order_id;
                    const verified = isOrderVerified(ord.order_id);

                    return (
                      <tr
                        key={ord.order_id}
                        onClick={() => handleOrderClick(ord)}
                        style={{
                          borderBottom: '1px solid var(--border-light)',
                          backgroundColor: isSelected ? 'var(--soft-violet-subtle)' : 'transparent',
                          cursor: 'pointer',
                        }}
                      >
                        <td style={{ padding: '0.85rem 1rem', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                          {ord.order_id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--body-text)' }}>
                          {ord.customer_id}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          <span
                            className={`badge ${
                              ord.status === 'Delivered'
                                ? 'badge-success'
                                : ord.status === 'In Transit'
                                ? 'badge-violet'
                                : ord.status === 'Returned'
                                ? 'badge-warning'
                                : 'badge-muted'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td style={{ padding: '0.85rem 1rem', color: 'var(--muted-text)' }}>
                          {ord.order_date || '2026-10-15'}
                        </td>
                        <td style={{ padding: '0.85rem 1rem' }}>
                          {verified ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#21865B', fontSize: '0.75rem', fontWeight: 600 }}>
                              <Unlock size={13} /> Verified
                            </span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openVerifyModal(ord);
                              }}
                              className="btn-ghost"
                              style={{ fontSize: '0.72rem', padding: '2px 6px', color: 'var(--primary-accent)' }}
                            >
                              <Lock size={12} />
                              <span>Verify</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted-text)' }}>
                      No orders found matching the filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Selected Order Detail & Verification Panel */}
        <div className="zm-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
          {selectedOrder ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Order Inspection
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--primary-indigo)', fontFamily: 'var(--font-mono)' }}>
                    {selectedOrder.order_id}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                  <span className={`badge ${selectedOrder.status === 'Delivered' ? 'badge-success' : 'badge-violet'}`}>
                    {selectedOrder.status}
                  </span>
                  {isOrderVerified(selectedOrder.order_id) ? (
                    <span style={{ fontSize: '0.7rem', color: '#21865B', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <ShieldCheck size={12} /> Customer Authenticated
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: '#D69A35', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <Lock size={12} /> Unverified View
                    </span>
                  )}
                </div>
              </div>

              {/* Order Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Customer Reference</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.customer_id}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Promised Delivery Date</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.promised_delivery_date || selectedOrder.delivery_date || '2026-10-18'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Destination Pincode</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.delivery_pincode || selectedOrder.pincode || '560001'}
                  </div>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>Payment Method</div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.payment_method || 'UPI / Prepaid'}
                  </div>
                </div>
              </div>

              {/* Protected Details: Items & Sensitive Status */}
              {isOrderVerified(selectedOrder.order_id) ? (
                <div>
                  <h3 style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.65rem' }}>
                    Purchased Items & Return Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    {(selectedOrder.items || [
                      {
                        product_id: selectedOrder.product_id || 'PRD-102',
                        product_name: selectedOrder.product_name || 'Noise Cancelling Wireless Headphones',
                        price: '₹2,499',
                        category: 'Electronics',
                        return_eligible: true,
                        return_window_days: 7,
                      },
                    ]).map((item, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)' }}>
                            ID: {item.product_id} • Category: {item.category || 'General'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                            {item.price || '₹1,299'}
                          </div>
                          <span className={`badge ${item.return_eligible ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.65rem', padding: '1px 5px' }}>
                            {item.return_eligible ? 'Returnable' : 'Non-Returnable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Return Window Evaluation */}
                  <div
                    style={{
                      padding: '0.85rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--soft-violet-subtle)',
                      border: '1px solid rgba(114, 62, 207, 0.2)',
                      fontSize: '0.78rem',
                      color: 'var(--body-text)',
                    }}
                  >
                    <div style={{ fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '3px' }}>
                      Calendar Days Evaluation (Ref: 20-Oct-2026):
                    </div>
                    <div>
                      Return policy uses strict calendar days from delivered date. Business days (Mon-Sat, excluding holidays) apply only to logistics dispatch.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '2rem 1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--light-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-medium)',
                  }}
                >
                  <Lock size={28} color="#D69A35" style={{ margin: '0 auto 0.75rem' }} />
                  <h3 style={{ fontSize: '0.96rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.35rem' }}>
                    Customer Verification Required
                  </h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--muted-text)', maxWidth: '300px', margin: '0 auto 1.25rem', lineHeight: 1.45 }}>
                    Under company policy, detailed itemization, refund status, and return requests require verified customer authentication.
                  </p>
                  <button
                    onClick={() => openVerifyModal(selectedOrder)}
                    className="btn-primary"
                    style={{ fontSize: '0.84rem', padding: '0.5rem 1rem' }}
                  >
                    Authenticate Customer ({selectedOrder.customer_id})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--muted-text)' }}>
              Select an order to inspect details.
            </div>
          )}
        </div>
      </div>

      {/* Verification Modal */}
      {verifyModalOpen && targetOrderForVerify && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 14, 45, 0.6)',
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
              maxWidth: '460px',
              padding: '1.75rem',
              boxShadow: 'var(--shadow-lg)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={20} color="#723ECF" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                  Customer Authentication
                </h2>
              </div>
              <button
                onClick={() => setVerifyModalOpen(false)}
                className="btn-ghost"
                style={{ padding: '4px' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Enter the Customer ID, registered phone number, or email associated with Order <strong>{targetOrderForVerify.order_id}</strong>.
            </p>

            {verifyError && (
              <div
                style={{
                  padding: '0.65rem 0.85rem',
                  backgroundColor: 'var(--error-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(201, 76, 89, 0.2)',
                  color: 'var(--error)',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifySubmit}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: 'var(--primary-indigo)', marginBottom: '0.4rem' }}>
                  Verification Credential (e.g. {targetOrderForVerify.customer_id})
                </label>
                <input
                  type="text"
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder={`Enter ${targetOrderForVerify.customer_id} or phone`}
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  onClick={() => setVerifyModalOpen(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={verifyLoading || !verificationInput.trim()}
                  className="btn-primary"
                >
                  {verifyLoading ? 'Verifying...' : 'Authenticate & Reveal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
