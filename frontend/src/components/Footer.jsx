import React from 'react';
import { ShieldCheck, Cpu, Globe } from 'lucide-react';

export function Footer() {
  return (
    <footer
      style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-light)',
        padding: '1.5rem 2.75rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1560px',
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
                fontSize: '0.94rem',
                fontWeight: 800,
                color: 'var(--primary-indigo)',
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
            <ShieldCheck size={14} color="#723ECF" />
            <span>VoiceOps 2026 Capstone Certified</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
            <Cpu size={14} color="#21865B" />
            <span>Multi-Turn Grounded RAG v4</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
            <Globe size={14} color="#723ECF" />
            <span>10 Indian Regional Languages (Gnani.ai)</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', fontSize: '0.74rem', color: 'var(--muted-text)' }}>
          <span>Ref Baseline: <strong style={{ color: 'var(--primary-indigo)' }}>20 Oct 2026</strong></span>
          <span>© 2026 ZentroMart Technologies. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
