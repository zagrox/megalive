import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/sections/Dashboard';
import GeneralSettings from './components/sections/GeneralSettings';
import AppearanceSettings from './components/sections/AppearanceSettings';
import KnowledgeBase from './components/sections/KnowledgeBase';
import Integrations from './components/sections/Integrations';
import Deploy from './components/sections/Deploy';
import Profile from './components/sections/Profile';
import ChatPreview from './components/ChatPreview';
import { DEFAULT_CONFIG } from './constants';
import { BotConfig, TabType } from './types';
import { fetchCrmConfig } from './services/configService';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  
  // Initialize sidebar collapsed state based on screen width
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Initialize state based on storage or system preference
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        return saved === 'dark';
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  // Load configuration from CRM
  useEffect(() => {
    const loadCrmConfig = async () => {
      try {
        const crmConfig = await fetchCrmConfig();
        if (Object.keys(crmConfig).length > 0) {
          setConfig(prev => ({ ...prev, ...crmConfig }));
        }
      } catch (error) {
        console.error("Failed to load CRM config:", error);
      }
    };
    loadCrmConfig();
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const saved = localStorage.getItem('theme');
      // Priority: Local Storage > System Preference
      const shouldBeDark = saved 
        ? saved === 'dark' 
        : mediaQuery.matches;

      setIsDark(shouldBeDark);
      
      if (shouldBeDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    // Apply on mount
    applyTheme();

    // Listen for system changes (e.g. OS switches to night mode)
    const handleSystemChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually overridden
      if (!localStorage.getItem('theme')) {
        setIsDark(e.matches);
        if (e.matches) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    };

    mediaQuery.addEventListener('change', handleSystemChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemChange);
    };
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    // Saving to localStorage creates a manual override
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 font-vazir text-right transition-colors duration-300 overflow-hidden" dir="rtl">
      
      {/* Sidebar */}
      <Sidebar 
        appTitle={config.appTitle}
        appSlogan={config.appSlogan}
        appLogoUrl={config.appLogoUrl}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-screen">
        
        {/* Top Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />

        {/* Main Content & Preview */}
        <main className="flex-1 flex overflow-hidden relative">
          
          {/* Settings/Dashboard Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 pb-24 lg:pb-12">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <Dashboard setActiveTab={setActiveTab} />
              )}
              {activeTab !== 'dashboard' && (
                <div className="max-w-3xl mx-auto">
                  {activeTab === 'general' && (
                    <GeneralSettings config={config} setConfig={setConfig} />
                  )}
                  {activeTab === 'appearance' && (
                    <AppearanceSettings config={config} setConfig={setConfig} />
                  )}
                  {activeTab === 'knowledge' && (
                    <KnowledgeBase />
                  )}
                  {activeTab === 'integrations' && (
                    <Integrations />
                  )}
                  {activeTab === 'deploy' && (
                    <Deploy />
                  )}
                  {activeTab === 'profile' && (
                    <Profile />
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Left Preview Area (Sticky) - Only show if NOT in dashboard */}
          {activeTab !== 'dashboard' && (
            <div className="w-[400px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 h-full hidden xl:flex flex-col justify-center p-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#374151_1px,transparent_1px)] [background-size:16px_16px] transition-colors duration-300 shrink-0">
              <div className="mb-6 text-center">
                <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">پیش‌نمایش زنده</h3>
              </div>
              <div className="transform scale-[0.95] hover:scale-100 transition-transform duration-500 ease-out">
                <ChatPreview config={config} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;