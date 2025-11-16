import React from 'react';
import { Settings, Palette, Database, Rocket, Box, Moon, Sun, ChevronLeft } from 'lucide-react';
import { TabType } from '../types';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDark: boolean;
  toggleTheme: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  isDark, 
  toggleTheme,
  isCollapsed,
  toggleCollapse,
}) => {
  const menuItems: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'general', label: 'تنظیمات عمومی', icon: <Settings size={20} /> },
    { id: 'appearance', label: 'ظاهر چت‌بات', icon: <Palette size={20} /> },
    { id: 'knowledge', label: 'پایگاه دانش', icon: <Database size={20} /> },
    { id: 'deploy', label: 'انتشار و کد', icon: <Rocket size={20} /> },
  ];

  return (
    <div className={`
      relative h-screen
      bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800
      transition-all duration-300 ease-in-out shadow-xl lg:shadow-none
      flex flex-col flex-shrink-0
      ${isCollapsed ? 'w-20' : 'w-64'}
    `}>
      
      {/* Toggle Button (Visible on all devices - On Border) */}
      <button 
        onClick={toggleCollapse}
        className={`
          flex absolute -left-3 top-20 z-50
          w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700
          rounded-full items-center justify-center
          text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400
          shadow-sm transition-transform duration-300
        `}
      >
        <ChevronLeft size={14} className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
      </button>

      {/* Header */}
      <div className={`p-4 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800 h-[73px] ${isCollapsed ? 'justify-center' : ''}`}>
        <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-blue-600/20 flex-shrink-0">
          <Box size={24} />
        </div>
        <div className={`transition-opacity duration-200 overflow-hidden ${isCollapsed ? 'hidden' : 'block'}`}>
          <h1 className="font-bold text-gray-800 dark:text-white text-lg whitespace-nowrap">بات ساز N8N</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">نسخه ۱.۰.۰</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-2 lg:p-4 space-y-2 overflow-y-auto overflow-x-hidden">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              // Optional: Auto-collapse on mobile after selection if desired, but keeping user control is often better.
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
              activeTab === item.id
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-semibold shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
            } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <div className="flex-shrink-0">{item.icon}</div>
            <span className={`whitespace-nowrap transition-all duration-200 ${isCollapsed ? 'hidden' : 'block'}`}>
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

      {/* Footer Actions */}
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

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${isCollapsed ? 'justify-center p-3' : 'justify-between px-4 py-3'}`}
        >
          <span className={`text-sm font-medium whitespace-nowrap ${isCollapsed ? 'hidden' : 'block'}`}>حالت شب</span>
          {isDark ? <Moon size={18} className="text-blue-400 flex-shrink-0" /> : <Sun size={18} className="text-orange-400 flex-shrink-0" />}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;