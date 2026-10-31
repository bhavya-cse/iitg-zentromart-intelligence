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
  Radio,
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
        width: collapsed ? '72px' : '260px',
        backgroundColor: '#17143F',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 240ms cubic-bezier(0.16, 1, 0.3, 1)',
        position: 'relative',
        zIndex: 50,
        flexShrink: 0,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          height: '70px',
          padding: collapsed ? '0 16px' : '0 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
        }}
      >
        <Logo collapsed={collapsed} />
        {!collapsed && (
          <button
            onClick={onToggleCollapse}
            aria-label="Collapse sidebar"
            style={{
              color: 'rgba(237, 231, 250, 0.55)',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 231, 250, 0.55)')}
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* Collapse button when already collapsed */}
      {collapsed && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0' }}>
          <button
            onClick={onToggleCollapse}
            aria-label="Expand sidebar"
            style={{
              color: 'rgba(237, 231, 250, 0.55)',
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.04)',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#FFFFFF')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(237, 231, 250, 0.55)')}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: collapsed ? '12px 8px' : '16px 12px',
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
                borderRadius: '8px',
                backgroundColor: isActive ? 'rgba(114, 62, 207, 0.22)' : 'transparent',
                color: isActive ? '#FFFFFF' : 'rgba(237, 231, 250, 0.72)',
                border: isActive
                  ? '1px solid rgba(157, 104, 255, 0.4)'
                  : '1px solid transparent',
                fontWeight: isActive ? 600 : 500,
                fontSize: '0.9rem',
                position: 'relative',
                transition: 'all 160ms ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
                  e.currentTarget.style.color = '#FFFFFF';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'rgba(237, 231, 250, 0.72)';
                }
              }}
            >
              {/* Active left indicator pill */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    left: '0px',
                    width: '3.5px',
                    height: '18px',
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: '#9D68FF',
                  }}
                />
              )}

              <Icon
                size={18}
                style={{
                  color: isActive ? '#9D68FF' : 'rgba(237, 231, 250, 0.65)',
                  flexShrink: 0,
                }}
              />

              {!collapsed && (
                <span style={{ flex: 1, textAlign: 'left', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {item.label}
                </span>
              )}

              {!collapsed && item.badge && (
                <span
                  style={{
                    fontSize: '0.66rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(114, 62, 207, 0.35)',
                    color: '#EDE7FA',
                    border: '1px solid rgba(157, 104, 255, 0.35)',
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
          borderTop: '1px solid rgba(255, 255, 255, 0.07)',
          backgroundColor: '#100E2D',
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
                    backgroundColor: systemStatus?.all_healthy ? '#21865B' : '#D69A35',
                    boxShadow: systemStatus?.all_healthy ? '0 0 8px #21865B' : 'none',
                  }}
                />
                <span style={{ fontSize: '0.74rem', color: 'rgba(237, 231, 250, 0.85)', fontWeight: 600 }}>
                  {systemStatus?.all_healthy ? 'Engine Online' : 'Operational Status'}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  color: 'rgba(237, 231, 250, 0.45)',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                v2026.1
              </span>
            </div>

            <div
              style={{
                fontSize: '0.7rem',
                color: 'rgba(237, 231, 250, 0.55)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <ShieldCheck size={12} color="#9D68FF" />
              <span>VoiceOps FTTT Certified</span>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <span
              title="System Online"
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: systemStatus?.all_healthy ? '#21865B' : '#D69A35',
                display: 'inline-block',
              }}
            />
          </div>
        )}
      </div>
    </aside>
  );
}
