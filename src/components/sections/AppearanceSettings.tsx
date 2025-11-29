
import React, { useState, useEffect, useRef } from 'react';
import { Chatbot } from '../../types';
import { Save, Upload, Loader2, Check, AlertCircle, Plus, X } from 'lucide-react';
import { directus, getAssetUrl } from '../../services/directus';
import { uploadFiles, deleteFile } from '@directus/sdk';
import { HexColorPicker } from 'react-colorful';

interface Props {
  selectedChatbot: Chatbot | null;
  onUpdateChatbot: (id: number, data: Partial<Chatbot>) => Promise<void>;
  onPreviewUpdate?: (data: Partial<Chatbot>) => void;
}

const AVATAR_FOLDER_ID = "3469b6ba-b2e0-40de-b58d-5da0385c404d";

const AppearanceSettings: React.FC<Props> = ({ selectedChatbot, onUpdateChatbot, onPreviewUpdate }) => {
  const [formData, setFormData] = useState<Partial<Chatbot>>({});
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [suggestionInput, setSuggestionInput] = useState('');
  
  // Color Picker State
  const [showColorPicker, setShowColorPicker] = useState(false);
  const colorPickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedChatbot) {
      setFormData({
        chatbot_welcome: selectedChatbot.chatbot_welcome || '',
        chatbot_logo: selectedChatbot.chatbot_logo,
        chatbot_color: selectedChatbot.chatbot_color || '#3b82f6',
        chatbot_input: selectedChatbot.chatbot_input || '',
        chatbot_suggestion: selectedChatbot.chatbot_suggestion || [],
      });
    }
  }, [selectedChatbot]);

  // Handle click outside to close color picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        setShowColorPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      // 1. Try to delete old avatar if exists
      const oldLogoId = formData.chatbot_logo;
      if (oldLogoId) {
        try {
          // @ts-ignore
          await directus.request(deleteFile(oldLogoId));
        } catch (delError) {
          console.warn("Could not delete old avatar (might not exist or permission denied):", delError);
          // Proceed with upload regardless
        }
      }

      // 2. Upload new avatar to specific folder
      const file = e.target.files[0];
      const form = new FormData();
      form.append('file', file);
      form.append('folder', AVATAR_FOLDER_ID);
      
      // @ts-ignore
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
      // Reset input so the same file can be selected again if needed
      e.target.value = '';
    }
  };

  const addSuggestion = () => {
    const currentSuggestions = formData.chatbot_suggestion || [];
    if (currentSuggestions.length >= 3) return;
    
    const text = suggestionInput.trim();
    if (!text) return;

    const newSuggestions = [...currentSuggestions, text];
    setFormData(prev => ({ ...prev, chatbot_suggestion: newSuggestions }));
    onPreviewUpdate?.({ chatbot_suggestion: newSuggestions });
    setSuggestionInput('');
  };

  const removeSuggestion = (index: number) => {
    const currentSuggestions = formData.chatbot_suggestion || [];
    const newSuggestions = currentSuggestions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, chatbot_suggestion: newSuggestions }));
    onPreviewUpdate?.({ chatbot_suggestion: newSuggestions });
  };

  const handleSuggestionKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSuggestion();
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

  const suggestions = formData.chatbot_suggestion || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">ظاهر و پیام‌های چت‌بات را شخصی‌سازی کنید.</p>
      </div>

      <div className="space-y-8">

        {/* Color Theme */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">رنگ اصلی</label>
          
          <div className="flex items-start gap-4 relative" ref={colorPickerRef}>
             {/* Color Trigger Button */}
             <button 
                type="button"
                onClick={() => setShowColorPicker(!showColorPicker)}
                className="w-12 h-12 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex-shrink-0 transition-transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                style={{ backgroundColor: formData.chatbot_color || '#3b82f6' }}
                title="تغییر رنگ"
             ></button>
             
             {/* Hex Input & Description */}
             <div className="space-y-2">
                 <div className="relative w-32">
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono text-sm pointer-events-none">#</span>
                    <input
                        type="text"
                        value={(formData.chatbot_color || '').substring(1)}
                        onChange={(e) => {
                            const val = e.target.value.replace(/[^0-9a-fA-F]/g, '');
                            const newColor = '#' + val;
                            setFormData(prev => ({ ...prev, chatbot_color: newColor }));
                            
                            if (val.length === 6 || val.length === 3) {
                                onPreviewUpdate?.({ chatbot_color: newColor });
                            }
                        }}
                        maxLength={6}
                        className="w-full pr-7 pl-3 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all dir-ltr font-mono text-sm text-left"
                    />
                 </div>
                 <p className="text-xs text-gray-500 dark:text-gray-400">
                    این رنگ برای هدر چت‌بات، دکمه‌ها و پیام‌های کاربر استفاده می‌شود.
                 </p>
             </div>

             {/* Picker Popover */}
             {showColorPicker && (
                <div className="absolute top-14 right-0 z-20 p-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 shadow-xl animate-fade-in">
                  <HexColorPicker 
                    color={formData.chatbot_color || '#3b82f6'} 
                    onChange={(color) => {
                        setFormData(prev => ({ ...prev, chatbot_color: color }));
                        onPreviewUpdate?.({ chatbot_color: color });
                    }} 
                  />
                </div>
             )}
          </div>
        </div>


        {/* Avatar Upload */}
        <div className="grid gap-2">
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

        {/* Chat Suggestions (Quick Replies) */}
        <div className="grid gap-2">
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سوالات پیشنهادی (حداکثر ۳ مورد)</label>
                <span className="text-xs text-gray-400">{suggestions.length}/3</span>
            </div>
            <div className="relative">
                <input
                    type="text"
                    value={suggestionInput}
                    onChange={(e) => setSuggestionInput(e.target.value)}
                    onKeyDown={handleSuggestionKeyPress}
                    disabled={suggestions.length >= 3}
                    placeholder={suggestions.length >= 3 ? "ظرفیت تکمیل است" : "متن سوال را بنویسید و اینتر بزنید..."}
                    className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all disabled:bg-gray-100 dark:disabled:bg-gray-900 disabled:cursor-not-allowed"
                />
                <button 
                    onClick={addSuggestion}
                    disabled={suggestions.length >= 3 || !suggestionInput.trim()}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 disabled:opacity-0 transition-all"
                >
                    <Plus size={16} />
                </button>
            </div>
            
            {/* Suggestions List (Tags) */}
            {suggestions.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700">
                            <span>{suggestion}</span>
                            <button 
                                onClick={() => removeSuggestion(index)}
                                className="p-0.5 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-500 rounded-full transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
             <p className="text-xs text-gray-400">این گزینه‌ها به عنوان دکمه‌های سریع بالای باکس ورودی نمایش داده می‌شوند.</p>
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
