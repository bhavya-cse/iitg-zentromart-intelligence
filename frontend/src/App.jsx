import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopNav } from './components/TopNav';
import { Overview } from './pages/Overview';
import { AISupport } from './pages/AISupport';
import { VoiceStudio } from './pages/VoiceStudio';
import { KnowledgeBase } from './pages/KnowledgeBase';
import { Orders } from './pages/Orders';
import { SupportTickets } from './pages/SupportTickets';
import { Analytics } from './pages/Analytics';
import { Settings } from './pages/Settings';
import { api } from './services/api';

export function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState(null);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const s = await api.getHealth();
        setSystemStatus(s);
      } catch (e) {
        // quiet fallback
      }
    };
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'overview':
        return <Overview onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'ai-support':
        return <AISupport onNavigateToVoice={() => setCurrentTab('voice-studio')} />;
      case 'voice-studio':
        return <VoiceStudio />;
      case 'knowledge-base':
        return <KnowledgeBase />;
      case 'orders':
        return <Orders />;
      case 'tickets':
        return <SupportTickets />;
      case 'analytics':
        return <Analytics onNavigateToEval={() => setCurrentTab('analytics')} />;
      case 'settings':
        return <Settings />;
      default:
        return <Overview onNavigate={(tab) => setCurrentTab(tab)} />;
    }
  };

  return (
    <div className="app-container">
      {/* Collapsible Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          setMobileMenuOpen(false);
        }}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        systemStatus={systemStatus}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <TopNav
          currentTab={currentTab}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          systemStatus={systemStatus}
        />
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

export default App;
