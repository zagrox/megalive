import React, { useState } from 'react';
import { Activity, Zap, Users, Server, Terminal, Clock, ArrowUpRight, Bot, ChevronDown, Plus, Check } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [selectedBot, setSelectedBot] = useState('دستیار هوشمند');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const bots = [
    { id: 1, name: 'دستیار هوشمند', status: 'online' },
    { id: 2, name: 'پشتیبان فنی', status: 'offline' },
    { id: 3, name: 'مدیریت فروش', status: 'online' },
  ];

  // Mock data for the chart
  const trafficData = [
    40, 65, 45, 80, 55, 70, 45, 60, 75, 50, 85, 65, 
    90, 70, 55, 40, 60, 80, 50, 70, 60, 80, 95, 60
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart Area (Simulated) */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm transition-all">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                    <Activity size={18} className="text-blue-500" />
                    ترافیک شبکه عصبی
                </h3>
                <select className="text-xs bg-gray-50 dark:bg-gray-800 border-none text-gray-500 rounded-md px-2 py-1 outline-none">
                    <option>۲۴ ساعت گذشته</option>
                    <option>۷ روز گذشته</option>
                </select>
            </div>
            
            {/* CSS Chart Simulation */}
            <div className="h-64 flex items-end justify-between gap-2 px-2 dir-ltr">
                {trafficData.map((h, i) => (
                    <div key={i} className="w-full h-full bg-gray-100 dark:bg-gray-800 rounded-t-sm relative group overflow-hidden">
                        <div 
                            className="absolute bottom-0 w-full bg-blue-500 dark:bg-blue-600 opacity-80 group-hover:opacity-100 transition-all duration-300 ease-out" 
                            style={{height: `${h}%`}}
                        ></div>
                        {/* Tooltip simulation */}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {h}%
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 font-mono mt-3 px-2 dir-ltr">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:59</span>
            </div>
          </div>

          {/* System Log / Terminal */}
          <div className="bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-800 rounded-2xl p-0 overflow-hidden shadow-sm dark:shadow-lg flex flex-col h-96 lg:h-auto transition-colors">
             <div className="bg-gray-50 dark:bg-gray-950 px-4 py-3 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between transition-colors">
                <div className="flex items-center gap-2">
                    <Terminal size={14} className="text-gray-500 dark:text-green-500" />
                    <span className="text-xs font-mono text-gray-500 dark:text-gray-400">LIVE_LOGS</span>
                </div>
                <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-400/80 dark:bg-red-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80 dark:bg-yellow-500/50"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-green-400/80 dark:bg-green-500/50"></div>
                </div>
             </div>
             <div className="p-4 font-mono text-xs overflow-y-auto flex-1 space-y-2 dir-ltr">
                 <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">[14:20:01]</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">INFO</span>
                    <span className="text-gray-700 dark:text-gray-300">Vector store index updated successfully.</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">[14:20:05]</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">REQ</span>
                    <span className="text-gray-700 dark:text-gray-300">Incoming webhook from N8N (ID: 8f2a...)</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">[14:20:06]</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">GEN</span>
                    <span className="text-gray-700 dark:text-gray-300">Gemini-Pro-1.5 generating response...</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">[14:20:08]</span>
                    <span className="text-blue-600 dark:text-blue-400 font-bold">INFO</span>
                    <span className="text-gray-700 dark:text-gray-300">Response sent. Latency: 840ms.</span>
                 </div>
                 <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">[14:21:12]</span>
                    <span className="text-amber-600 dark:text-yellow-400 font-bold">WARN</span>
                    <span className="text-gray-700 dark:text-gray-300">Rate limit approaching (85%).</span>
                 </div>
                  <div className="flex gap-2">
                    <span className="text-gray-400 dark:text-gray-500">[14:22:01]</span>
                    <span className="text-green-600 dark:text-green-400 font-bold">REQ</span>
                    <span className="text-gray-700 dark:text-gray-300">New session started.</span>
                 </div>
                 <div className="animate-pulse text-gray-400 dark:text-gray-500 mt-2">_</div>
             </div>
          </div>
      </div>

      {/* Recent Activities Table */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm transition-colors">
          <div className="p-6 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
                <Clock size={18} className="text-gray-400" />
                آخرین فعالیت‌ها
            </h3>
            <button className="text-xs text-blue-600 dark:text-blue-400 hover:underline">مشاهده همه</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 dark:bg-gray-950 text-gray-500 font-medium">
                    <tr>
                        <th className="px-6 py-3 text-right">شناسه درخواست</th>
                        <th className="px-6 py-3 text-right">مدل زبانی</th>
                        <th className="px-6 py-3 text-right">وضعیت</th>
                        <th className="px-6 py-3 text-right">زمان پاسخ</th>
                        <th className="px-6 py-3 text-right dir-ltr text-right">Timestamp</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {[1, 2, 3].map((i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-6 py-4 font-mono text-xs text-gray-500 dir-ltr text-right">req_8f2a9c{i}</td>
                            <td className="px-6 py-4 text-gray-800 dark:text-gray-200">Gemini 1.5 Pro</td>
                            <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">
                                    موفق
                                </span>
                            </td>
                            <td className="px-6 py-4 font-mono text-gray-600 dark:text-gray-400 dir-ltr text-right">{450 + i * 120}ms</td>
                            <td className="px-6 py-4 text-gray-500 dir-ltr text-right">2024-05-20 14:2{i}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;