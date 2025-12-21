
import React, { useState, useEffect, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './components/sections/Dashboard';
import GeneralSettings from './components/sections/GeneralSettings';
import AppearanceSettings from './components/sections/AppearanceSettings';
import KnowledgeBase from './components/sections/KnowledgeBase';
import ContentManager from './components/sections/ContentManager'; // Changed from FAQManager
import Integrations from './components/sections/Integrations';
import Deploy from './components/sections/Deploy';
import Profile from './components/sections/Profile';
import CreateBot from './components/sections/CreateBot';
import ManageBots from './components/sections/ManageBots';
import Pricing from './components/sections/Pricing';
import Checkout from './components/sections/Checkout';
import MyOrders from './components/sections/MyOrders';
import PaymentVerify from './components/sections/PaymentVerify';
import ChatPreview from './components/ChatPreview';
import Login from './components/Login';
import { DEFAULT_CONFIG } from './constants';
import { BotConfig, TabType, Chatbot, Plan } from './types';
import { fetchCrmConfig } from './services/configService';
import { fetchUserChatbots, createChatbot, updateChatbot, recalculateChatbotStats } from './services/chatbotService';
import { useAuth } from './context/AuthContext';
import { getAssetUrl } from './services/directus';
import { Loader2, AlertTriangle, Clock } from 'lucide-react';
import HelpCenterPanel from './components/HelpCenterPanel';

const App: React.FC = () => {
  const { user, loading: authLoading, refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [config, setConfig] = useState<BotConfig>(DEFAULT_CONFIG);
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<Chatbot | null>(null);
  const [isHelpCenterOpen, setIsHelpCenterOpen] = useState(false);
  
  // Checkout State
  const [checkoutPlan, setCheckoutPlan] = useState<Plan | null>(null);
  
  // Initialize sidebar collapsed state based on screen width
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024;
    }
    return false;
  });

  // Check URL params for Payment Callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      // Zibal usually sends trackId and status/success. If present, switch to verify tab.
      // Also check for explicit tab param.
      if (params.get('tab') === 'payment_verify' || params.has('trackId') || params.has('trackid')) {
        setActiveTab('payment_verify');
      } else if (params.get('tab') === 'orders') {
        setActiveTab('orders');
      }
    }
  }, []);

  // Handle responsive sidebar state on resize
  useEffect(() => {
    const handleResize = () => {
      // Automatically collapse sidebar on screens smaller than 1024px (Tablets/Mobile)
      if (window.innerWidth < 1024) {
        setIsSidebarCollapsed(true);
      }
    };

    // Attach listener
    window.addEventListener('resize', handleResize);
    
    // Check immediately on mount to enforce state
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Check Plan Expiration & Remaining Days
  const { isPlanExpired, daysRemaining } = useMemo(() => {
    if (!user?.profile?.profile_end) return { isPlanExpired: false, daysRemaining: Infinity }; 
    const endDate = new Date(user.profile.profile_end);
    const now = new Date();
    const diffTime = endDate.getTime() - now.getTime();
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
        isPlanExpired: endDate < now,
        daysRemaining: days
    };
  }, [user]);

  const isExpiringSoon = !isPlanExpired && daysRemaining <= 7 && daysRemaining >= 0;

  // Restrict Navigation if Expired
  useEffect(() => {
    if (isPlanExpired) {
      const allowedTabs: TabType[] = ['pricing', 'checkout', 'orders', 'profile', 'payment_verify'];
      // If user tries to access a restricted tab, force them to pricing
      if (!allowedTabs.includes(activeTab)) {
        setActiveTab('pricing');
      }
    }
  }, [isPlanExpired, activeTab]);

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
           // No chatbots found (new user), redirect to CREATE-BOT page first
           // User Register Funnel Step 1: Identity/Creation
           if (!isPlanExpired && activeTab !== 'payment_verify') {
             setActiveTab('create-bot');
           }
        }
      };
      loadChatbots();
    }
  }, [user?.id, isPlanExpired]);

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
        phone: selectedChatbot.chatbot_phone || prev.phone,
        instagram: selectedChatbot.chatbot_instagram || prev.instagram,
        whatsapp: selectedChatbot.chatbot_whatsapp || prev.whatsapp,
        telegram: selectedChatbot.chatbot_telegram || prev.telegram,
        address: selectedChatbot.chatbot_address || prev.address,
        location: selectedChatbot.chatbot_location || prev.location,
      }));
    }
  }, [selectedChatbot]);

  const handleSelectChatbot = (bot: Chatbot) => {
    setSelectedChatbot(bot);
    localStorage.setItem('selectedChatbotId', String(bot.id));
  };

  const handleCreateChatbot = async () => {
    if (isPlanExpired) {
        setActiveTab('pricing');
        return;
    }
    setActiveTab('create-bot');
  };

  const handleSubmitCreateChatbot = async (name: string, slug: string, businessName: string) => {
    // Detect if this is the user's very first chatbot
    const isFirstChatbot = chatbots.length === 0;
    
    const newBot = await createChatbot(name, slug, businessName);
    if (newBot) {
      setChatbots(prev => [newBot, ...prev]);
      handleSelectChatbot(newBot);
      
      // User Register Funnel Step 2: Plan Selection
      if (isFirstChatbot) {
          setActiveTab('pricing');
      } else {
          setActiveTab('general');
      }
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

  const handleRefreshChatbots = async () => {
    // If a bot is selected, verify and sync its stats (LLM/Files) before fetching list
    if (selectedChatbot) {
        await recalculateChatbotStats(selectedChatbot.id);
        // Also refresh user profile to update global usage bars
        await refreshUser();
    }

    const bots = await fetchUserChatbots();
    setChatbots(bots);
    if (selectedChatbot) {
      const updatedBot = bots.find(b => b.id === selectedChatbot.id);
      if (updatedBot) setSelectedChatbot(updatedBot);
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
      phone: data.chatbot_phone !== undefined ? data.chatbot_phone : prev.phone,
      instagram: data.chatbot_instagram !== undefined ? data.chatbot_instagram : prev.instagram,
      whatsapp: data.chatbot_whatsapp !== undefined ? data.chatbot_whatsapp : prev.whatsapp,
      telegram: data.chatbot_telegram !== undefined ? data.chatbot_telegram : prev.telegram,
      address: data.chatbot_address !== undefined ? data.chatbot_address : prev.address,
      location: data.chatbot_location !== undefined ? data.chatbot_location : prev.location,
    }));
  };

  const handleSelectPlan = (plan: Plan) => {
    setCheckoutPlan(plan);
    setActiveTab('checkout');
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

  const toggleHelpCenter = () => {
    setIsHelpCenterOpen(prev => !prev);
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="fixed inset-0 w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 text-blue-600 dark:text-blue-400">
        <Loader2 className="animate-spin" size={48} />
      </div>
    );
  }

  // 2. Unauthenticated State
  if (!user) {
    return <Login />;
  }
  
  const showPreview = !isPlanExpired && ['general', 'appearance', 'knowledge', 'content-manager', 'integrations', 'deploy'].includes(activeTab);

  // 3. Authenticated Dashboard
  return (
    <div className="fixed inset-0 flex w-full bg-gray-50 dark:bg-gray-950 font-vazir text-right transition-colors duration-300 overflow-hidden" dir="rtl">
      
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
        user={user}
        isPlanExpired={isPlanExpired}
      />

      {/* Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Header */}
        <Header 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          isDark={isDark}
          toggleTheme={toggleTheme}
          toggleHelpCenter={toggleHelpCenter}
        />

        {/* Expired Banner (Blocking) */}
        {isPlanExpired && (
            <div className="bg-red-600 text-white px-4 py-2 text-center text-sm font-bold shadow-md z-20 flex items-center justify-center gap-2 flex-shrink-0 animate-fade-in">
                <AlertTriangle size={18} />
                <span>اشتراک شما به پایان رسیده است. برای دسترسی مجدد به پنل، لطفا اشتراک خود را تمدید کنید.</span>
            </div>
        )}

        {/* Warning Banner (Expiring Soon) */}
        {isExpiringSoon && (
            <div 
              className="bg-amber-500 text-white px-4 py-2 text-center text-sm font-bold shadow-md z-20 flex items-center justify-center gap-2 flex-shrink-0 animate-fade-in cursor-pointer hover:bg-amber-600 transition-colors"
              onClick={() => setActiveTab('pricing')}
            >
                <Clock size={18} />
                <span>اشتراک شما رو به پایان است ({daysRemaining} روز باقی‌مانده). جهت تمدید اشتراک کلیک کنید.</span>
            </div>
        )}

        {/* Main Content & Preview */}
        <main className="flex-1 flex relative overflow-hidden">
          
          {/* Settings/Dashboard Scrollable Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 pb-24 lg:pb-12 scroll-smooth">
            <div className="max-w-7xl mx-auto">
              {!isPlanExpired && activeTab === 'dashboard' && (
                <Dashboard 
                  setActiveTab={setActiveTab}
                  selectedChatbot={selectedChatbot}
                  onRefresh={handleRefreshChatbots}
                />
              )}
              {!isPlanExpired && activeTab === 'manage-bots' && (
                <ManageBots 
                  chatbots={chatbots}
                  onUpdateChatbot={handleUpdateChatbot}
                  onSelectChatbot={handleSelectChatbot}
                  setActiveTab={setActiveTab}
                  onCreateChatbot={handleCreateChatbot}
                />
              )}
              
              {/* Container for Centered Pages */}
              {/* Note: Tabs are filtered by logic above, but we also ensure they don't render if expired unless allowed */}
              {['general', 'appearance', 'knowledge', 'content-manager', 'integrations', 'deploy', 'profile', 'create-bot', 'pricing', 'checkout', 'orders', 'payment_verify'].includes(activeTab) && (
                  <div className={`mx-auto ${activeTab === 'profile' || activeTab === 'pricing' || activeTab === 'checkout' || activeTab === 'orders' || activeTab === 'payment_verify' ? 'max-w-5xl' : activeTab === 'create-bot' ? 'max-w-2xl' : 'max-w-3xl'}`}>
                    
                    {!isPlanExpired && activeTab === 'create-bot' && (
                      <CreateBot 
                        onSubmit={handleSubmitCreateChatbot} 
                        onCancel={chatbots.length > 0 ? () => setActiveTab('dashboard') : undefined} 
                        currentChatbotCount={chatbots.length}
                        onShowPricing={() => setActiveTab('pricing')}
                      />
                    )}
                    {!isPlanExpired && activeTab === 'general' && (
                      <GeneralSettings 
                        selectedChatbot={selectedChatbot} 
                        onUpdateChatbot={handleUpdateChatbot} 
                        onPreviewUpdate={handlePreviewUpdate}
                      />
                    )}
                    {!isPlanExpired && activeTab === 'appearance' && (
                      <AppearanceSettings 
                        selectedChatbot={selectedChatbot} 
                        onUpdateChatbot={handleUpdateChatbot} 
                        onPreviewUpdate={handlePreviewUpdate}
                      />
                    )}
                    {!isPlanExpired && activeTab === 'knowledge' && (
                      <KnowledgeBase 
                        selectedChatbot={selectedChatbot} 
                        onUpdateChatbot={handleUpdateChatbot}
                      />
                    )}
                    {!isPlanExpired && activeTab === 'content-manager' && (
                      <ContentManager 
                        selectedChatbot={selectedChatbot} 
                      />
                    )}
                    {!isPlanExpired && activeTab === 'integrations' && (
                      <Integrations />
                    )}
                    {!isPlanExpired && activeTab === 'deploy' && (
                      <Deploy selectedChatbot={selectedChatbot} />
                    )}
                    
                    {/* Allowed Tabs even when Expired */}
                    {activeTab === 'profile' && (
                      <Profile />
                    )}
                    {activeTab === 'pricing' && (
                      <Pricing onSelectPlan={handleSelectPlan} />
                    )}
                    {activeTab === 'checkout' && (
                      <Checkout 
                        plan={checkoutPlan} 
                        onBack={() => setActiveTab('pricing')} 
                        onSuccess={() => setActiveTab('orders')}
                      />
                    )}
                    {activeTab === 'orders' && (
                      <MyOrders 
                        onRenew={() => setActiveTab('pricing')}
                      />
                    )}
                    {activeTab === 'payment_verify' && (
                      <PaymentVerify onContinue={() => setActiveTab('orders')} />
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
              <div className="transition-transform duration-500 ease-out">
                <ChatPreview config={config} />
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Help Center Panel */}
      <HelpCenterPanel isOpen={isHelpCenterOpen} onClose={() => setIsHelpCenterOpen(false)} />
    </div>
  );
};

export default App;
