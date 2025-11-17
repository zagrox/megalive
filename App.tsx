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
import Auth from './components/Auth';
import { DEFAULT_CONFIG } from './constants';
import { BotConfig, TabType } from './types';
import { fetchCrmConfig } from './services/configService';
import { client } from './services/client';
import { readMe } from '@directus/sdk';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
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

  // Check for existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Try to get current user. If this fails, the token is invalid/expired
        const user = await client.request(readMe());
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch (e) {
        // Not authenticated
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkSession();
  }, []);

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
    
    // Only load config if authenticated
    if (isAuthenticated) {
        loadCrmConfig();
    }
  }, [isAuthenticated]);

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

    // Listen for system changes
    const handleSystemChange = (e: MediaQueryListEvent) => {
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
    localStorage.setItem('theme', newIsDark ? 'dark' : 'light');
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = async () => {
    try {
      await client.logout();
    } catch (e) {
      console.error("Logout error", e);
    } finally {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={() => {
       // After login, fetch user details immediately
       client.request(readMe()).then(user => setCurrentUser(user));
       setIsAuthenticated(true);
    }} />;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 font-vazir text-right transition-colors duration-300 overflow-hidden" dir="rtl">
      
      {/* Unified Sidebar for all devices */}
      <Sidebar 
        appTitle={config.appTitle}
        appSlogan={config.appSlogan}
        appLogoUrl={config.appLogoUrl}
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isDark={isDark}
        isCollapsed={isSidebarCollapsed}
        toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Top Header */}
        <Header 
          activeTab={activeTab}
          isDark={isDark}
          toggleTheme={toggleTheme}
          user={currentUser}
          onLogout={handleLogout}
          onNavigate={setActiveTab}
          toggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        <div className="flex-1 flex overflow-hidden">
          {/* Settings Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-6 lg:p-12 pb-24 lg:pb-12">
            <div className="max-w-7xl mx-auto">
              {activeTab === 'dashboard' && (
                <Dashboard />
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
        </div>
      </main>
    </div>
  );
};

export default App;