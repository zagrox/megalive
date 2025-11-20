

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
import CreateBot from './components/sections/CreateBot';
import ManageBots from './components/sections/ManageBots';
import ChatPreview from './components/ChatPreview';
import Login from './components/Login';
import { DEFAULT_CONFIG } from './constants';
import { BotConfig, TabType, Chatbot } from './types';
import { fetchCrmConfig } from './services/configService';
import { fetchUserChatbots, createChatbot, updateChatbot } from './services/chatbotService';
import { useAuth } from './context/AuthContext';
import { getAssetUrl } from './services/directus';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  
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

  // Theme Logic
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const applyTheme = () => {
      const saved = localStorage.getItem('theme');
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

    applyTheme();

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

  // Load configuration from CRM only when authenticated
  useEffect(() => {
    if (user?.id) {
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

      const loadChatbots = async () => {
        const bots = await fetchUserChatbots();
        setChatbots(bots);
        if (bots.length > 0) {
           // Try to restore selection or default to first
           const savedId = localStorage.getItem('selectedChatbotId');
           const savedBot = savedId ? bots.find(b => b.id === Number(savedId)) : null;
           setSelectedChatbot(savedBot || bots[0]);
        } else {
           // No chatbots found (new user), redirect to creation page
           setActiveTab('create-bot');
        }
      };
      loadChatbots();
    }
  }, [user?.id]);

  // Sync selected chatbot to preview config
  useEffect(() => {
    if (selectedChatbot) {
      setConfig(prev => ({
        ...prev,
        name: selectedChatbot.chatbot_name || prev.name,
        description: selectedChatbot.chabot_title || prev.description, // Mapping typo field
        systemInstruction: selectedChatbot.chatbot_prompt || prev.systemInstruction,
        welcomeMessage: selectedChatbot.chatbot_welcome || prev.welcomeMessage,
        n8nWebhookUrl: selectedChatbot.chatbot_webhook || prev.n8nWebhookUrl,
        logoUrl: selectedChatbot.chatbot_logo ? getAssetUrl(selectedChatbot.chatbot_logo) : prev.logoUrl,
        primaryColor: selectedChatbot.chatbot_color || prev.primaryColor,
        chatInputPlaceholder: selectedChatbot.chatbot_input || prev.chatInputPlaceholder,
        isActive: selectedChatbot.chatbot_active ?? prev.isActive,
        suggestions: selectedChatbot.chatbot_suggestion || prev.suggestions,
      }));
    }
  }, [selectedChatbot]);

  const handleSelectChatbot = (bot: Chatbot) => {
    setSelectedChatbot(bot);
    localStorage.setItem('selectedChatbotId', String(bot.id));
  };

  const handleCreateChatbot = async () => {
    setActiveTab('create-bot');
  };

  const handleSubmitCreateChatbot = async (name: string, slug: string) => {
    const newBot = await createChatbot(name, slug);
    if (newBot) {
      setChatbots(prev => [newBot, ...prev]);
      handleSelectChatbot(newBot);
      setActiveTab('general');
    }
    return newBot;
  };

  const handleUpdateChatbot = async (id: number, data: Partial<Chatbot>) => {
    const updatedBot = await updateChatbot(id, data);
    if (updatedBot) {
      const newBots = chatbots.map(b => b.id === id ? updatedBot : b);
      setChatbots(newBots);
      if (selectedChatbot?.id === id) {
        setSelectedChatbot(updatedBot);
      }
    }
  };

  const handlePreviewUpdate = (data: Partial<Chatbot>) => {
    setConfig(prev => ({
      ...prev,
      name: data.chatbot_name !== undefined ? data.chatbot_name : prev.name,
      description: data.chabot_title !== undefined ? data.chabot_title : prev.description,
      systemInstruction: data.chatbot_prompt !== undefined ? data.chatbot_prompt : prev.systemInstruction,
      welcomeMessage: data.chatbot_welcome !== undefined ? data.chatbot_welcome : prev.welcomeMessage,
      n8nWebhookUrl: data.chatbot_webhook !== undefined ? data.chatbot_webhook : prev.n8nWebhookUrl,
      primaryColor: data.chatbot_color !== undefined ? data.chatbot_color : prev.primaryColor,
      chatInputPlaceholder: data.chatbot_input !== undefined ? data.chatbot_input : prev.chatInputPlaceholder,
      isActive: data.chatbot_active !== undefined ? data.chatbot_active : prev.isActive,
      logoUrl: data.chatbot_logo ? getAssetUrl(data.chatbot_logo) : prev.logoUrl,
      suggestions: data.chatbot_suggestion !== undefined ? data.chatbot_suggestion : prev.suggestions,
    }));
  };

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

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!user) {
    return <Login />;
  }
  
  const showPreview = ['general', 'appearance', 'knowledge', 'integrations', 'deploy'].includes(activeTab);

  // 3. Authenticated Dashboard
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
        chatbots={chatbots}
        selectedChatbot={selectedChatbot}
        onSelectChatbot={handleSelectChatbot}
        onCreateChatbot={handleCreateChatbot}
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
                <Dashboard 
                  setActiveTab={setActiveTab}
                  selectedChatbot={selectedChatbot}
                  chatbots={chatbots}
                  onSelectChatbot={handleSelectChatbot}
                  onCreateChatbot={handleCreateChatbot}
                />
              )}
              {activeTab === 'manage-bots' && (
                <ManageBots 
                  chatbots={chatbots}
                  onUpdateChatbot={handleUpdateChatbot}
                  onSelectChatbot={handleSelectChatbot}
                  setActiveTab={setActiveTab}
                  onCreateChatbot={handleCreateChatbot}
                />
              )}
              
              {/* Container for Centered Pages */}
              {['general', 'appearance', 'knowledge', 'integrations', 'deploy', 'profile', 'create-bot'].includes(activeTab) && (
                  <div className={`mx-auto ${activeTab === 'profile' ? 'max-w-5xl' : activeTab === 'create-bot' ? 'max-w-2xl' : 'max-w-3xl'}`}>
                    {activeTab === 'create-bot' && (
                      <CreateBot 
                        onSubmit={handleSubmitCreateChatbot} 
                        onCancel={chatbots.length > 0 ? () => setActiveTab('dashboard') : undefined} 
                      />
                    )}
                    {activeTab === 'general' && (
                      <GeneralSettings 
                        selectedChatbot={selectedChatbot} 
                        onUpdateChatbot={handleUpdateChatbot} 
                        onPreviewUpdate={handlePreviewUpdate}
                      />
                    )}
                    {activeTab === 'appearance' && (
                      <AppearanceSettings 
                        selectedChatbot={selectedChatbot} 
                        onUpdateChatbot={handleUpdateChatbot} 
                        onPreviewUpdate={handlePreviewUpdate}
                      />
                    )}
                    {activeTab === 'knowledge' && (
                      <KnowledgeBase selectedChatbot={selectedChatbot} />
                    )}
                    {activeTab === 'integrations' && (
                      <Integrations />
                    )}
                    {activeTab === 'deploy' && (
                      <Deploy selectedChatbot={selectedChatbot} />
                    )}
                    {activeTab === 'profile' && (
                      <Profile />
                    )}
                  </div>
              )}
            </div>
          </div>

          {/* Left Preview Area (Sticky) */}
          {showPreview && (
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