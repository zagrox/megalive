import React, { useState, useEffect } from 'react';
import { Chatbot } from '../../types';
import { Wand2, Save, AlertCircle, Loader2, Check } from 'lucide-react';
import { generateSystemPrompt } from '../../services/geminiService';

interface Props {
  selectedChatbot: Chatbot | null;
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
  onPreviewUpdate?: (data: Partial<Chatbot>) => void;
}

const GeneralSettings: React.FC<Props> = ({ selectedChatbot, onUpdateChatbot, onPreviewUpdate }) => {
  const [formData, setFormData] = useState<Partial<Chatbot>>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [businessDesc, setBusinessDesc] = useState('');
  const [showPromptGen, setShowPromptGen] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (selectedChatbot) {
      setFormData({
        chatbot_name: selectedChatbot.chatbot_name || '',
        chabot_title: selectedChatbot.chabot_title || '', // Handles typo from DB
        chatbot_prompt: selectedChatbot.chatbot_prompt || '',
      });
    }
  }, [selectedChatbot]);

  const handleSave = async () => {
    if (!selectedChatbot) return;
    setLoading(true);
    setSuccess(false);
    try {
      await onUpdateChatbot(selectedChatbot.id, formData);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePrompt = async () => {
    if (!businessDesc) return;
    setGenerating(true);
    try {
      const prompt = await generateSystemPrompt(businessDesc);
      setFormData(prev => ({ ...prev, chatbot_prompt: prompt }));
      onPreviewUpdate?.({ chatbot_prompt: prompt });
      setShowPromptGen(false);
    } catch (e) {
      // Handle error
    } finally {
      setGenerating(false);
    }
  };

  if (!selectedChatbot) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p>لطفا ابتدا یک چت‌بات را انتخاب کنید</p>
      </div>
    );
  }

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
            value={formData.chatbot_name || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, chatbot_name: val }));
              onPreviewUpdate?.({ chatbot_name: val });
            }}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Description / Title */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات کوتاه (Title)</label>
          <textarea
            value={formData.chabot_title || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, chabot_title: val }));
              onPreviewUpdate?.({ chabot_title: val });
            }}
            rows={2}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all resize-none"
          />
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
            value={formData.chatbot_prompt || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, chatbot_prompt: val }));
              onPreviewUpdate?.({ chatbot_prompt: val });
            }}
            rows={8}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all font-mono text-sm leading-relaxed"
          />
          <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
            <AlertCircle size={12} />
            این دستورالعمل شخصیت و نحوه پاسخگویی بات را تعیین می‌کند.
          </p>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
             <button 
               onClick={handleSave}
               disabled={loading}
               className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-gray-900/20 dark:shadow-blue-600/20 active:scale-95 disabled:opacity-70
                 ${success ? 'bg-green-600 text-white' : 'bg-gray-900 dark:bg-blue-600 text-white hover:bg-gray-800 dark:hover:bg-blue-700'}`}
             >
                 {loading ? (
                   <Loader2 size={18} className="animate-spin" />
                 ) : success ? (
                   <Check size={18} />
                 ) : (
                   <Save size={18} />
                 )}
                 {success ? 'ذخیره شد' : 'ذخیره تغییرات'}
             </button>
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;