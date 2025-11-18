import React, { useState } from 'react';
import { Activity, Zap, Users, Server, ArrowUpRight, Bot, ChevronDown, Plus, Check } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState('دستیار هوشمند');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const bots = [
    { id: 1, name: 'دستیار هوشمند', status: 'online' },
    { id: 2, name: 'پشتیبان فنی', status: 'offline' },
    { id: 3, name: 'مدیریت فروش', status: 'online' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-end justify-between border-b border-gray-200 dark:border-gray-800 pb-6 transition-colors">
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-xs font-mono text-blue-600 dark:text-blue-400 uppercase tracking-wider">System Online</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">داشبورد فرماندهی</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-1">نمای کلی عملکرد مدل زبانی و تعاملات کاربران</p>
        </div>
        
        {/* Bot Selector Dropdown */}
        <div className="hidden sm:block relative z-20">
            <button 
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-2.5 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm min-w-[220px] group"
            >
                <div className="w-9 h-9 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
                    <Bot size={20} />
                </div>
                <div className="flex flex-col items-start">
                    <span className="text-xs text-gray-400 font-medium">چت‌بات فعال</span>
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{selectedBot}</span>
                </div>
                <ChevronDown size={16} className={`text-gray-400 mr-auto transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-xl overflow-hidden animate-fade-in">
                    <div className="py-1 max-h-60 overflow-y-auto">
                        {bots.map(bot => (
                            <button 
                                key={bot.id}
                                onClick={() => { setSelectedBot(bot.name); setIsDropdownOpen(false); }}
                                className="w-full text-right px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-3 transition-colors"
                            >
                                <span className={`w-2 h-2 rounded-full ${bot.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-gray-300 dark:bg-gray-600'}`}></span>
                                <span className={`text-sm ${selectedBot === bot.name ? 'font-bold text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'}`}>{bot.name}</span>
                                {selectedBot === bot.name && <Check size={14} className="mr-auto text-blue-600 dark:text-blue-400" />}
                            </button>
                        ))}
                    </div>
                    <div className="border-t border-gray-100 dark:border-gray-800 p-2 bg-gray-50 dark:bg-gray-950/50">
                        <button className="w-full flex items-center justify-center gap-2 text-xs font-bold text-blue-600 dark:text-blue-400 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 py-2.5 rounded-lg transition-all active:scale-95">
                            <Plus size={14} />
                            افزودن چت‌بات جدید
                        </button>
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity size={60} />
            </div>
            <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
                    <Activity size={20} />
                </div>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">مکالمات فعال</span>
            </div>
            <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">1,248</h3>
                <span className="text-xs text-green-500 flex items-center font-mono">
                    +12% <ArrowUpRight size={12} />
                </span>
            </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
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
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">842K</h3>
                <span className="text-xs text-gray-400 font-mono">/ 1M Limit</span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 h-1 mt-3 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full" style={{width: '84%'}}></div>
            </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
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
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">3,502</h3>
                <span className="text-xs text-green-500 flex items-center font-mono">
                    +5% <ArrowUpRight size={12} />
                </span>
            </div>
        </div>

        {/* Card 4 */}
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
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white font-mono">99.9%</h3>
                <span className="text-xs text-emerald-500 font-mono">Stable</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;