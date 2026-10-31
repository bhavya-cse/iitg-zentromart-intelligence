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
  RefreshCw,
  User,
  MapPin,
  Calendar,
  CreditCard,
  X,
  Layers,
  Sparkles,
  ShoppingBag,
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
  const [verifiedOrders, setVerifiedOrders] = useState({});
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
    <div className="page-body animate-fade-in">
      {/* Title */}
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
            <span className="badge badge-violet">Retail Telemetry</span>
            <span className="badge badge-muted">1,000 Verified Orders</span>
          </div>
          <h1 style={{ fontSize: '2.15rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
            Order Intelligence & Fulfillment
          </h1>
          <p style={{ color: 'var(--muted-text)', fontSize: '0.96rem' }}>
            Customer verification enforcement, itemized order tracking, and calendar-day return evaluations.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn-secondary" title="Sync orders with dataset">
          <RefreshCw size={15} />
          <span>Refresh Orders</span>
        </button>
      </div>

      {/* Security Verification Policy Banner */}
      <div
        className="zm-card"
        style={{
          padding: '1.15rem 1.75rem',
          backgroundColor: '#FFFFFF',
          borderLeft: '4px solid var(--success)',
          marginBottom: '1.75rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <ShieldCheck size={20} color="#21865B" />
          <span style={{ fontSize: '0.86rem', color: 'var(--body-text)' }}>
            <strong style={{ color: 'var(--primary-indigo)' }}>Privacy Protocol:</strong> Customer verification is strictly required before exposing private order details or processing return claims.
          </span>
        </div>
        <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
          Ref Date: 20-Oct-2026
        </span>
      </div>

      {/* Search & Status Filters */}
      <div
        style={{
          display: 'flex',
          gap: '1rem',
          marginBottom: '1.75rem',
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.65rem' }}>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center' }}>
            <Search size={16} color="#77758A" style={{ position: 'absolute', left: '12px', pointerEvents: 'none' }} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Order ID (ORD-...), Customer ID (CUST-...), or Pincode..."
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
          <button type="submit" className="btn-secondary" style={{ padding: '0.6rem 1.15rem' }}>
            Search
          </button>
        </form>

        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto' }}>
          {['all', 'Delivered', 'In Transit', 'Returned', 'Refunded', 'Cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                padding: '0.5rem 0.95rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.78rem',
                fontWeight: 700,
                backgroundColor: statusFilter === st ? 'var(--primary-indigo)' : '#FFFFFF',
                color: statusFilter === st ? '#FFFFFF' : 'var(--primary-indigo)',
                border: statusFilter === st ? '1px solid var(--primary-indigo)' : '1px solid var(--border-card)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {st === 'all' ? 'All Orders' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Order Table on Left, Order Detail View on Right */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: '1.75rem' }}>
        {/* Orders Table */}
        <div className="table-container">
          <table className="zm-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Order Date</th>
                <th>Verification</th>
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
                        backgroundColor: isSelected ? 'var(--soft-violet-subtle)' : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                        {ord.order_id}
                      </td>
                      <td style={{ color: 'var(--body-text)', fontWeight: 600 }}>
                        {ord.customer_id}
                      </td>
                      <td>
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
                      <td style={{ color: 'var(--muted-text)', fontSize: '0.8rem' }}>
                        {ord.order_date || '2026-10-15'}
                      </td>
                      <td>
                        {verified ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.78rem', fontWeight: 700 }}>
                            <Unlock size={14} /> Verified
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openVerifyModal(ord);
                            }}
                            className="btn-ghost"
                            style={{ fontSize: '0.74rem', padding: '3px 8px', color: 'var(--accent-violet)' }}
                          >
                            <Lock size={13} />
                            <span>Verify</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--muted-text)' }}>
                    No orders found matching the filter criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Selected Order Detail & Verification Panel */}
        <div className="zm-card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column' }}>
          {selectedOrder ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.25rem', marginBottom: '1.5rem' }}>
                <div>
                  <span className="badge badge-violet" style={{ marginBottom: '0.2rem' }}>Order Telemetry</span>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-indigo)', fontFamily: 'var(--font-mono)' }}>
                    {selectedOrder.order_id}
                  </h2>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <span className={`badge ${selectedOrder.status === 'Delivered' ? 'badge-success' : 'badge-violet'}`}>
                    {selectedOrder.status}
                  </span>
                  {isOrderVerified(selectedOrder.order_id) ? (
                    <span style={{ fontSize: '0.74rem', color: 'var(--success)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <ShieldCheck size={13} /> Customer Authenticated
                    </span>
                  ) : (
                    <span style={{ fontSize: '0.74rem', color: 'var(--warning)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Lock size={13} /> Unverified View
                    </span>
                  )}
                </div>
              </div>

              {/* Order Metadata Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ padding: '0.85rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', fontWeight: 600 }}>Customer Reference</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.customer_id}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', fontWeight: 600 }}>Promised Delivery Date</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.promised_delivery_date || selectedOrder.delivery_date || '2026-10-18'}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', fontWeight: 600 }}>Destination Pincode</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.delivery_pincode || selectedOrder.pincode || '560001'}
                  </div>
                </div>

                <div style={{ padding: '0.85rem', backgroundColor: 'var(--light-bg)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--muted-text)', fontWeight: 600 }}>Payment Method</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                    {selectedOrder.payment_method || 'UPI / Prepaid'}
                  </div>
                </div>
              </div>

              {/* Protected Details */}
              {isOrderVerified(selectedOrder.order_id) ? (
                <div>
                  <h3 style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--primary-indigo)', marginBottom: '0.85rem' }}>
                    Purchased Items & Return Status
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', marginBottom: '1.5rem' }}>
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
                          padding: '0.85rem 1rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-light)',
                          backgroundColor: '#FFFFFF',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
                            {item.product_name}
                          </div>
                          <div style={{ fontSize: '0.74rem', color: 'var(--muted-text)' }}>
                            ID: {item.product_id} • Category: {item.category || 'General Merchandise'}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.86rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
                            {item.price || '₹1,299'}
                          </div>
                          <span className={`badge ${item.return_eligible ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.66rem', padding: '1px 6px' }}>
                            {item.return_eligible ? 'Returnable' : 'Non-Returnable'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Return Window Evaluation */}
                  <div
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: 'var(--soft-violet-subtle)',
                      border: '1px solid rgba(114, 62, 207, 0.2)',
                      fontSize: '0.82rem',
                      color: 'var(--primary-indigo)',
                    }}
                  >
                    <div style={{ fontWeight: 800, color: 'var(--primary-indigo)', marginBottom: '4px' }}>
                      Calendar Days Evaluation (Ref: 20-Oct-2026):
                    </div>
                    <div>
                      Return window calculation strictly uses calendar days from delivered date. Business days (Mon-Sat, excluding holidays) apply only to logistics dispatch.
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    padding: '2.5rem 1.5rem',
                    textAlign: 'center',
                    backgroundColor: 'var(--light-bg)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px dashed var(--border-medium)',
                  }}
                >
                  <Lock size={30} color="#D69A35" style={{ margin: '0 auto 0.85rem' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--primary-indigo)', marginBottom: '0.4rem' }}>
                    Customer Verification Required
                  </h3>
                  <p style={{ fontSize: '0.84rem', color: 'var(--muted-text)', maxWidth: '320px', margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
                    Under enterprise policy, itemization, refund status, and return requests require verified customer authentication.
                  </p>
                  <button
                    onClick={() => openVerifyModal(selectedOrder)}
                    className="btn-primary"
                    style={{ fontSize: '0.86rem', padding: '0.55rem 1.15rem' }}
                  >
                    Authenticate Customer ({selectedOrder.customer_id})
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ padding: '3.5rem', textAlign: 'center', color: 'var(--muted-text)' }}>
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
            backgroundColor: 'rgba(16, 14, 45, 0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1rem',
          }}
        >
          <div
            className="zm-card animate-slide-up"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '2rem',
              boxShadow: 'var(--shadow-xl)',
              backgroundColor: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <ShieldCheck size={22} color="#723ECF" />
                <h2 style={{ fontSize: '1.22rem', fontWeight: 800, color: 'var(--primary-indigo)' }}>
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

            <p style={{ fontSize: '0.86rem', color: 'var(--muted-text)', marginBottom: '1.5rem', lineHeight: 1.55 }}>
              Enter the Customer ID, registered phone number, or email associated with Order <strong>{targetOrderForVerify.order_id}</strong>.
            </p>

            {verifyError && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  backgroundColor: 'var(--error-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--error-border)',
                  color: 'var(--error)',
                  fontSize: '0.82rem',
                  marginBottom: '1.25rem',
                }}
              >
                {verifyError}
              </div>
            )}

            <form onSubmit={handleVerifySubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, color: 'var(--primary-indigo)', marginBottom: '0.45rem' }}>
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
                    padding: '0.65rem 0.95rem',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-medium)',
                    fontSize: '0.92rem',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.85rem' }}>
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
