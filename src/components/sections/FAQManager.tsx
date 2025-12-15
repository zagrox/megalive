
import React, { useState, useEffect } from 'react';
import { Chatbot, FAQItem } from '../../types';
import { directus } from '../../services/directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { Plus, Search, Edit2, Trash2, Save, X, Check, Loader2, AlertCircle } from 'lucide-react';

interface Props {
  selectedChatbot: Chatbot | null;
}

const FAQManager: React.FC<Props> = ({ selectedChatbot }) => {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<FAQItem | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (selectedChatbot) {
        fetchFAQs();
    } else {
        setFaqs([]);
    }
  }, [selectedChatbot]);

  const fetchFAQs = async () => {
    if (!selectedChatbot) return;
    setLoading(true);
    try {
        // @ts-ignore
        const result = await directus.request(readItems('faq_items', {
            filter: { chatbot: { _eq: selectedChatbot.id } },
            sort: ['-date_created']
        }));
        setFaqs(result as FAQItem[]);
    } catch (err) {
        console.error("Failed to fetch FAQs:", err);
    } finally {
        setLoading(false);
    }
  };

  const handleOpenModal = (item?: FAQItem) => {
      setError(null);
      if (item) {
          setEditingItem(item);
          setQuestion(item.question);
          setAnswer(item.answer);
      } else {
          setEditingItem(null);
          setQuestion('');
          setAnswer('');
      }
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!selectedChatbot || !question.trim() || !answer.trim()) return;
      setIsSaving(true);
      setError(null);

      try {
          // Note: Embedding and Qdrant Sync is now handled by Directus Flows.
          // We simply create/update the record here.

          // 1. Save to Directus
          if (editingItem) {
              // Update
              // @ts-ignore
              await directus.request(updateItem('faq_items', editingItem.id, {
                  question,
                  answer,
                  is_indexed: true // Trigger for the flow
              }));
          } else {
              // Create
              // @ts-ignore
              await directus.request(createItem('faq_items', {
                  question,
                  answer,
                  chatbot: selectedChatbot.id,
                  is_indexed: true // Trigger for the flow
              }));
          }

          // Refresh list
          await fetchFAQs();
          setIsModalOpen(false);

      } catch (err: any) {
          console.error("Save failed:", err);
          setError("خطا در ذخیره‌سازی. لطفا ارتباط با سرور را بررسی کنید.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleDelete = async (id: number) => {
      if (!confirm("آیا از حذف این سوال اطمینان دارید؟")) return;
      
      try {
          // 1. Delete from Directus (Flow handles Qdrant cleanup)
          // @ts-ignore
          await directus.request(deleteItem('faq_items', id));
          
          setFaqs(prev => prev.filter(item => item.id !== id));
      } catch (err) {
          console.error("Delete failed:", err);
          alert("خطا در حذف آیتم.");
      }
  };

  const filteredFaqs = faqs.filter(f => 
      f.question.includes(searchTerm) || f.answer.includes(searchTerm)
  );

  if (!selectedChatbot) return <div className="flex flex-col items-center justify-center h-64 text-gray-400"><AlertCircle size={48} className="mb-4 opacity-20" /><p>لطفا ابتدا یک چت‌بات را انتخاب کنید</p></div>;

  return (
    <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت سوالات متداول</h2>
                <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">سوالات و پاسخ‌های دقیق را مستقیماً به حافظه ربات اضافه کنید.</p>
            </div>
            <button 
                onClick={() => handleOpenModal()}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95"
            >
                <Plus size={18} />
                افزودن سوال جدید
            </button>
        </div>

        {/* Search */}
        <div className="relative">
            <Search size={20} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
            <input 
                type="text" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="جستجو در سوالات..."
                className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
            />
        </div>

        {/* List */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
            {loading ? (
                <div className="p-8 flex justify-center items-center gap-2 text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    در حال بارگذاری...
                </div>
            ) : filteredFaqs.length === 0 ? (
                <div className="p-12 text-center text-gray-400">
                    موردی یافت نشد. اولین سوال خود را اضافه کنید.
                </div>
            ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                    {filteredFaqs.map(item => (
                        <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                            <div className="flex justify-between items-start gap-4">
                                <div className="space-y-1 flex-1">
                                    <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base">{item.question}</h4>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{item.answer}</p>
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button 
                                        onClick={() => handleOpenModal(item)}
                                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                        title="ویرایش"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                        title="حذف"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <div className="mt-2 flex items-center gap-2">
                                {item.is_indexed ? (
                                    <span className="flex items-center gap-1 text-[10px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800">
                                        <Check size={10} />
                                        Index Synced
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-800">
                                        <Loader2 size={10} className="animate-spin" />
                                        Pending Sync
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
                <div 
                    className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800">
                        <h3 className="font-bold text-gray-800 dark:text-white">
                            {editingItem ? 'ویرایش سوال' : 'افزودن سوال جدید'}
                        </h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    </div>
                    
                    <div className="p-6 space-y-4">
                        {error && (
                            <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-2">
                                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">سوال کاربر</label>
                            <input 
                                type="text" 
                                value={question} 
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="مثال: هزینه ارسال چقدر است؟"
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">پاسخ ربات</label>
                            <textarea 
                                value={answer} 
                                onChange={(e) => setAnswer(e.target.value)}
                                rows={5}
                                placeholder="پاسخی که ربات باید دقیقا ارائه دهد..."
                                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all resize-none"
                            />
                        </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3">
                        <button 
                            onClick={() => setIsModalOpen(false)}
                            disabled={isSaving}
                            className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium"
                        >
                            انصراف
                        </button>
                        <button 
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md shadow-blue-600/20 disabled:opacity-70"
                        >
                            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                            {isSaving ? 'در حال ذخیره...' : 'ذخیره'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default FAQManager;
