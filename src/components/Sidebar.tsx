import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Settings, Palette, Database, Puzzle, Rocket, ChevronLeft, Box, Bot, ChevronDown, Check, Plus, List, MessageSquare, BookOpenCheck, Lock, Activity, BarChart3, Milestone, User } from 'lucide-react';
import { TabType, Chatbot, Plan } from '../types';
import { User as AuthUser } from '../context/AuthContext';
import { fetchPricingPlans } from '../services/configService';
import { getAssetUrl } from '../services/directus';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  appTitle?: string;
  appSlogan?: string;
  appLogoUrl?: string;
  chatbots: Chatbot[];
  selectedChatbot: Chatbot | null;
  onSelectChatbot: (bot: Chatbot) => void;
  onCreateChatbot: () => void;
  user: AuthUser | null;
  isPlanExpired?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed, 
  toggleCollapse,
  appTitle = 'MegaLive AI',
  appSlogan = 'AI Chatbot Generator',
  appLogoUrl,
  chatbots,
  selectedChatbot,
  onSelectChatbot,
  onCreateChatbot,
  user,
  isPlanExpired = false
}) => {
  const [isBotDropdownOpen, setIsBotDropdownOpen] = useState(false);
  const [plans, setPlans] = useState<Plan[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchPricingPlans().then(data => setPlans(data));
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsBotDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'داشبورد چت‌بات', icon: <LayoutDashboard size={20} /> },
    { id: 'insights', label: 'تحلیل و آمار', icon: <BarChart3 size={20} /> },
    { id: 'general', label: 'تنظیمات عمومی', icon: <Settings size={20} /> },
    { id: 'appearance', label: 'ظاهر چت‌بات', icon: <Palette size={20} /> },
    { id: 'content-manager', label: 'مدیریت محتوا', icon: <BookOpenCheck size={20} /> },
    { id: 'knowledge', label: 'پایگاه دانش', icon: <Database size={20} /> },
    { id: 'deploy', label: 'انتشار آنلاین', icon: <Rocket size={20} /> },
    { id: 'logs', label: 'تاریخچه چت‌ها', icon: <Activity size={20} /> },
  ];

  // Calculate Message Usage
  const profile = user?.profile;
  
  // Resolve Plan Configuration
  const currentPlan = plans.find(p => 
    p.id === Number(profile?.profile_plan) || 
    (typeof profile?.profile_plan === 'object' && (profile?.profile_plan as any)?.id === p.id) ||
    String(p.plan_name || '').toLowerCase() === String(profile?.profile_plan || '').toLowerCase()
  );
  
  // Default to 100 if plan not loaded yet
  const limitMessages = currentPlan?.plan_messages || 100;
  // Ensure numeric value from profile
  const currentMessages = Number(profile?.profile_messages || 0);
  
  const usagePercent = Math.min((currentMessages / limitMessages) * 100, 100);

  return (
    <div className={`
      relative h-full z-40
      bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
      transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
      flex flex-col flex-shrink-0
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      
      {/* Toggle Button */}
      <button 
        onClick={toggleCollapse}
        className={`
          flex absolute -left-3 top-5 z-50
          w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-full items-center justify-center
          text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
          shadow-sm transition-transform duration-300
        `}
      >
        <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Header */}
      <div className={`p-4 flex items-center gap-4 border-b border-gray-200 dark:border-gray-800 h-[65px] ${isCollapsed ? 'justify-center' : ''}`}>
        {appLogoUrl ? (
           <div className="w-9 h-9 rounded-lg overflow-hidden flex-shrink-0 bg-white dark:bg-gray-800 p-0.5">
              <img 
                src={appLogoUrl} 
                alt="App Logo" 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer"
              />
           </div>
        ) : (
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 flex-shrink-0">
            <Box size={22} />
          </div>
        )}
        <div className={`transition-opacity duration-200 overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white whitespace-nowrap">{appTitle}</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{appSlogan}</p>
        </div>
      </div>

      {/* Chatbot Selector */}
      <div className="px-3 pt-3 pb-1 relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsBotDropdownOpen(!isBotDropdownOpen)}
            className={`w-full flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm shrink-0 overflow-hidden">
                {selectedChatbot?.chatbot_logo ? (
                    <img src={getAssetUrl(selectedChatbot.chatbot_logo)} alt="Bot" className="w-full h-full object-cover" />
                ) : (
                    <Bot size={18} />
                )}
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 text-right min-w-0">
                  <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{selectedChatbot?.chatbot_name || 'انتخاب ربات'}</p>
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">{selectedChatbot?.chabot_title || 'دستیار هوشمند'}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 transition-transform ${isBotDropdownOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {/* Chatbot Dropdown */}
          {!isCollapsed && isBotDropdownOpen && (
            <div className="absolute top-full left-3 right-3 mt-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in">
              <div className="max-h-60 overflow-y-auto p-1 custom-scrollbar">
                {chatbots.map((bot) => (
                  <button
                    key={bot.id}
                    onClick={() => {
                      onSelectChatbot(bot);
                      setIsBotDropdownOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-right ${selectedChatbot?.id === bot.id ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
                  >
                    <div className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center shrink-0 overflow-hidden border border-gray-100 dark:border-gray-800">
                        {bot.chatbot_logo ? (
                             <img src={getAssetUrl(bot.chatbot_logo)} alt="Bot" className="w-full h-full object-cover" />
                        ) : (
                             <Bot size={16} />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold truncate">{bot.chatbot_name}</p>
                      <p className="text-[10px] opacity-70 truncate">{bot.chabot_title}</p>
                    </div>
                    {selectedChatbot?.id === bot.id && <Check size={14} />}
                  </button>
                ))}
              </div>
              <div className="p-1 border-t border-gray-100 dark:border-gray-800">
                <button 
                  onClick={() => {
                    onCreateChatbot();
                    setIsBotDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400 transition-colors text-right"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                    <Plus size={16} />
                  </div>
                  <span className="text-xs font-bold">ساخت ربات جدید</span>
                </button>
              </div>
            </div>
          )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
        {menuItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              disabled={isPlanExpired && !['pricing', 'orders', 'profile'].includes(item.id)}
              className={`
                w-full flex items-center gap-3 p-2.5 rounded-xl transition-all group relative
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                  : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-blue-600 dark:hover:text-blue-400'
                }
                ${isCollapsed ? 'justify-center' : ''}
                ${isPlanExpired && !['pricing', 'orders', 'profile'].includes(item.id) ? 'opacity-50 cursor-not-allowed grayscale' : ''}
              `}
              title={isCollapsed ? item.label : ''}
            >
              <div className={`transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                {item.icon}
              </div>
              {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
              {isActive && !isCollapsed && (
                <div className="absolute left-2 w-1.5 h-1.5 bg-white rounded-full"></div>
              )}
              {isPlanExpired && !['pricing', 'orders', 'profile'].includes(item.id) && !isCollapsed && (
                <Lock size={12} className="mr-auto text-gray-400" />
              )}
            </button>
          );
        })}
      </div>

      {/* Usage Indicator */}
      {!isCollapsed && (
        <div className="p-4 mx-3 mb-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
               <MessageSquare size={14} />
               <span className="text-[10px] font-bold">مصرف پیام</span>
            </div>
            <span className="text-[10px] font-mono text-gray-500">{currentMessages} / {limitMessages}</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
            <div 
                className={`h-full rounded-full transition-all duration-1000 ${usagePercent > 90 ? 'bg-red-500' : usagePercent > 70 ? 'bg-amber-500' : 'bg-blue-500'}`} 
                style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          {usagePercent > 80 && (
             <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-2 font-medium">نزدیک به سقف مجاز پیام</p>
          )}
        </div>
      )}

      {/* User Status / Footer */}
      <div className={`p-4 border-t border-gray-100 dark:border-gray-800 ${isCollapsed ? 'flex justify-center' : ''}`}>
         <div className={`flex items-center gap-3 ${isCollapsed ? '' : 'bg-gray-50 dark:bg-gray-800/30 p-2 rounded-xl border border-gray-100 dark:border-gray-800'}`}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
               <User size={18} />
            </div>
            {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-gray-800 dark:text-white truncate">{user?.first_name || 'کاربر'} {user?.last_name || ''}</p>
                    <p className="text-[9px] text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
                </div>
            )}
         </div>
      </div>
    </div>
  );
};

// FIX: Added the missing default export for Sidebar component
export default Sidebar;
