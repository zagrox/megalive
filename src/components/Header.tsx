import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  HelpCircle, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Settings, 
  ChevronDown, 
  Bot 
} from 'lucide-react';
import { TabType } from '../types';
import { useAuth } from '../context/AuthContext';
import { getAssetUrl } from '../services/directus';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isDark: boolean;
  toggleTheme: () => void;
  toggleHelpCenter: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab, isDark, toggleTheme, toggleHelpCenter }) => {
  const { user, logout } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPageTitle = (tab: TabType) => {
    switch (tab) {
      case 'dashboard': return 'داشبورد';
      case 'general': return 'تنظیمات عمومی';
      case 'appearance': return 'ظاهر چت‌بات';
      case 'knowledge': return 'پایگاه دانش';
      case 'integrations': return 'افزونه‌ها و ادغام‌ها';
      case 'deploy': return 'انتشار و کد';
      case 'profile': return 'حساب کاربری';
      case 'manage-bots': return 'مدیریت چت‌بات‌ها';
      case 'create-bot': return 'ساخت ربات جدید';
      default: return 'داشبورد';
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsProfileOpen(false);
  };

  const userAvatar = user?.avatar ? getAssetUrl(user.avatar) : null;
  const fullName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email : 'کاربر مهمان';

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-20 px-6 flex items-center justify-between transition-colors duration-300 sticky top-0 z-30">
      
      {/* Left Side: Page Title */}
      <div className="hidden md:flex items-center gap-4">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white transition-colors">
          {getPageTitle(activeTab)}
        </h1>
      </div>

      {/* Right Side: Actions */}
      <div className="flex items-center gap-3 ml-auto md:ml-0">
        
        {/* Help */}
        <button 
          onClick={toggleHelpCenter}
          className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors" 
          title="راهنما"
        >
          <HelpCircle size={20} />
        </button>

        {/* Theme Toggle */}
        <button 
          onClick={toggleTheme}
          className="p-2 text-gray-500 hover:text-amber-500 dark:text-gray-400 dark:hover:text-amber-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          title={isDark ? 'حالت روز' : 'حالت شب'}
        >
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* Notifications (Optional Placeholder) */}
        <button className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative mr-1">
          <Bell size={20} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-900"></span>
        </button>

        {/* Separator */}
        <div className="w-px h-6 bg-gray-200 dark:bg-gray-700 mx-1"></div>

        {/* User Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-800 py-1.5 px-2 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 overflow-hidden">
              {userAvatar ? (
                <img src={userAvatar} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={18} />
              )}
            </div>
            
            <ChevronDown size={14} className={`text-gray-400 transition-transform duration-200 ${isProfileOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute left-0 mt-2 w-56 bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden animate-fade-in z-50">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                <p className="text-sm font-bold text-gray-800 dark:text-white">{fullName}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              </div>
              <div className="p-1">
                <button 
                  onClick={() => { setActiveTab('profile'); setIsProfileOpen(false); }}
                  className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <User size={16} className="text-gray-400" />
                  پروفایل من
                </button>
                <button 
                  onClick={() => { setActiveTab('manage-bots'); setIsProfileOpen(false); }}
                  className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Bot size={16} className="text-gray-400" />
                  ربات‌های من
                </button>
                <button 
                  onClick={() => { setActiveTab('general'); setIsProfileOpen(false); }}
                  className="w-full text-right px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg flex items-center gap-2 transition-colors"
                >
                  <Settings size={16} className="text-gray-400" />
                  تنظیمات
                </button>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-800 p-1">
                <button 
                  onClick={handleLogout}
                  className="w-full text-right px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-2 transition-colors"
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