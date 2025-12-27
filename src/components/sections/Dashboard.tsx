import React, { useState, useEffect } from 'react';
import { 
    Activity, Server, ArrowUpRight, Palette, Settings, Database, Rocket, 
    MessageSquare, Send, Table, LayoutTemplate, Bot, RefreshCw, FileText, HardDrive, List, ChevronLeft, BookOpenCheck, Clock,
    // FIX: Added missing Lucide icons Puzzle and ArrowLeft
    Puzzle, ArrowLeft
} from 'lucide-react';
import { TabType, Chatbot, ChatbotActivityEntry } from '../../types';
import { getAssetUrl } from '../../services/directus';

interface DashboardProps {
  setActiveTab: (tab: TabType) => void;
  selectedChatbot: Chatbot | null;
  onRefresh: () => Promise<void>;
}

const RecentMessagesTicker: React.FC<{ logs: ChatbotActivityEntry[] }> = ({ logs }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        if (logs.length <= 1) return;
        const interval = setInterval(() => {
            setIndex((prev) => (prev + 1) % logs.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [logs.length]);

    if (logs.length === 0) return null;

    const currentLog = logs[index];
    const timeDisplay = new Date(currentLog.t).toLocaleTimeString('fa-IR', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });

    return (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 shadow-sm overflow-hidden flex items-center gap-4 h-16 group transition-all hover:border-blue-300 dark:hover:border-blue-700">
            {/* Indicator Badge */}
            <div className="flex-shrink-0 bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest hidden sm:block">
                Recent
            </div>

            <div className="flex-shrink-0 text-gray-400 dark:text-gray-600">
                <MessageSquare size={18} />
            </div>

            {/* Ticker Content */}
            <div className="flex-1 overflow-hidden relative h-6">
                <div 
                    key={index}
                    className="flex items-center gap-3 animate-slide-down-fade h-full"
                >
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate flex-1 text-right">
                        {currentLog.q}
                    </p>
                    <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500 font-mono whitespace-nowrap bg-gray-50 dark:bg-gray-800/50 px-2 py-0.5 rounded border border-gray-100 dark:border-gray-800">
                        <Clock size={10} />
                        {timeDisplay}
                    </div>
                </div>
            </div>

            {/* View All Indicator */}
            <div className="flex-shrink-0 text-gray-300 dark:text-gray-700 group-hover:text-blue-500 transition-colors">
                <ChevronLeft size={16} />
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ 
  setActiveTab,
  selectedChatbot,
  onRefresh
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const logoUrl = selectedChatbot?.chatbot_logo ? getAssetUrl(selectedChatbot.chatbot_logo) : null;
  
  // Real Stats mapping
  const llmFilesCount = selectedChatbot?.chatbot_llm || 0;
  const messagesCount = selectedChatbot?.chatbot_messages ? parseInt(String(selectedChatbot.chatbot_messages)) : 0;
  const storageUsage = selectedChatbot?.chatbot_storage ? parseInt(String(selectedChatbot.chatbot_storage)) : 0;
  const vectorCount = selectedChatbot?.chatbot_vector || 0;
  const activityLog = selectedChatbot?.chatbot_activity || [];

  const handleRefreshClick = async () => {
    setIsRefreshing(true);
    try {
        await onRefresh();
    } finally {
        setTimeout(() => setIsRefreshing(false), 500); // Minimum spin time for visual feedback
    }
  };

  const quickAccessCards = [
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
        id: 'appearance' as TabType, 
        title: 'Bot Theme', 
        desc: 'ظاهر و رنگ‌بندی', 
        icon: <Palette size={24} />, 
        color: 'text-purple-600 dark:text-purple-400',
        bg: 'bg-purple-50 dark:bg-purple-900/20',
        border: 'hover:border-purple-200 dark:hover:border-purple-800'
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
        id: 'content-manager' as TabType, 
        title: 'Contents Manager', 
        desc: 'مدیریت محتوا و FAQ', 
        icon: <BookOpenCheck size={24} />, 
        color: 'text-indigo-600 dark:text-indigo-400',
        bg: 'bg-indigo-50 dark:bg-indigo-900/20',
        border: 'hover:border-indigo-200 dark:hover:border-indigo-800'
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
    { 
        id: 'integrations' as TabType, 
        title: 'Bot Plugins', 
        desc: 'اتصال به ابزارها', 
        icon: <Puzzle size={24} />, 
        color: 'text-amber-600 dark:text-amber-400',
        bg: 'bg-amber-50 dark:bg-amber-900/20',
        border: 'hover:border-amber-200 dark:hover:border-amber-800'
    },
  ];

  const integrationStatus = [
    { id: 'chatbot', name: 'Chatbot', icon: <MessageSquare size={20} />, status: 'Active', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { id: 'telegram', name: 'Telegram', icon: <Send size={20} />, status: 'Connected', color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'sheets', name: 'Google Sheets', icon: <Table size={20} />, status: 'Synced', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { id: 'wordpress', name: 'WordPress', icon: <LayoutTemplate size={20} />, status: 'Not Linked', color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-800' },
  ];

  return (
    <div className="space-y-12 animate-fade-in">
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
        
        <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('manage-bots')}
              title='لیست ربات‌ها'
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <List size={18} />
            </button>
            <button
              onClick={handleRefreshClick}
              title='به‌روزرسانی آمار'
              disabled={isRefreshing}
              className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <FileText size={60} />
            </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
                    <FileText size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">فایل‌های آموزشی</span>
            </div>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {llmFilesCount.toLocaleString('en-US')}
                </h3>
                <span className="text-xs text-gray-400 font-mono">Files</span>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={60} />
            </div>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                      <Activity size={20} />
                  </div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">مکالمات</span>
                </div>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {messagesCount.toLocaleString('en-US')}
                </h3>
                <span className="text-xs text-green-500 flex items-center font-mono">
                    +12% <ArrowUpRight size={12} />
                </span>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Server size={60} />
            </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    <Server size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">ایندکس وکتور</span>
            </div>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">{vectorCount.toLocaleString('en-US')}</h3>
                <span className="text-xs text-emerald-500 font-mono">وکتور</span>
            </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <HardDrive size={60} />
            </div>
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg">
                    <HardDrive size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">فضای ذخیره‌سازی</span>
            </div>
             <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">
                  {storageUsage.toLocaleString('en-US')}
                </h3>
                <span className="text-sm text-gray-400 font-mono">MB</span>
            </div>
        </div>
      </div>

    

      {/* Row 1: Bot Management */}
      <div>
        {/* <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">مدیریت چت‌بات</h3> */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {quickAccessCards.map((card) => (
                <button 
                    key={card.id}
                    onClick={() => setActiveTab(card.id)}
                    className={`
                        flex flex-col p-4 rounded-2xl border border-gray-200 dark:border-gray-800 
                        bg-white dark:bg-gray-900 transition-all duration-300 group
                        hover:shadow-lg ${card.border} hover:-translate-y-1
                    `}
                >
                    <div className="flex justify-between items-start w-full mb-4">
                        <div className={`p-2.5 rounded-xl ${card.bg} ${card.color}`}>
                            {React.cloneElement(card.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-800 rounded-full p-1 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 transition-colors">
                            <ArrowLeft size={12} className="rtl:rotate-0 rotate-180" />
                        </div>
                    </div>
                    <div className="text-right w-full">
                        <h4 className="font-bold text-gray-800 dark:text-white text-sm mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {card.title}
                        </h4>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 line-clamp-1">
                            {card.desc}
                        </p>
                    </div>
                </button>
            ))}
        </div>
      </div>

      {/* Row 2: Recent Activity (Ticker Style) */}
      <div>
        {activityLog.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-12 text-center opacity-40 shadow-sm">
                <MessageSquare size={48} className="mx-auto mb-4" />
                <p className="text-sm font-medium">هنوز فعالیتی ثبت نشده است</p>
            </div>
        ) : (
            <button 
                onClick={() => setActiveTab('logs')}
                className="w-full block text-right"
            >
                <RecentMessagesTicker logs={activityLog} />
            </button>
        )}
      </div>

      {/* Row 3: Integrations */}
      <div>
        {/* <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6">اتصال چت‌بات</h3> */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
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