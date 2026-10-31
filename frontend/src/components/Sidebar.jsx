import React from 'react';
import {
  LayoutDashboard,
  MessageSquare,
  Mic,
  BookOpen,
  Package,
  LifeBuoy,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { Logo } from './Logo';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, badge: null },
  { id: 'ai-support', label: 'AI Support', icon: MessageSquare, badge: 'RAG' },
  { id: 'voice-studio', label: 'Voice Studio', icon: Mic, badge: 'Gnani' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, badge: null },
  { id: 'orders', label: 'Orders', icon: Package, badge: null },
  { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy, badge: null },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, badge: null },
];

export function Sidebar({ currentTab, onSelectTab, collapsed, onToggleCollapse, systemStatus }) {
  return (
    <aside
      style={{
        width: collapsed ? '72px' : '265px',
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid var(--border-light)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 200ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
        boxShadow: 'var(--shadow-xs)',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '72px',
          padding: collapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--border-light)',
        }}
      >
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            style={{
              color: 'var(--muted-text)',
              padding: '6px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--corp-navy)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-text)')}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            style={{
              color: 'var(--muted-text)',
              padding: '6px',
              borderRadius: '4px',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--corp-navy)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--muted-text)')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? '14px 8px' : '16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
          overflowY: 'auto',
        }}
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: collapsed ? '10px 0' : '9px 12px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '6px',
                backgroundColor: isActive ? 'var(--accent-blue-subtle)' : 'transparent',
                color: isActive ? 'var(--accent-blue)' : 'var(--corp-navy)',
                border: isActive
                  ? '1px solid rgba(0, 102, 255, 0.25)'
                  : '1px solid transparent',
                fontWeight: isActive ? 700 : 500,
                fontSize: '0.88rem',
                position: 'relative',
                transition: 'all 140ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'var(--bg-slate)';
                  e.currentTarget.style.color = 'var(--corp-navy)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'var(--corp-navy)';
                }
              }}
            >
              {/* Active blue indicator pill */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: '0px',
                    width: '3.5px',
                    height: '20px',
                    borderRadius: '0 3px 3px 0',
                    backgroundColor: 'var(--accent-blue)',
                  }}
                />
              )}

              <Icon
                size={18}
                style={{
                  color: isActive ? 'var(--accent-blue)' : 'var(--muted-text)',
                  flexShrink: 0,
                }}
              />

              {!collapsed && (
                <span
                  style={{
                    flex: 1,
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '3px',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--accent-blue)',
                    border: '1px solid rgba(0, 102, 255, 0.3)',
                    letterSpacing: '0.02em',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* System Status Footer */}
      <div
        style={{
          padding: collapsed ? '12px 8px' : '14px 16px',
          borderTop: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-neutral)',
        }}
      >
        {!collapsed ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '7px',
                    height: '7px',
                    borderRadius: '50%',
                    backgroundColor: systemStatus?.all_healthy ? '#0E703C' : '#C28B00',
                  }}
                />
                <span style={{ fontSize: '0.76rem', color: 'var(--corp-navy)', fontWeight: 700 }}>
                  {systemStatus?.all_healthy ? 'Engine Operational' : 'Telemetry Active'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.7rem',
                  color: 'var(--muted-text)',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 600,
                }}
              >
                v2026.1
              </span>
            </div>

            <div
              style={{
                fontSize: '0.72rem',
                color: 'var(--muted-text)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={13} color="#0066FF" />
              <span>VoiceOps FTTT Certified</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              title="Operational Status"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.all_healthy ? '#0E703C' : '#C28B00',
                display: 'inline-block',
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
