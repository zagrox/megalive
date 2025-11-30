
import React, { useState, useEffect } from 'react';
import { 
    Activity, Zap, Users, Server, ArrowUpRight, Palette, Settings, Database, Rocket, Puzzle, ArrowLeft,
    MessageSquare, Send, Table, LayoutTemplate, Mail, Phone, Bot, RefreshCw
} from 'lucide-react';
import { TabType, Chatbot } from '../../types';
import { getAssetUrl } from '../../services/directus';

interface DashboardProps {
  setActiveTab: (tab: TabType) => void;
  selectedChatbot: Chatbot | null;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  setActiveTab,
  selectedChatbot,
}) => {
  const [stats, setStats] = useState({
    conversations: 1248,
    tokens: 842000,
    users: 3502,
  });
  const [loading, setLoading] = useState(false);

  const fetchStats = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setStats({
        conversations: Math.floor(Math.random() * 500) + 1000,
        tokens: Math.floor(Math.random() * 200000) + 800000,
        users: Math.floor(Math.random() * 200) + 3500,
      });
      setLoading(false);
    }, 1000);
  };

  // Fetch stats when component mounts (i.e., when navigating to the tab)
  useEffect(() => {
    fetchStats();
  }, [selectedChatbot]); // Re-fetch if the selected chatbot changes

  const logoUrl = selectedChatbot?.chatbot_logo ? getAssetUrl(selectedChatbot.chatbot_logo) : null;
  const vectorCount = selectedChatbot?.chatbot_vector ?? 0;

  const quickAccessCards = [
    { 
        id: 'appearance' as TabType, 
        title: 'Bot Theme', 
        desc: 'ظاهر و رنگ‌بندی', 
        icon: <Palette size={24} />, 
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'hover:border-purple-200 dark:hover:border-purple-800'
    },
    { 
        id: 'general' as TabType, 
        title: 'Bot Setting', 
        desc: 'تنظیمات اصلی و هویت', 
        icon: <Settings size={24} />, 
        color: 'text-blue-600 dark:text-blue-400',
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'hover:border-blue-200 dark:hover:border-blue-800'
    },
    { 
        id: 'knowledge' as TabType, 
        title: 'Bot Data', 
        desc: 'مدیریت پایگاه دانش', 
        icon: <Database size={24} />, 
        color: 'text-emerald-600 dark:text-emerald-400',
        bg: 'bg-emerald-50 dark:bg-emerald-900/20',
        border: 'hover:border-emerald-200 dark:hover:border-emerald-800'
    },
    { 
        id: 'integrations' as TabType, 
        title: 'Bot Plugins', 
        desc: 'اتصال به ابزارها', 
        icon: <Puzzle size={24} />, 
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'hover:border-amber-200 dark:hover:border-amber-800'
    },
    { 
        id: 'deploy' as TabType, 
        title: 'Bot Publish', 
        desc: 'انتشار و دریافت کد', 
        icon: <Rocket size={24} />, 
        color: 'text-pink-600 dark:text-pink-400',
        bg: 'bg-pink-50 dark:bg-pink-900/20',
        border: 'hover:border-pink-200 dark:hover:border-pink-800'
    },
  ];

  const integrationStatus = [
    { id: 'chatbot', name: 'Chatbot', icon: <MessageSquare size={20} />, status: 'Active', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'telegram', name: 'Telegram', icon: <Send size={20} />, status: 'Connected', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'sheets', name: 'Google Sheets', icon: <Table size={20} />, status: 'Synced', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'wordpress', name: 'WordPress', icon: <LayoutTemplate size={20} />, status: 'Not Linked', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
    { id: 'email', name: 'Email', icon: <Mail size={20} />, status: 'Active', color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    { id: 'whatsapp', name: 'WhatsApp', icon: <Phone size={20} />, status: 'Pending', color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/20' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 transition-colors border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-4">
            <div className="relative flex-shrink-0">
                <div className="flex items-center justify-center w-16 h-16 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800 ring-4 ring-blue-100 dark:ring-blue-900/30">
                    {logoUrl ? (
                        <img src={logoUrl} alt="Chatbot Logo" className="object-cover w-full h-full" />
                    ) : (
                        <Bot size={32} className="text-gray-400" />
                    )}
                </div>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{selectedChatbot?.chatbot_name || 'Chatbot Name'}</h2>
              <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full ${selectedChatbot?.chatbot_active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></span>
                  <span className="text-xs font-mono tracking-wider text-blue-600 uppercase dark:text-blue-400">
                      {selectedChatbot?.chatbot_active ? 'System Online' : 'System Offline'}
                  </span>
              </div>
            </div>
        </div>
        <button
          onClick={fetchStats}
          disabled={loading}
          title={loading ? 'در حال بارگذاری...' : 'به‌روزرسانی آمار'}
          className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 disabled:opacity-50 disabled:cursor-wait transition-colors"
        >
          <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">

        {/* Card 1 */}
        <div className={`bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${loading ? 'opacity-70' : ''}`}>
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Zap size={60} />
            </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <Zap size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">توکن مصرفی</span>
            </div>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {(stats.tokens / 1000).toFixed(0)}K
                </h3>
                <span className="text-xs text-gray-400 font-mono">/ 1M Limit</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{width: `${(stats.tokens / 1000000) * 100}%`}}></div>
            </div>
        </div>

        {/* Card 2 */}
        <div className={`bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${loading ? 'opacity-70' : ''}`}>
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={60} />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Activity size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">مکالمات فعال</span>
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {stats.conversations.toLocaleString('en-US')}
                </h3>
                <span className="text-xs text-green-500 flex items-center font-mono">
                    +12% <ArrowUpRight size={12} />
                </span>
            </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server size={60} />
            </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Server size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">وضعیت وکتور</span>
            </div>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{vectorCount.toLocaleString('en-US')}</h3>
                <span className="text-xs text-emerald-500 font-mono">وکتور</span>
            </div>
        </div>


        {/* Card 4 */}
        <div className={`bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group ${loading ? 'opacity-70' : ''}`}>
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Users size={60} />
            </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <Users size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">کاربران یکتا</span>
            </div>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {stats.users.toLocaleString('en-US')}
                </h3>
                <span className="text-xs text-green-500 flex items-center font-mono">
                    +5% <ArrowUpRight size={12} />
                </span>
            </div>
        </div>

      </div>

      {/* Manage App Section */}
      <div className="pt-4">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">مدیریت چت‌بات</h3>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
            {quickAccessCards.map((card) => (
                <button 
                    key={card.id}
                    onClick={() => setActiveTab(card.id)}
                    className={`
                        flex flex-col p-3 sm:p-5 rounded-2xl border border-gray-200 dark:border-gray-800 
                        bg-white dark:bg-gray-900 transition-all duration-300 group
                        hover:shadow-lg ${card.border} hover:-translate-y-1
                    `}
                >
                    <div className="flex justify-between items-start w-full mb-3 sm:mb-4">
                        <div className={`p-2.5 sm:p-3 rounded-xl ${card.bg} ${card.color}`}>
                            {React.cloneElement(card.icon as React.ReactElement<any>, { size: 24, className: 'w-5 h-5 sm:w-6 sm:h-6' })}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-1 sm:p-1.5 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <ArrowLeft size={12} className="rtl:rotate-0 rotate-180 sm:w-[14px] sm:h-[14px]" />
                        </div>
                    </div>
                    <div className="text-right w-full">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm sm:text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-vazir truncate">
                            {card.title}
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {card.desc}
                        </p>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Integrations Status Section */}
      <div className="pt-2">
         <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">اتصال چت‌بات</h3>
         <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {integrationStatus.map((item, index) => (
                <button
                    key={index}
                    onClick={() => setActiveTab('integrations')}
                    className="flex flex-col items-center justify-center p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md group"
                >
                    <div className={`p-3 rounded-xl mb-3 ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                        {item.icon}
                    </div>
                    <span className="font-bold text-gray-700 dark:text-gray-200 text-sm mb-1.5">{item.name}</span>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                            item.status === 'Active' || item.status === 'Connected' || item.status === 'Synced' 
                            ? 'bg-green-500' 
                            : item.status === 'Pending' ? 'bg-amber-500' : 'bg-gray-300 dark:bg-gray-600'
                        }`}></span>
                        <span className={`text-[10px] ${
                             item.status === 'Active' || item.status === 'Connected' || item.status === 'Synced' 
                            ? 'text-green-600 dark:text-green-400' 
                            : item.status === 'Pending' ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400 dark:text-gray-500'
                        }`}>
                            {item.status}
                        </span>
                    </div>
                </button>
            ))}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
