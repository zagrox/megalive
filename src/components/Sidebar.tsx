import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Settings, Palette, Database, Puzzle, Rocket, ChevronLeft, Box, Bot, ChevronDown, Check, Plus } from 'lucide-react';
import { TabType, Chatbot } from '../types';

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
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isCollapsed,
  toggleCollapse,
  appTitle = 'Mega Live AI',
  appSlogan = 'نسخه ۱.۰.۰',
  appLogoUrl,
  chatbots,
  selectedChatbot,
  onSelectChatbot,
  onCreateChatbot
}) => {
  const [isBotDropdownOpen, setIsBotDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
    { id: 'general', label: 'تنظیمات عمومی', icon: <Settings size={20} /> },
    { id: 'appearance', label: 'ظاهر چت‌بات', icon: <Palette size={20} /> },
    { id: 'knowledge', label: 'پایگاه دانش', icon: <Database size={20} /> },
    { id: 'integrations', label: 'اتصال افزونه‌ها', icon: <Puzzle size={20} /> },
    { id: 'deploy', label: 'انتشار آنلاین', icon: <Rocket size={20} /> },
  ];

  return (
    <div className={`
      relative h-screen z-40
      bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
      transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
      flex flex-col flex-shrink-0
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      
      {/* Toggle Button (Visible on all devices - On Border) */}
      <button 
        onClick={toggleCollapse}
        className={`
          flex absolute -left-3 top-6 z-50
          w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-full items-center justify-center
          text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
          shadow-sm transition-transform duration-300
        `}
      >
        <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Header */}
      <div className={`p-4 flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 h-[65px] ${isCollapsed ? 'justify-center' : ''}`}>
        {appLogoUrl ? (
           <div className="w-9 h-9 rounded-lg overflow-hidden shadow-lg shadow-blue-600/20 flex-shrink-0 bg-white dark:bg-gray-800 p-0.5">
              <img 
                src={appLogoUrl} 
                alt="App Logo" 
                className="w-full h-full object-contain dark:invert" 
                referrerPolicy="no-referrer"
              />
           </div>
        ) : (
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 flex-shrink-0">
            <Box size={22} />
          </div>
        )}
        <div className={`transition-opacity duration-200 overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
          <h1 className="text-lg font-bold text-gray-800 dark:text-white text-base whitespace-nowrap">{appTitle}</h1>
          <p className="text-[10px] text-gray-500 dark:text-gray-400 whitespace-nowrap">{appSlogan}</p>
        </div>
      </div>

      {/* Chatbot Selector */}
      <div className="px-3 pt-3 pb-1 relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsBotDropdownOpen(!isBotDropdownOpen)}
            className={`w-full flex items-center gap-2 p-2 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-blue-400 dark:hover:border-blue-600 transition-all ${isBotDropdownOpen ? 'ring-2 ring-blue-100 dark:ring-blue-900 border-blue-400' : ''} bg-gray-50 dark:bg-gray-800/50 ${isCollapsed ? 'justify-center aspect-square p-0' : ''}`}
          >
              <div className={`w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 flex-shrink-0`}>
                <Bot size={18} />
              </div>
              
              {!isCollapsed && (
                  <>
                    <div className="flex flex-col items-start overflow-hidden flex-1 min-w-0">
                        <span className="text-[10px] text-gray-400 font-medium">چت‌بات فعال</span>
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-200 truncate w-full text-right">
                            {selectedChatbot?.chatbot_name || 'انتخاب...'}
                        </span>
                    </div>
                    <ChevronDown size={14} className={`text-gray-400 flex-shrink-0 transition-transform ${isBotDropdownOpen ? 'rotate-180' : ''}`} />
                  </>
              )}
          </button>

          {/* Dropdown Menu */}
          {isBotDropdownOpen && (
              <div className={`absolute z-50 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-fade-in mt-2
                 ${isCollapsed ? 'right-full -mr-2 top-0 w-56 ml-3 origin-top-right' : 'left-3 right-3 origin-top'}
              `}>
                  <div className="py-1 max-h-60 overflow-y-auto custom-scrollbar">
                      {chatbots.length > 0 ? chatbots.map(bot => (
                          <button 
                              key={bot.id}
                              onClick={() => { onSelectChatbot(bot); setIsBotDropdownOpen(false); }}
                              className="w-full text-right px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-2 transition-colors"
                          >
                              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${bot.chatbot_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                              <span className={`text-sm truncate flex-1 ${selectedChatbot?.id === bot.id ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>
                                  {bot.chatbot_name}
                              </span>
                              {selectedChatbot?.id === bot.id && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                          </button>
                      )) : (
                         <div className="p-3 text-xs text-gray-400 text-center">لیست خالی</div>
                      )}
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 p-2 bg-gray-50 dark:bg-gray-950">
                      <button 
                          onClick={() => { onCreateChatbot(); setIsBotDropdownOpen(false); }}
                          className="w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 border border-blue-100 dark:border-blue-900 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                          <Plus size={14} />
                          افزودن بات جدید
                      </button>
                  </div>
              </div>
          )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-3 space-y-1.5 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className={`whitespace-nowrap text-sm transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
              {item.label}
            </span>
            
            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute right-full mr-3 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                {item.label}
              </div>
            )}
          </button>
        ))}
      </nav>

      {/* Footer Actions (Storage only) */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
        
        {/* Storage Widget */}
        <div className={`bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-gray-800 dark:to-gray-800 rounded-xl border border-blue-100 dark:border-gray-700 overflow-hidden transition-all duration-300 ${isCollapsed ? 'p-2' : 'p-4'}`}>
          {!isCollapsed ? (
            <div className="overflow-hidden">
              <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-1 whitespace-nowrap">فضای ذخیره‌سازی</p>
              <div className="w-full bg-white dark:bg-gray-950 rounded-full h-2 mb-2 overflow-hidden">
                <div className="bg-blue-500 h-full rounded-full" style={{ width: '45%' }}></div>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 text-left dir-ltr whitespace-nowrap">450MB / 1GB</p>
            </div>
          ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="w-2 h-8 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden relative">
                    <div className="absolute bottom-0 w-full bg-blue-500" style={{ height: '45%' }}></div>
                </div>
                <span className="text-[10px] font-mono text-blue-600 dark:text-blue-400">45%</span>
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;