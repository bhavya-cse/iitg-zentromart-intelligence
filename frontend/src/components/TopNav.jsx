import React from 'react';
import {
  Bell,
  Menu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  User,
  Sparkles,
  Search,
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

export function TopNav({ currentTab, onOpenMobileMenu, systemStatus }) {
  const currentNav = NAV_ITEMS.find((n) => n.id === currentTab) || NAV_ITEMS[0];

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left: Mobile trigger & Current Section Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileMenu}
          aria-label="Toggle mobile navigation"
          className="mobile-only"
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: '6px',
            color: 'var(--body-text)',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'var(--soft-violet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-accent)',
            }}
          >
            <currentNav.icon size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)', fontWeight: 500 }}>
                ZentroMart
              </span>
              <span style={{ fontSize: '0.78rem', color: 'var(--border-medium)' }}>/</span>
              <h1 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: 'var(--primary-indigo)' }}>
                {currentNav.label}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Service Health Pills, Notifications, Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* RAG & Gnani Status Pill */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--light-bg)',
            border: '1px solid var(--border-light)',
            fontSize: '0.75rem',
            fontWeight: 500,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '6.5px',
                height: '6.5px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.rag_ready ? '#21865B' : '#D69A35',
              }}
            />
            <span style={{ color: 'var(--body-text)' }}>RAG: {systemStatus?.rag_ready ? 'Indexed' : 'Standby'}</span>
          </div>

          <span style={{ color: 'var(--border-medium)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <span
              style={{
                width: '6.5px',
                height: '6.5px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.gnani_configured ? '#21865B' : '#D69A35',
              }}
            />
            <span style={{ color: 'var(--body-text)' }}>
              Gnani STT/TTS: {systemStatus?.gnani_configured ? 'Active' : 'Key Req.'}
            </span>
          </div>
        </div>

        {/* Reference Date Badge */}
        <div
          title="VoiceOps 2026 Reference Date"
          style={{
            fontSize: '0.74rem',
            color: 'var(--muted-text)',
            fontFamily: 'var(--font-mono)',
            backgroundColor: 'var(--surface-white)',
            border: '1px solid var(--border-light)',
            padding: '0.3rem 0.6rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
          }}
        >
          <span>Ref:</span>
          <strong style={{ color: 'var(--primary-indigo)' }}>20 Oct 2026</strong>
        </div>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            padding: '8px',
            borderRadius: '8px',
            color: 'var(--muted-text)',
            border: '1px solid var(--border-light)',
            backgroundColor: 'var(--surface-white)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="Notifications"
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary-indigo)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-text)')}
        >
          <Bell size={17} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: '#723ECF',
            }}
          />
        </button>

        {/* Operator Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            paddingLeft: '0.5rem',
            borderLeft: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #17143F 0%, #723ECF 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '0.82rem',
              boxShadow: '0 2px 6px rgba(114, 62, 207, 0.25)',
            }}
          >
            OP
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--primary-indigo)' }}>
              VoiceOps Admin
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)' }}>
              Level 3 Support
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
