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
  Sparkles,
  X,
} from 'lucide-react';
import { Logo } from './Logo';

export const NAV_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard, section: 'core', badge: null },
  { id: 'ai-support', label: 'AI Support', icon: MessageSquare, section: 'conversational', badge: 'RAG v4' },
  { id: 'voice-studio', label: 'Voice Studio', icon: Mic, section: 'conversational', badge: 'Gnani' },
  { id: 'knowledge-base', label: 'Knowledge Base', icon: BookOpen, section: 'operations', badge: '44 chunks' },
  { id: 'orders', label: 'Orders', icon: Package, section: 'operations', badge: null },
  { id: 'tickets', label: 'Support Tickets', icon: LifeBuoy, section: 'operations', badge: null },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, section: 'intelligence', badge: null },
  { id: 'settings', label: 'Settings', icon: Settings, section: 'intelligence', badge: null },
];

export function Sidebar({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  systemStatus,
  mobileOpen = false,
  onCloseMobile,
}) {
  const sections = [
    { id: 'core', label: 'Workspace' },
    { id: 'conversational', label: 'AI & Speech' },
    { id: 'operations', label: 'Operations & Data' },
    { id: 'intelligence', label: 'Analytics & Config' },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(16, 14, 45, 0.45)',
            backdropFilter: 'blur(3px)',
            zIndex: 90,
          }}
        />
      )}

      <aside
        className={`app-sidebar ${mobileOpen ? 'mobile-open' : ''}`}
        style={{
          width: collapsed ? '72px' : '268px',
          backgroundColor: '#FFFFFF',
          borderRight: '1px solid var(--border-light)',
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          transition: 'width 220ms cubic-bezier(0.16, 1, 0.3, 1), transform 220ms cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
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
              className="btn-ghost"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--muted-text)',
              }}
            >
              <ChevronLeft size={16} />
            </button>
          )}
        </div>

        {/* Collapsed Expand Toggle */}
        {collapsed && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px 0' }}>
            <button
              onClick={onToggleCollapse}
              aria-label="Expand sidebar"
              className="btn-ghost"
              style={{
                padding: '6px',
                borderRadius: 'var(--radius-xs)',
                color: 'var(--muted-text)',
              }}
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
            gap: '16px',
            overflowY: 'auto',
          }}
        >
          {sections.map((section) => {
            const items = NAV_ITEMS.filter((item) => item.section === section.id);
            if (!items.length) return null;

            return (
              <div key={section.id} style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                {!collapsed && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      color: 'var(--subtle-text)',
                      padding: '4px 10px 6px 10px',
                    }}
                  >
                    {section.label}
                  </span>
                )}

                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentTab === item.id;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onSelectTab(item.id);
                        if (onCloseMobile) onCloseMobile();
                      }}
                      title={collapsed ? item.label : undefined}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '11px',
                        width: '100%',
                        padding: collapsed ? '10px 0' : '8px 12px',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: isActive ? 'var(--soft-violet)' : 'transparent',
                        color: isActive ? 'var(--accent-violet)' : 'var(--primary-indigo)',
                        border: isActive
                          ? '1px solid rgba(114, 62, 207, 0.22)'
                          : '1px solid transparent',
                        fontWeight: isActive ? 700 : 500,
                        fontSize: '0.88rem',
                        position: 'relative',
                        cursor: 'pointer',
                        transition: 'all var(--transition-fast)',
                        outline: 'none',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'var(--surface-subtle)';
                          e.currentTarget.style.color = 'var(--accent-violet)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.backgroundColor = 'transparent';
                          e.currentTarget.style.color = 'var(--primary-indigo)';
                        }
                      }}
                    >
                      {/* Active indicator bar */}
                      {isActive && (
                        <div
                          style={{
                            position: 'absolute',
                            left: '0px',
                            width: '3.5px',
                            height: '18px',
                            borderRadius: '0 3px 3px 0',
                            backgroundColor: 'var(--accent-violet)',
                          }}
                        />
                      )}

                      <Icon
                        size={17}
                        style={{
                          color: isActive ? 'var(--accent-violet)' : 'var(--muted-text)',
                          flexShrink: 0,
                          transition: 'color var(--transition-fast)',
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
                            fontSize: '0.64rem',
                            fontWeight: 700,
                            padding: '1px 6px',
                            borderRadius: 'var(--radius-xs)',
                            backgroundColor: isActive ? '#FFFFFF' : 'var(--soft-violet-subtle)',
                            color: 'var(--accent-violet)',
                            border: '1px solid rgba(114, 62, 207, 0.2)',
                            letterSpacing: '0.02em',
                          }}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* System Telemetry Status Footer */}
        <div
          style={{
            padding: collapsed ? '12px 8px' : '14px 16px',
            borderTop: '1px solid var(--border-light)',
            backgroundColor: 'var(--light-bg)',
          }}
        >
          {!collapsed ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span
                    className="pulse-indicator"
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: systemStatus?.all_healthy ? 'var(--success)' : 'var(--warning)',
                    }}
                  />
                  <span style={{ fontSize: '0.76rem', color: 'var(--primary-indigo)', fontWeight: 700 }}>
                    {systemStatus?.all_healthy ? 'Engine Operational' : 'Telemetry Active'}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '0.68rem',
                    color: 'var(--accent-violet)',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                    backgroundColor: 'var(--soft-violet)',
                    padding: '1px 6px',
                    borderRadius: 'var(--radius-xs)',
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
                  gap: '5px',
                }}
              >
                <ShieldCheck size={13} color="#723ECF" />
                <span>VoiceOps 2026 Grounded RAG</span>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <span
                className="pulse-indicator"
                title="Operational Status"
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: systemStatus?.all_healthy ? 'var(--success)' : 'var(--warning)',
                  display: 'inline-block',
                }}
              />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
