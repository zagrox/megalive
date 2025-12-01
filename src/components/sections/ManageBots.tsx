import React, { useState, useEffect } from 'react';
import { Bot, Settings, Globe, PlusCircle, Crown, MessageSquare, HardDrive, Cpu, AlertTriangle, ArrowUpCircle, FileText, Server } from 'lucide-react';
import { Chatbot, TabType, Plan } from '../../types';
import { getAssetUrl } from '../../services/directus';
import { useAuth } from '../../context/AuthContext';
import { fetchPricingPlans } from '../../services/configService';
import { syncProfileStats } from '../../services/chatbotService';

interface Props {
  chatbots: Chatbot[];
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
  onSelectChatbot: (bot: Chatbot) => void;
  setActiveTab: (tab: TabType) => void;
  onCreateChatbot: () => void;
}

const ManageBots: React.FC<Props> = ({ chatbots, onUpdateChatbot, onSelectChatbot, setActiveTab, onCreateChatbot }) => {
  const { user, refreshUser } = useAuth();
  const profile = user?.profile;
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetchPricingPlans().then(data => setPlans(data));
  }, []);

  // Sync profile stats on mount to ensure aggregation is up to date
  useEffect(() => {
    const sync = async () => {
      if (user?.id) {
        try {
            await syncProfileStats(user.id);
            await refreshUser();
        } catch (err) {
            console.error("Failed to sync profile stats:", err);
        }
      }
    };
    sync();
  }, []);

  const handleManage = (bot: Chatbot) => {
    onSelectChatbot(bot);
    setActiveTab('dashboard');
  };
  
  const handleToggleActive = async (e: React.MouseEvent, bot: Chatbot) => {
    e.stopPropagation();
    await onUpdateChatbot(bot.id, { chatbot_active: !bot.chatbot_active });
    // Sync stats after update to ensure integrity
    if (user) {
        await syncProfileStats(user.id);
        await refreshUser();
    }
  };

  const getPlanLabel = (plan?: string) => {
    switch(String(plan || '').toLowerCase()) {
        case 'enterprise': return 'سازمانی';
        case 'business': return 'تجاری';
        case 'starter': return 'استارتر';
        default: return 'رایگان';
    }
  };

  const getPlanColor = (plan?: string) => {
    switch(String(plan || '').toLowerCase()) {
        case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        case 'business': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        case 'starter': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const getSubscriptionStatusText = () => {
    // Resolve plan name for this check
    const currentPlan = plans.find(p => 
      p.id === Number(profile?.profile_plan) || 
      (typeof profile?.profile_plan === 'object' && (profile?.profile_plan as any)?.id === p.id) ||
      String(p.plan_name || '').toLowerCase() === String(profile?.profile_plan || '').toLowerCase()
    );
    const planName = currentPlan?.plan_name || 'free';
    
    if (String(planName).toLowerCase() === 'free') {
        return "اعتبار زمانی نامحدود";
    }

    if (!profile?.profile_end) {
        return "وضعیت اشتراک و آمار مصرف";
    }

    const end = new Date(profile.profile_end);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
        return "اشتراک منقضی شده";
    } else if (diffDays === 0) {
        return "کمتر از یک روز باقی‌مانده";
    } else {
        return `${diffDays.toLocaleString('en-US')} روز باقی‌مانده از اشتراک`;
    }
  };

  // Resolve Plan: Check by ID first (Relation), then Name (Legacy)
  const currentPlanConfig = plans.find(p => 
    p.id === Number(profile?.profile_plan) || 
    (typeof profile?.profile_plan === 'object' && (profile?.profile_plan as any)?.id === p.id) ||
    String(p.plan_name || '').toLowerCase() === String(profile?.profile_plan || '').toLowerCase()
  );

  // Limits from Plan (fallback to profile defaults if plan not loaded yet)
  const limitChatbots = currentPlanConfig?.plan_bots || 1;
  const limitMessages = currentPlanConfig?.plan_messages || 100;
  const limitStorage = currentPlanConfig?.plan_storage || 10000;
  const limitVectors = currentPlanConfig?.plan_llm || 1;

  const currentChatbots = chatbots.length;
  // Parse current usage for calculations
  const currentMessages = profile?.profile_messages ? parseInt(profile.profile_messages) : 0;
  const currentStorage = profile?.profile_storages ? parseInt(profile.profile_storages) : 0;
  const currentVectors = profile?.profile_llm || 0;

  const isLimitReached = currentChatbots >= limitChatbots;

  const formatBigInt = (val?: string) => {
      if(!val) return '0';
      return parseInt(val).toLocaleString('en-US');
  };

  const getPercentage = (current: number, limit: number) => {
      if (limit === 0) return 100;
      return Math.min((current / limit) * 100, 100);
  };

  const planNameForDisplay = currentPlanConfig?.plan_name || 'free';

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Subscription Stats Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${getPlanColor(planNameForDisplay)}`}>
                    <Crown size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        پلن {getPlanLabel(planNameForDisplay)}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {getSubscriptionStatusText()}
                    </p>
                </div>
            </div>
            
            <button 
                onClick={() => setActiveTab('pricing')}
                className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-md shadow-blue-600/20"
            >
                <ArrowUpCircle size={16} />
                تغییر اشتراک
            </button>
        </div>
        
         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full">
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                    <Bot size={14} className="text-blue-500" />
                    <span>ربات‌ها</span>
                </div>
                <span className={`text-lg font-bold font-mono ${isLimitReached ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                    {currentChatbots} <span className="text-gray-400 text-sm">/ {limitChatbots}</span>
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-blue-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(currentChatbots, limitChatbots)}%` }}></div>
                </div>
             </div>
             
             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-green-200 dark:hover:border-green-800 transition-colors">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                    <MessageSquare size={14} className="text-green-500" />
                    <span>پیام‌ها</span>
                </div>
                <span className="text-lg font-bold font-mono text-gray-800 dark:text-white">
                    {formatBigInt(profile?.profile_messages)} <span className="text-gray-400 text-sm">/ {limitMessages.toLocaleString('en-US')}</span>
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-green-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(currentMessages, limitMessages)}%` }}></div>
                </div>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                    <HardDrive size={14} className="text-amber-500" />
                    <span>فضا (MB)</span>
                </div>
                <span className="text-lg font-bold font-mono text-gray-800 dark:text-white">
                     {formatBigInt(profile?.profile_storages)} <span className="text-gray-400 text-sm">/ {limitStorage.toLocaleString('en-US')}</span>
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(currentStorage, limitStorage)}%` }}></div>
                </div>
             </div>

             <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                    <Cpu size={14} className="text-purple-500" />
                    <span>پایگاه دانش</span>
                </div>
                <span className="text-lg font-bold font-mono text-gray-800 dark:text-white">
                    {(profile?.profile_llm || 0).toLocaleString('en-US')} <span className="text-gray-400 text-sm">/ {limitVectors.toLocaleString('en-US')}</span>
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div className="bg-purple-500 h-full rounded-full transition-all duration-500" style={{ width: `${getPercentage(currentVectors, limitVectors)}%` }}></div>
                </div>
             </div>
         </div>
      </div>
      
      

      <div className="flex flex-wrap items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">لیست ربات‌ها</h2>
        </div>
        <button 
          onClick={onCreateChatbot}
          disabled={isLimitReached}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <PlusCircle size={18} />
          <span>ساخت ربات جدید</span>
        </button>
      </div>

      {isLimitReached && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400 px-6 py-4 rounded-2xl text-sm flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-3">
                <AlertTriangle size={24} className="shrink-0" />
                <span className="font-medium">شما به سقف مجاز ساخت ربات در پلن فعلی رسیده‌اید. برای ساخت ربات بیشتر لطفا پلن خود را ارتقا دهید.</span>
            </div>
            <button 
              onClick={() => setActiveTab('pricing')}
              className="mr-auto sm:mr-auto font-bold underline hover:text-amber-800 dark:hover:text-amber-300 whitespace-nowrap"
            >
                مشاهده پلن‌ها
            </button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {chatbots.map(bot => {
          // Parse Bot Stats
          const botMsgCount = bot.chatbot_messages ? parseInt(bot.chatbot_messages) : 0;
          const botStorageSize = bot.chatbot_storage ? parseInt(bot.chatbot_storage) : 0;
          const botFileCount = bot.chatbot_llm || 0;
          const botVectorCount = bot.chatbot_vector || 0;

          return (
            <div key={bot.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col transition-shadow hover:shadow-lg group">
              {/* Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm">
                  {bot.chatbot_logo ? (
                    <img src={getAssetUrl(bot.chatbot_logo)} alt={bot.chatbot_name} className="w-full h-full object-cover" />
                  ) : (
                    <Bot size={28} className="text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1">{bot.chatbot_name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{bot.chabot_title}</p>
                </div>
              </div>

              {/* Bot Usage Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Messages */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg shrink-0">
                          <MessageSquare size={14} />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">مکالمات</p>
                          <p className="font-bold text-gray-800 dark:text-white font-mono text-sm">{botMsgCount.toLocaleString('en-US')}</p>
                      </div>
                  </div>

                  {/* Storage */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg shrink-0">
                          <HardDrive size={14} />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">فضا (MB)</p>
                          <p className="font-bold text-gray-800 dark:text-white font-mono text-sm">{botStorageSize.toLocaleString('en-US')}</p>
                      </div>
                  </div>

                  {/* Files */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center gap-2.5">
                      <div className="p-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg shrink-0">
                          <FileText size={14} />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">فایل‌ها</p>
                          <p className="font-bold text-gray-800 dark:text-white font-mono text-sm">{botFileCount.toLocaleString('en-US')}</p>
                      </div>
                  </div>

                  {/* Vectors */}
                  <div className="bg-gray-50 dark:bg-gray-800/50 p-2.5 rounded-xl border border-gray-100 dark:border-gray-700/50 flex items-center gap-2.5">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg shrink-0">
                          <Server size={14} />
                      </div>
                      <div className="min-w-0">
                          <p className="text-[10px] text-gray-500 dark:text-gray-400 truncate">وکتور</p>
                          <p className="font-bold text-gray-800 dark:text-white font-mono text-sm">{botVectorCount.toLocaleString('en-US')}</p>
                      </div>
                  </div>
              </div>

              <div className="flex items-center justify-between mb-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-2 text-sm">
                     <div className={`w-2.5 h-2.5 rounded-full ${bot.chatbot_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                     <span className={bot.chatbot_active ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                      {bot.chatbot_active ? 'فعال' : 'غیرفعال'}
                     </span>
                  </div>
                  
                  <div className="flex items-center">
                      
                      <button
                          onClick={(e) => handleToggleActive(e, bot)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              bot.chatbot_active ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                          }`}
                      >
                          <span
                              className={`${
                                  bot.chatbot_active ? '-translate-x-4' : '-translate-x-1'
                              } inline-block h-3.5 w-3.5 transform rounded-full bg-white transition duration-200 ease-in-out`}
                          />
                      </button>
                  </div>
              </div>

              <div className="mt-auto flex items-center gap-3">
                <button 
                  onClick={() => handleManage(bot)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors shadow-sm"
                >
                  <Settings size={16} />
                  <span>مدیریت</span>
                </button>
                <a 
                  href={bot.chatbot_site || '#'} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={bot.chatbot_site || 'سایت متصل نشده'}
                  onClick={(e) => !bot.chatbot_site && e.preventDefault()}
                  className={`p-2.5 rounded-xl transition-colors border ${bot.chatbot_site ? 'bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700' : 'bg-gray-50 dark:bg-gray-800/50 text-gray-300 dark:text-gray-600 border-gray-100 dark:border-gray-800 cursor-not-allowed'}`}
                >
                  <Globe size={18} />
                </a>
              </div>
            </div>
          );
        })}
        
        {chatbots.length === 0 && (
           <div className="col-span-full py-16 flex flex-col items-center justify-center text-center text-gray-400 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-200 dark:border-gray-800">
               <Bot size={48} className="mb-4 opacity-20" />
               <p className="text-lg font-medium text-gray-600 dark:text-gray-300">هنوز هیچ رباتی نساخته‌اید</p>
               <button onClick={onCreateChatbot} className="mt-4 text-blue-600 hover:underline font-medium">
                   ساخت اولین ربات
               </button>
           </div>
        )}
      </div>
    </div>
  );
};

export default ManageBots;