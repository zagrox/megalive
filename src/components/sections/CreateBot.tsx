

import React, { useState } from 'react';
import { Bot, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { Chatbot } from '../../types';
import { syncProfileStats } from '../../services/chatbotService';
import { useAuth } from '../../context/AuthContext';

interface Props {
  onSubmit: (name: string, slug: string, businessName: string) => Promise<Chatbot | null>;
  onCancel?: () => void;
}

const CreateBot: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Clean slug: only lowercase english letters
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z]/g, ''); // Remove anything that is NOT a lowercase letter
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setName(val);
    
    // Auto-generate slug if the user hasn't typed a custom one (or if it matches the auto-gen of previous name)
    // We simple check if slug is empty or follows the pattern to decide whether to auto-update
    if (!slug || slug === generateSlug(val.slice(0, -1))) {
        setSlug(generateSlug(val));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
     const val = e.target.value;
     setSlug(generateSlug(val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !businessName) return;

    setLoading(true);
    setError(null);
    try {
      const newBot = await onSubmit(name, slug, businessName);
      if (newBot && user) {
        // Sync stats after creation (e.g. increase bot count)
        await syncProfileStats(user.id);
        await refreshUser();
      }
    } catch (err: any) {
      // Directus unique constraint error code is usually RECORD_NOT_UNIQUE
      if (err?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
         setError('این شناسه (Slug) قبلا استفاده شده است. لطفا شناسه دیگری انتخاب کنید.');
      } else {
         setError('خطا در ساخت چت‌بات. لطفا مجددا تلاش کنید.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-xl mx-auto">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-600/10">
           <Bot size={32} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ساخت چت‌بات جدید</h2>
        <p className="text-gray-500 dark:text-gray-400">مشخصات اولیه دستیار هوشمند خود را وارد کنید</p>
      </div>

      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-8 shadow-sm">
         {error && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3 text-sm">
               <AlertCircle size={18} className="shrink-0 mt-0.5" />
               <span>{error}</span>
            </div>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">نام نمایشی ربات</label>
               <input 
                  type="text" 
                  value={name}
                  onChange={handleNameChange}
                  placeholder="مثال: پشتیبانی فروش"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
                  required
               />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">نام کامل کسب و کار</label>
              <input 
                type="text" 
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="مثال: شرکت بازرگانی پرشیا"
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                این نام برای درک بهتر زمینه فعالیت شما توسط ربات استفاده می‌شود.
              </p>
            </div>

            <div className="space-y-2">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">شناسه یکتا (Slug)</label>
               <input 
                  type="text" 
                  value={slug}
                  onChange={handleSlugChange}
                  placeholder="mycompany"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all text-left dir-ltr font-mono text-sm"
                  required
                  pattern="[a-z]+"
                  title="فقط حروف انگلیسی کوچک (بدون عدد یا نماد)"
               />
               <p className="text-xs text-gray-500 dark:text-gray-400">
                  فقط حروف انگلیسی کوچک مجاز است (بدون فاصله، عدد یا نماد).
               </p>
            </div>

            <div className="pt-4 flex items-center gap-4">
               {onCancel && (
                  <button 
                      type="button" 
                      onClick={onCancel}
                      className="flex-1 py-3.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                      انصراف
                  </button>
               )}
               <button 
                  type="submit" 
                  disabled={loading || !name || !slug || !businessName}
                  className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed ${onCancel ? 'flex-[2]' : 'w-full flex-1'}`}
               >
                  {loading ? <Loader2 className="animate-spin" /> : (
                     <>
                        <span>ایجاد ربات</span>
                        <ArrowLeft size={18} />
                     </>
                  )}
               </button>
            </div>
         </form>
      </div>
    </div>
  );
};

export default CreateBot;