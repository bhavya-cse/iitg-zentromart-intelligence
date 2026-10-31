import React from 'react';
import { ShieldCheck, CheckCircle2, Cpu, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-light)',
        padding: '1.75rem 3rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1540px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontSize: '0.95rem',
                fontWeight: 800,
                color: 'var(--corp-navy)',
                letterSpacing: '-0.02em',
              }}
            >
              ZentroMart
            </span>
            <span style={{ fontSize: '0.78rem', color: 'var(--muted-text)' }}>
              Intelligence Platform
            </span>
          </div>

          <span style={{ color: 'var(--border-medium)', fontSize: '0.8rem' }}>|</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
            <ShieldCheck size={14} color="#0066FF" />
            <span>VoiceOps 2026 Capstone Certified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
            <Cpu size={14} color="#0E703C" />
            <span>Multi-Turn Grounded RAG v4</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
            <Globe size={14} color="#0066FF" />
            <span>10 Indian Languages (Gnani.ai)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
          <span>Ref Date: <strong style={{ color: 'var(--corp-navy)' }}>20 Oct 2026</strong></span>
          <span>© 2026 ZentroMart Technologies. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
