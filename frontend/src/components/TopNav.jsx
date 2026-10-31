import React from 'react';
import {
  Bell,
  Menu,
  ShieldCheck,
  Radio,
  Calendar,
  Sparkles,
  Search,
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

export function TopNav({ currentTab, onOpenMobileMenu, systemStatus }) {
  const currentNav = NAV_ITEMS.find((n) => n.id === currentTab) || NAV_ITEMS[0];
  const Icon = currentNav.icon;

  return (
    <header
      style={{
        height: '70px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.25rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left: Breadcrumbs & Section Identity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={onOpenMobileMenu}
          aria-label="Toggle navigation menu"
          className="btn-ghost mobile-menu-btn"
          style={{
            padding: '7px',
            color: 'var(--primary-indigo)',
          }}
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--soft-violet)',
              border: '1px solid rgba(114, 62, 207, 0.22)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-violet)',
            }}
          >
            <Icon size={17} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', lineHeight: 1.1 }}>
              <span
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--muted-text)',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                ZentroMart
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--subtle-text)' }}>/</span>
              <h1
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  margin: 0,
                  color: 'var(--primary-indigo)',
                  letterSpacing: '-0.02em',
                }}
              >
                {currentNav.label}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Telemetry, Reference Date & Operator Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* RAG & Gnani Status Capsule */}
        <div
          className="telemetry-capsule"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--surface-subtle)',
            border: '1px solid var(--border-medium)',
            fontSize: '0.76rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              className="pulse-indicator"
              style={{
                width: '6.5px',
                height: '6.5px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.rag_ready ? 'var(--success)' : 'var(--warning)',
              }}
            />
            <span style={{ color: 'var(--primary-indigo)' }}>
              RAG v4: {systemStatus?.rag_ready ? 'Precedence Active' : 'Standby'}
            </span>
          </div>

          <span style={{ color: 'var(--border-medium)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              className="pulse-indicator"
              style={{
                width: '6.5px',
                height: '6.5px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.gnani_configured ? 'var(--success)' : 'var(--warning)',
              }}
            />
            <span style={{ color: 'var(--primary-indigo)' }}>
              Gnani STT/TTS: {systemStatus?.gnani_configured ? 'Ready' : 'Setup Required'}
            </span>
          </div>
        </div>

        {/* Capstone Baseline Reference Date */}
        <div
          title="VoiceOps Fixed Reference Date Baseline"
          style={{
            fontSize: '0.76rem',
            color: 'var(--muted-text)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-card)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 500,
          }}
        >
          <Calendar size={13} color="#723ECF" />
          <span>Ref:</span>
          <strong style={{ color: 'var(--primary-indigo)', fontFamily: 'var(--font-mono)' }}>20 Oct 2026</strong>
        </div>

        {/* Operator Profile */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            paddingLeft: '0.75rem',
            borderLeft: '1px solid var(--border-light)',
          }}
        >
          <div
            style={{
              width: '34px',
              height: '34px',
              borderRadius: 'var(--radius-sm)',
              background: 'linear-gradient(135deg, #17143F 0%, #723ECF 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.82rem',
              boxShadow: '0 2px 6px rgba(23, 20, 63, 0.2)',
            }}
          >
            OP
          </div>
          <div className="operator-text" style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--primary-indigo)' }}>
              VoiceOps Admin
            </span>
            <span style={{ fontSize: '0.7rem', color: 'var(--muted-text)', fontWeight: 500 }}>
              Level 3 Support
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
