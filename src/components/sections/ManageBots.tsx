import React from 'react';
import { Bot, Settings, Globe, PlusCircle } from 'lucide-react';
import { Chatbot, TabType } from '../../types';
import { getAssetUrl } from '../../services/directus';

interface Props {
  chatbots: Chatbot[];
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
  onSelectChatbot: (bot: Chatbot) => void;
  setActiveTab: (tab: TabType) => void;
  onCreateChatbot: () => void;
}

const ManageBots: React.FC<Props> = ({ chatbots, onUpdateChatbot, onSelectChatbot, setActiveTab, onCreateChatbot }) => {

  const handleManage = (bot: Chatbot) => {
    onSelectChatbot(bot);
    setActiveTab('dashboard');
  };
  
  const handleToggleActive = (bot: Chatbot) => {
    // Prevent event bubbling to parent link elements
    event?.stopPropagation();
    onUpdateChatbot(bot.id, { chatbot_active: !bot.chatbot_active });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 transition-colors border-b border-gray-200 dark:border-gray-800">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">مدیریت چت‌بات‌ها</h2>
          <p className="mt-1 text-gray-500 dark:text-gray-400">تمام ربات‌های خود را در یک نگاه مشاهده و مدیریت کنید.</p>
        </div>
        <button 
          onClick={onCreateChatbot}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
        >
          <PlusCircle size={18} />
          <span>ساخت ربات جدید</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {chatbots.map(bot => (
          <div key={bot.id} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 flex flex-col transition-shadow hover:shadow-lg">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {bot.chatbot_logo ? (
                  <img src={getAssetUrl(bot.chatbot_logo)} alt={bot.chatbot_name} className="w-full h-full object-cover" />
                ) : (
                  <Bot size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{bot.chatbot_name}</h3>
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
      </div>
    </div>
  );
};

export default ManageBots;
