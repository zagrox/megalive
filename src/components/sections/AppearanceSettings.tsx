import React, { useState, useEffect } from 'react';
import { Chatbot } from '../../types';
import { Save, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { directus, getAssetUrl } from '../../services/directus';
import { uploadFiles } from '@directus/sdk';
import { HexColorPicker } from 'react-colorful';

interface Props {
  selectedChatbot: Chatbot | null;
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
  onPreviewUpdate?: (data: Partial<Chatbot>) => void;
}

const AppearanceSettings: React.FC<Props> = ({ selectedChatbot, onUpdateChatbot, onPreviewUpdate }) => {
  const [formData, setFormData] = useState<Partial<Chatbot>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (selectedChatbot) {
      setFormData({
        chatbot_welcome: selectedChatbot.chatbot_welcome || '',
        chatbot_logo: selectedChatbot.chatbot_logo,
        chatbot_color: selectedChatbot.chatbot_color || '#3b82f6',
        chatbot_input: selectedChatbot.chatbot_input || '',
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0] || !selectedChatbot) return;
    
    setUploading(true);
    try {
      const file = e.target.files[0];
      const form = new FormData();
      form.append('file', file);
      
      const result = await directus.request(uploadFiles(form));
      // The result usually is the file object or array depending on endpoint version, 
      // for single upload SDK returns the object.
      const fileId = result.id;

      setFormData(prev => ({ ...prev, chatbot_logo: fileId }));
      onPreviewUpdate?.({ chatbot_logo: fileId });
      
    } catch (error) {
      console.error("Upload failed:", error);
      alert("خطا در آپلود تصویر");
    } finally {
      setUploading(false);
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

  const logoPreview = formData.chatbot_logo 
    ? getAssetUrl(formData.chatbot_logo) 
    : 'https://via.placeholder.com/150';

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">ظاهر و پیام‌های چت‌بات را شخصی‌سازی کنید.</p>
      </div>

      <div className="space-y-8">
        {/* Welcome Message */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">پیام خوش‌آمدگویی</label>
          <input
            type="text"
            value={formData.chatbot_welcome || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, chatbot_welcome: val }));
              onPreviewUpdate?.({ chatbot_welcome: val });
            }}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Input Placeholder */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">متن ورودی (Placeholder)</label>
          <input
            type="text"
            value={formData.chatbot_input || ''}
            onChange={(e) => {
              const val = e.target.value;
              setFormData(prev => ({ ...prev, chatbot_input: val }));
              onPreviewUpdate?.({ chatbot_input: val });
            }}
            placeholder="مثال: پیام خود را بنویسید..."
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
          />
        </div>

        {/* Avatar Upload */}
        <div>
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">آواتار ربات</label>
             <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                 <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden relative flex-shrink-0">
                    {uploading ? (
                      <div className="w-full h-full flex items-center justify-center">
                        <Loader2 className="animate-spin text-blue-500" size={20} />
                      </div>
                    ) : (
                      <img src={logoPreview} alt="Avatar" className="w-full h-full object-cover" />
                    )}
                 </div>
                 <div className="flex-1">
                    <button 
                      onClick={() => document.getElementById('avatar-upload')?.click()}
                      className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors w-full justify-center border border-blue-200 dark:border-blue-800 border-dashed"
                      disabled={uploading}
                    >
                        <Upload size={16} />
                        {uploading ? 'در حال آپلود...' : 'آپلود تصویر جدید'}
                    </button>
                    <input 
                      id="avatar-upload" 
                      type="file" 
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                 </div>
             </div>
        </div>

        {/* Color Theme */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رنگ اصلی</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
              <HexColorPicker 
                color={formData.chatbot_color || '#3b82f6'} 
                onChange={(color) => {
                  setFormData(prev => ({ ...prev, chatbot_color: color }));
                  onPreviewUpdate?.({ chatbot_color: color });
                }} 
              />
            </div>
            <div className="space-y-3 pt-2">
               <div className="flex items-center gap-2">
                  <div 
                    className="w-10 h-10 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700"
                    style={{ backgroundColor: formData.chatbot_color || '#3b82f6' }}
                  ></div>
                  <div className="text-sm dir-ltr font-mono text-gray-600 dark:text-gray-400">
                    {formData.chatbot_color || '#3b82f6'}
                  </div>
               </div>
               <p className="text-xs text-gray-500 max-w-[200px]">
                 این رنگ برای هدر چت‌بات، دکمه‌ها و پیام‌های کاربر استفاده می‌شود.
               </p>
            </div>
          </div>
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
                 {success ? 'ذخیره شد' : 'ذخیره ظاهر'}
             </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;