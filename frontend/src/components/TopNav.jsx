import React from 'react';
import {
  Bell,
  Menu,
  CheckCircle2,
  AlertCircle,
  Radio,
  Search,
  ExternalLink,
} from 'lucide-react';
import { NAV_ITEMS } from './Sidebar';

export function TopNav({ currentTab, onOpenMobileMenu, systemStatus }) {
  const currentNav = NAV_ITEMS.find((n) => n.id === currentTab) || NAV_ITEMS[0];
  const Icon = currentNav.icon;

  return (
    <header
      style={{
        height: '72px',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 2.5rem',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Left: Section Identity & Enterprise Breadcrumbs */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <button
          onClick={onOpenMobileMenu}
          aria-label="Toggle navigation menu"
          style={{
            display: 'none',
            padding: '8px',
            borderRadius: '4px',
            color: 'var(--corp-navy)',
          }}
          className="mobile-trigger"
        >
          <Menu size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              backgroundColor: 'var(--accent-blue-subtle)',
              border: '1px solid rgba(0, 102, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-blue)',
            }}
          >
            <Icon size={18} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', lineHeight: 1 }}>
              <span style={{ fontSize: '0.74rem', color: 'var(--muted-text)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                ZentroMart Enterprise
              </span>
              <span style={{ fontSize: '0.74rem', color: 'var(--border-medium)' }}>/</span>
              <h1 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: 'var(--corp-navy)', letterSpacing: '-0.02em' }}>
                {currentNav.label}
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* Right: Live Telemetry, Reference Date & Operator Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* RAG & Gnani Service Pills */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: 'var(--bg-slate)',
            border: '1px solid var(--border-light)',
            fontSize: '0.76rem',
            fontWeight: 600,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '6.5px',
                height: '6.5px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.rag_ready ? '#0E703C' : '#C28B00',
              }}
            />
            <span style={{ color: 'var(--corp-navy)' }}>
              RAG: {systemStatus?.rag_ready ? 'Indexed (v4)' : 'Standby'}
            </span>
          </div>

          <span style={{ color: 'var(--border-medium)' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span
              style={{
                width: '6.5px',
                height: '6.5px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.gnani_configured ? '#0E703C' : '#C28B00',
              }}
            />
            <span style={{ color: 'var(--corp-navy)' }}>
              Gnani Voice: {systemStatus?.gnani_configured ? 'Online' : 'Key Req.'}
            </span>
          </div>
        </div>

        {/* Capstone Reference Date */}
        <div
          title="VoiceOps Fixed Reference Date"
          style={{
            fontSize: '0.76rem',
            color: 'var(--muted-text)',
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: 500,
          }}
        >
          <span>Ref:</span>
          <strong style={{ color: 'var(--corp-navy)', fontFamily: 'var(--font-mono)' }}>20 Oct 2026</strong>
        </div>

        {/* Notifications */}
        <button
          style={{
            position: 'relative',
            padding: '8px',
            borderRadius: '6px',
            color: 'var(--corp-navy)',
            border: '1px solid var(--border-light)',
            backgroundColor: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          aria-label="System Notifications"
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
              backgroundColor: 'var(--accent-blue)',
            }}
          />
        </button>

        {/* Enterprise Operator Profile */}
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
              width: '36px',
              height: '36px',
              borderRadius: '6px',
              background: 'linear-gradient(135deg, #00122E 0%, #0066FF 100%)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '0.84rem',
              letterSpacing: '0.02em',
            }}
          >
            OP
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--corp-navy)' }}>
              VoiceOps Admin
            </span>
            <span style={{ fontSize: '0.72rem', color: 'var(--muted-text)', fontWeight: 500 }}>
              Level 3 Support
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
