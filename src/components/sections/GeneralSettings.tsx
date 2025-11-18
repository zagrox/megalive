import React, { useState } from 'react';
import { BotConfig } from '../../types';
import { Wand2, Save, AlertCircle, Link } from 'lucide-react';
import { generateSystemPrompt } from '../../services/geminiService';

interface Props {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
}

const GeneralSettings: React.FC<Props> = ({ config, setConfig }) => {
  const [generating, setGenerating] = useState(false);
  const [businessDesc, setBusinessDesc] = useState('');
  const [showPromptGen, setShowPromptGen] = useState(false);

  const handleGeneratePrompt = async () => {
    if (!businessDesc) return;
    setGenerating(true);
    try {
      const prompt = await generateSystemPrompt(businessDesc);
      setConfig(prev => ({ ...prev, systemInstruction: prompt }));
      setShowPromptGen(false);
    } catch (e) {
      // Handle error
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">اطلاعات پایه و هویت چت‌بات خود را تنظیم کنید.</p>
      </div>

      <div className="space-y-6">
        {/* Name */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام چت‌بات</label>
          <input
            type="text"
            value={config.name}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Description */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات کوتاه</label>
          <textarea
            value={config.description}
            onChange={(e) => setConfig({ ...config, description: e.target.value })}
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all resize-none"
          />
        </div>

        {/* N8N Webhook URL */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
             <Link size={14} className="text-gray-400" />
             آدرس وب‌هوک N8N
          </label>
          <div className="relative">
            <input
              type="url"
              value={config.n8nWebhookUrl}
              onChange={(e) => setConfig({ ...config, n8nWebhookUrl: e.target.value })}
              placeholder="https://your-n8n.com/webhook/..."
              className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all dir-ltr text-left"
            />
          </div>
          <p className="text-xs text-gray-400">این آدرس برای ارسال پیام‌های کاربران به ورک‌فلو N8N استفاده می‌شود.</p>
        </div>

        {/* System Instruction */}
        <div className="grid gap-2 relative">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">دستورالعمل سیستمی (System Prompt)</label>
            <button
              onClick={() => setShowPromptGen(!showPromptGen)}
              className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-1 hover:underline"
            >
              <Wand2 size={12} />
              تولید با هوش مصنوعی
            </button>
          </div>

          {showPromptGen && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 p-4 rounded-xl mb-2">
              <label className="text-xs text-blue-800 dark:text-blue-300 block mb-2">کسب و کار شما چه کاری انجام می‌دهد؟</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={businessDesc}
                  onChange={(e) => setBusinessDesc(e.target.value)}
                  placeholder="مثال: فروشگاه آنلاین لوازم جانبی موبایل با ارسال سریع..."
                  className="flex-1 px-3 py-1.5 text-sm border border-blue-200 dark:border-blue-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:border-blue-400"
                />
                <button
                  onClick={handleGeneratePrompt}
                  disabled={generating || !businessDesc}
                  className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {generating ? '...' : 'تولید'}
                </button>
              </div>
            </div>
          )}

          <textarea
            value={config.systemInstruction}
            onChange={(e) => setConfig({ ...config, systemInstruction: e.target.value })}
            rows={8}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            این دستورالعمل شخصیت و نحوه پاسخگویی بات را تعیین می‌کند.
          </p>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
             <button className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-gray-900/20 dark:shadow-blue-600/20 active:scale-95">
                 <Save size={18} />
                 ذخیره تغییرات
             </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;