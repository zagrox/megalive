import React, { useState, useEffect } from 'react';
import { Bot, Settings, Globe, PlusCircle, Crown, MessageSquare, HardDrive, Cpu, AlertTriangle, ArrowUpCircle } from 'lucide-react';
import { Chatbot, TabType, Plan } from '../../types';
import { getAssetUrl } from '../../services/directus';
import { useAuth } from '../../context/AuthContext';
import { fetchPricingPlans } from '../../services/configService';

interface Props {
  chatbots: Chatbot[];
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
  onSelectChatbot: (bot: Chatbot) => void;
  setActiveTab: (tab: TabType) => void;
  onCreateChatbot: () => void;
}

const ManageBots: React.FC<Props> = ({ chatbots, onUpdateChatbot, onSelectChatbot, setActiveTab, onCreateChatbot }) => {
  const { user } = useAuth();
  const profile = user?.profile;
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetchPricingPlans().then(data => setPlans(data));
  }, []);

  const handleManage = (bot: Chatbot) => {
    onSelectChatbot(bot);
    setActiveTab('dashboard');
  };
  
  const handleToggleActive = (bot: Chatbot) => {
    // Prevent event bubbling to parent link elements
    event?.stopPropagation();
    onUpdateChatbot(bot.id, { chatbot_active: !bot.chatbot_active });
  };

  const getPlanLabel = (plan?: string) => {
    switch(plan) {
        case 'enterprise': return 'سازمانی';
        case 'business': return 'تجاری';
        case 'starter': return 'استارتر';
        default: return 'رایگان';
    }
  };

  const getPlanColor = (plan?: string) => {
    switch(plan) {
        case 'enterprise': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800';
        case 'business': return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800';
        case 'starter': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800';
        default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  // Find current plan details from the fetched plans list
  const currentPlanConfig = plans.find(p => p.plan_name === profile?.profile_plan);

  // Limits from Plan (fallback to profile defaults if plan not loaded yet)
  const limitChatbots = currentPlanConfig?.plan_bots || 1;
  const limitMessages = parseInt(currentPlanConfig?.plan_messages || '100');
  const limitStorage = parseInt(currentPlanConfig?.plan_storage || '10000');
  const limitVectors = currentPlanConfig?.plan_llm || 1;

  const currentChatbots = chatbots.length;
  const isLimitReached = currentChatbots >= limitChatbots;

  const formatBigInt = (val?: string) => {
      if(!val) return '0';
      return parseInt(val).toLocaleString('fa-IR');
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Subscription Stats Header */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-6">
            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-2 ${getPlanColor(profile?.profile_plan)}`}>
                    <Crown size={28} />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                        پلن {getPlanLabel(profile?.profile_plan)}
                        <button 
                          onClick={() => setActiveTab('pricing')}
                          className="px-2 py-0.5 text-xs font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1 shadow-md shadow-blue-600/20"
                        >
                           <ArrowUpCircle size={12} />
                           ارتقا
                        </button>
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        وضعیت اشتراک و محدودیت‌های حساب
                    </p>
                </div>
            </div>
            
             <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto flex-1 max-w-3xl">
                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                        <Bot size={14} className="text-blue-500" />
                        <span>ربات‌ها</span>
                    </div>
                    <span className={`text-lg font-bold font-mono ${isLimitReached ? 'text-red-500' : 'text-gray-800 dark:text-white'}`}>
                        {currentChatbots} <span className="text-gray-400 text-sm">/ {limitChatbots}</span>
                    </span>
                 </div>
                 
                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-green-200 dark:hover:border-green-800 transition-colors">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                        <MessageSquare size={14} className="text-green-500" />
                        <span>پیام‌ها</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-gray-800 dark:text-white">
                        {formatBigInt(profile?.profile_messages)} <span className="text-gray-400 text-sm">/ {limitMessages.toLocaleString('fa-IR')}</span>
                    </span>
                 </div>

                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                        <HardDrive size={14} className="text-amber-500" />
                        <span>فضا (MB)</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-gray-800 dark:text-white">
                         {formatBigInt(profile?.profile_storages)} <span className="text-gray-400 text-sm">/ {limitStorage.toLocaleString('fa-IR')}</span>
                    </span>
                 </div>

                 <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-100 dark:border-gray-700 text-center group hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 flex items-center justify-center gap-1.5">
                        <Cpu size={14} className="text-purple-500" />
                        <span>پایگاه دانش</span>
                    </div>
                    <span className="text-lg font-bold font-mono text-gray-800 dark:text-white">
                        {(profile?.profile_vectors || 0).toLocaleString('fa-IR')} <span className="text-gray-400 text-sm">/ {limitVectors.toLocaleString('fa-IR')}</span>
                    </span>
                 </div>
             </div>
        </div>
        
        {isLimitReached && (
            <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 animate-pulse">
                <AlertTriangle size={18} />
                <span>شما به سقف مجاز ساخت ربات در پلن فعلی رسیده‌اید. برای ساخت ربات بیشتر لطفا پلن خود را ارتقا دهید.</span>
                <button 
                  onClick={() => setActiveTab('pricing')}
                  className="mr-auto font-bold underline hover:text-amber-800 dark:hover:text-amber-300"
                >
                    مشاهده پلن‌ها
                </button>
            </div>
        )}
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
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {chatbots.map(bot => (
          <div key={bot.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col transition-shadow hover:shadow-lg group">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-100 dark:border-gray-700">
                {bot.chatbot_logo ? (
                  <img src={getAssetUrl(bot.chatbot_logo)} alt={bot.chatbot_name} className="w-full h-full object-cover" />
                ) : (
                  <Bot size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{bot.chatbot_name}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{bot.chabot_title}</p>
              </div>
            </div>

            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-sm">
                   <div className={`w-2.5 h-2.5 rounded-full ${bot.chatbot_active ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                   <span className={bot.chatbot_active ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}>
                    {bot.chatbot_active ? 'فعال' : 'غیرفعال'}
                   </span>
                </div>
                
                <div className="flex items-center">
                    <span className="text-xs text-gray-400 mr-2">تغییر وضعیت</span>
                    <button
                        onClick={() => handleToggleActive(bot)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                            bot.chatbot_active ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                    >
                        <span
                            className={`${
                                bot.chatbot_active ? '-translate-x-6' : '-translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out`}
                        />
                    </button>
                </div>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
              <button 
                onClick={() => handleManage(bot)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
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
                className={`p-2.5 rounded-lg transition-colors ${bot.chatbot_site ? 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700' : 'bg-gray-100 dark:bg-gray-800 text-gray-300 dark:text-gray-600 cursor-not-allowed'}`}
              >
                <Globe size={16} />
              </a>
            </div>
          </div>
        ))}
        
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