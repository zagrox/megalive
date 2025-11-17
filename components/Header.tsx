import React, { useState, useRef, useEffect } from 'react';
import { Bell, HelpCircle, LogOut, Moon, Search, Sun, User, ChevronDown, Menu, Settings } from 'lucide-react';
import { TabType } from '../types';

interface HeaderProps {
  activeTab: TabType;
  isDark: boolean;
  toggleTheme: () => void;
  user: any;
  onLogout: () => void;
  onNavigate: (tab: TabType) => void;
  toggleSidebar: () => void;
}

const TAB_TITLES: Record<TabType, string> = {
  dashboard: 'داشبورد',
  general: 'تنظیمات عمومی',
  appearance: 'ظاهر چت‌بات',
  knowledge: 'پایگاه دانش',
  integrations: 'افزونه‌ها',
  deploy: 'انتشار',
  profile: 'حساب کاربری',
};

const Header: React.FC<HeaderProps> = ({ 
  activeTab, 
  isDark, 
  toggleTheme, 
  user, 
  onLogout, 
  onNavigate,
  toggleSidebar
}) => {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getInitials = (firstName?: string, lastName?: string) => {
    if (firstName && lastName) return `${firstName[0]} ${lastName[0]}`;
    return <User size={20} />;
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-20 px-6 lg:px-12 flex items-center justify-between transition-colors duration-300 sticky top-0 z-20">
      
      {/* Left Section (RTL: Right) - Title & Sidebar Toggle */}
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white transition-colors">
            {TAB_TITLES[activeTab]}
          </h1>
        </div>
      </div>

      {/* Right Section (RTL: Left) - Actions & User */}
      <div className="flex items-center gap-3 lg:gap-6">
        
        {/* Desktop Actions */}
        <div className="flex items-center gap-2 lg:gap-4">
           {/* Help */}
           <button className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all hidden sm:block">
            <HelpCircle size={20} />
          </button>

          {/* Notifications */}
          <button className="p-2.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all relative">
            <Bell size={20} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-900"></span>
          </button>

          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2.5 text-gray-400 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-xl transition-all"
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="w-px h-8 bg-gray-200 dark:bg-gray-800 hidden sm:block"></div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-3 p-1.5 pr-2 pl-3 rounded-full border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-medium shadow-lg shadow-blue-500/20">
              {user ? getInitials(user.first_name, user.last_name) : <User size={18} />}
            </div>
            
            <div className="hidden md:flex flex-col items-start">
               <span className="text-sm font-bold text-gray-700 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                 {user ? `${user.first_name} ${user.last_name}` : 'کاربر مهمان'}
               </span>
               <span className="text-[10px] text-gray-400">
                 {user?.title || 'مدیر سیستم'}
               </span>
            </div>
            
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isUserMenuOpen && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xl overflow-hidden animate-fade-in z-50">
               <div className="p-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-950/50">
                  <p className="text-sm font-bold text-gray-800 dark:text-white">
                    {user ? `${user.first_name} ${user.last_name}` : 'کاربر مهمان'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate dir-ltr text-right mt-0.5">
                    {user?.email || 'guest@example.com'}
                  </p>
               </div>
               
               <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { onNavigate('profile'); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors text-right"
                  >
                    <User size={16} />
                    پروفایل کاربری
                  </button>
                  <button 
                    onClick={() => { onNavigate('general'); setIsUserMenuOpen(false); }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-xl transition-colors text-right"
                  >
                    <Settings size={16} />
                    تنظیمات
                  </button>
               </div>

               <div className="border-t border-gray-100 dark:border-gray-800 p-2">
                  <button 
                    onClick={onLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors text-right"
                  >
                    <LogOut size={16} />
                    خروج از حساب
                  </button>
               </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;