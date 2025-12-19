
import React, { useState, useEffect, useMemo } from 'react';
import { Chatbot, ContentItem } from '../../types';
import { directus } from '../../services/directus';
import { readItems, createItem, updateItem, deleteItem } from '@directus/sdk';
import { Plus, Search, Edit2, Trash2, Save, X, Check, Loader2, AlertCircle, HelpCircle, ShoppingBag, Link as LinkIcon, Image as ImageIcon, Database, ArrowUpDown, Calendar, Hash, RefreshCw } from 'lucide-react';
import ConfirmationModal from '../ConfirmationModal';

interface Props {
  selectedChatbot: Chatbot | null;
}

type SortOption = 'id' | 'date_created' | 'content_index';
type SortDirection = 'asc' | 'desc';

const ContentManager: React.FC<Props> = ({ selectedChatbot }) => {
  const [contents, setContents] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'faq' | 'product'>('all');
  
  const [sortOption, setSortOption] = useState<SortOption>('date_created');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [formData, setFormData] = useState<Partial<ContentItem>>({ content_type: 'faq' });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [indexingId, setIndexingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [mainError, setMainError] = useState<string | null>(null);
  const [confirmDeleteState, setConfirmDeleteState] = useState<{ isOpen: boolean; id: number } | null>(null);

  useEffect(() => {
    if (selectedChatbot) {
        fetchContents();
    } else {
        setContents([]);
    }
  }, [selectedChatbot]);

  const fetchContents = async () => {
    if (!selectedChatbot) return;
    setLoading(true);
    setMainError(null);
    try {
        // @ts-ignore
        const result = await directus.request(readItems('content', {
            filter: { content_chatbot: { _eq: selectedChatbot.id } },
            fields: ['*']
        }));
        setContents(result as ContentItem[]);
    } catch (err: any) {
        console.error("Failed to fetch contents:", err);
        setMainError('خطا در دریافت اطلاعات محتوا.');
    } finally {
        setLoading(false);
    }
  };

  const handleSort = (option: SortOption) => {
      if (sortOption === option) {
          setSortDirection(prev => prev === 'desc' ? 'asc' : 'desc');
      } else {
          setSortOption(option);
          setSortDirection('desc');
      }
  };

  const handleOpenModal = (item?: ContentItem) => {
      setError(null);
      if (item) {
          setEditingItem(item);
          setFormData({ ...item });
      } else {
          setEditingItem(null);
          setFormData({ 
              content_type: 'faq',
              content_question: '',
              content_answer: '',
              content_product: '',
              content_price: '',
              content_sku: '',
              content_details: '',
              content_link: '',
              content_image: '',
              content_index: false
          });
      }
      setIsModalOpen(true);
  };

  const handleSave = async () => {
      if (!selectedChatbot) return;
      
      if (formData.content_type === 'faq' && (!formData.content_question?.trim() || !formData.content_answer?.trim())) {
          setError("لطفا سوال و جواب را وارد کنید.");
          return;
      }
      if (formData.content_type === 'product' && !formData.content_product?.trim()) {
          setError("نام محصول الزامی است.");
          return;
      }

      setIsSaving(true);
      setError(null);

      try {
          const payload = { ...formData, content_chatbot: selectedChatbot.id };
          if (editingItem) {
              // @ts-ignore
              await directus.request(updateItem('content', editingItem.id, payload));
          } else {
              // @ts-ignore
              await directus.request(createItem('content', payload));
          }
          await fetchContents();
          setIsModalOpen(false);
      } catch (err: any) {
          setError("خطا در ذخیره‌سازی اطلاعات.");
      } finally {
          setIsSaving(false);
      }
  };

  const handleIndexToggle = async (item: ContentItem) => {
      if (indexingId) return;
      setIndexingId(item.id);
      try {
          const newIndexStatus = !item.content_index;
          // @ts-ignore
          await directus.request(updateItem('content', item.id, { content_index: newIndexStatus }));
          setContents(prev => prev.map(c => c.id === item.id ? { ...c, content_index: newIndexStatus } : c));
      } catch (err) {
          setMainError("خطا در بروزرسانی وضعیت ایندکس.");
      } finally {
          setIndexingId(null);
      }
  };

  const handleRequestDelete = (e: React.MouseEvent, id: number) => {
      e.stopPropagation(); 
      setConfirmDeleteState({ isOpen: true, id });
  };

  const handleConfirmDelete = async () => {
      if (!confirmDeleteState) return;
      const id = confirmDeleteState.id;
      setConfirmDeleteState(null);
      setDeletingId(id);
      setMainError(null);
      
      try {
          // The request below will wait for the Directus Flow (Filter) to complete Qdrant deletion
          // before returning. This is why we show a specific loading state.
          // @ts-ignore
          await directus.request(deleteItem('content', String(id)));
          setContents(prev => prev.filter(item => item.id !== id));
      } catch (err: any) {
          console.error("Delete failed:", err);
          setMainError('حذف محتوا با خطا مواجه شد. لطفا تنظیمات Flow و ارتباط با Qdrant را بررسی کنید.');
      } finally {
          setDeletingId(null);
      }
  };

  const processedContents = useMemo(() => {
      let filtered = contents.filter(item => {
        const searchStr = (item.content_question || '') + (item.content_answer || '') + (item.content_product || '') + (item.content_details || '');
        const matchesSearch = searchStr.includes(searchTerm);
        const matchesType = filterType === 'all' || item.content_type === filterType;
        return matchesSearch && matchesType;
      });

      return filtered.sort((a, b) => {
          let valA: any = a[sortOption];
          let valB: any = b[sortOption];
          if (sortOption === 'content_index') { valA = a.content_index ? 1 : 0; valB = b.content_index ? 1 : 0; }
          if (valA === valB) return 0;
          return sortDirection === 'desc' ? (valA > valB ? -1 : 1) : (valA > valB ? 1 : -1);
      });
  }, [contents, searchTerm, filterType, sortOption, sortDirection]);

  if (!selectedChatbot) return <div className="flex flex-col items-center justify-center h-64 text-gray-400"><AlertCircle size={48} className="mb-4 opacity-20" /><p>لطفا ابتدا یک چت‌بات را انتخاب کنید</p></div>;

  return (
    <>
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">مدیریت محتوا</h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">سوالات متداول و محصولات خود را برای پاسخگویی هوشمند ثبت کنید.</p>
                </div>
                <button onClick={() => handleOpenModal()} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 active:scale-95">
                    <Plus size={18} />
                    افزودن محتوا
                </button>
            </div>

            {mainError && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-2 animate-fade-in">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    {mainError}
                </div>
            )}

            <div className="flex flex-col gap-4">
                <div className="relative">
                    <Search size={20} className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400" />
                    <input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="جستجو در محتوا..." className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
                    <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl shrink-0 overflow-x-auto max-w-full">
                        <button onClick={() => setFilterType('all')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterType === 'all' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>همه</button>
                        <button onClick={() => setFilterType('faq')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterType === 'faq' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>سوالات</button>
                        <button onClick={() => setFilterType('product')} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${filterType === 'product' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700'}`}>محصولات</button>
                    </div>

                    <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 sm:pb-0">
                        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium whitespace-nowrap flex items-center gap-1"><ArrowUpDown size={14} />مرتب‌سازی:</span>
                        <button onClick={() => handleSort('date_created')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${sortOption === 'date_created' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}><Calendar size={14} />تاریخ{sortOption === 'date_created' && (sortDirection === 'asc' ? '↑' : '↓')}</button>
                        <button onClick={() => handleSort('id')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${sortOption === 'id' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}><Hash size={14} />شناسه{sortOption === 'id' && (sortDirection === 'asc' ? '↑' : '↓')}</button>
                        <button onClick={() => handleSort('content_index')} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors whitespace-nowrap ${sortOption === 'content_index' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50'}`}><Database size={14} />وضعیت{sortOption === 'content_index' && (sortDirection === 'asc' ? '↑' : '↓')}</button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="p-8 flex justify-center items-center gap-2 text-gray-400"><Loader2 className="animate-spin" size={20} />در حال بارگذاری...</div>
                ) : processedContents.length === 0 ? (
                    <div className="p-12 text-center text-gray-400">موردی یافت نشد. اولین محتوا را اضافه کنید.</div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                        {processedContents.map(item => (
                            <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group relative">
                                {deletingId === item.id && (
                                    <div className="absolute inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-[1px] z-10 flex items-center justify-center gap-3 animate-fade-in">
                                        <Loader2 size={24} className="animate-spin text-red-600" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-red-600">در حال پاکسازی حافظه (AI Memory)...</span>
                                            <span className="text-[10px] text-gray-500">لطفا پنجره را نبندید.</span>
                                        </div>
                                    </div>
                                )}
                                <div className="flex justify-between items-start gap-4">
                                    <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 shrink-0 self-start mt-1">
                                        {item.content_type === 'product' ? <ShoppingBag size={20} /> : <HelpCircle size={20} />}
                                    </div>
                                    
                                    <div className="space-y-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-[10px] font-mono text-gray-400 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/50 px-1.5 rounded border border-gray-100 dark:border-gray-800" title={`ID: ${item.id}`}>#{item.id}</span>
                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm md:text-base truncate max-w-full">{item.content_type === 'product' ? item.content_product : item.content_question}</h4>
                                            <div className="flex gap-1">
                                                <span className={`text-[10px] px-2 py-0.5 rounded border ${item.content_type === 'product' ? 'bg-purple-50 text-purple-600 border-purple-100 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400' : 'bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400'}`}>{item.content_type === 'product' ? 'محصول' : 'FAQ'}</span>
                                                {item.content_index ? (
                                                    <span className="flex items-center gap-1 text-[10px] bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full border border-green-100 dark:border-green-800"><Check size={10} />Indexed</span>
                                                ) : (
                                                    <span className="flex items-center gap-1 text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700"><Database size={10} />Saved</span>
                                                )}
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">{item.content_type === 'product' ? item.content_details : item.content_answer}</p>
                                    </div>

                                    <div className="flex items-center gap-1 opacity-100 lg:opacity-0 lg:group-hover:opacity-100 transition-opacity self-start mt-1">
                                        <button onClick={() => handleIndexToggle(item)} disabled={indexingId === item.id || deletingId !== null} className={`p-2 rounded-lg transition-colors flex items-center justify-center ${item.content_index ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30' : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30'}`} title={item.content_index ? 'حذف از ایندکس' : 'ایندکس کردن محتوا'}>
                                            {indexingId === item.id ? <Loader2 size={16} className="animate-spin" /> : (item.content_index ? <RefreshCw size={16} /> : <Database size={16} />)}
                                        </button>
                                        <button onClick={() => handleOpenModal(item)} disabled={deletingId !== null} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors" title="ویرایش"><Edit2 size={16} /></button>
                                        <button onClick={(e) => handleRequestDelete(e, item.id)} disabled={deletingId !== null} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="حذف"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

        {isModalOpen && (
            <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 animate-fade-in" onClick={() => setIsModalOpen(false)}>
                <div className="bg-white dark:bg-gray-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-800 shrink-0">
                        <h3 className="font-bold text-gray-800 dark:text-white">{editingItem ? 'ویرایش محتوا' : 'افزودن محتوا جدید'}</h3>
                        <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
                    </div>
                    <div className="p-6 space-y-4 overflow-y-auto">
                        {error && <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 flex items-start gap-2"><AlertCircle size={16} className="shrink-0 mt-0.5" />{error}</div>}
                        <div>
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">نوع محتوا</label>
                            <div className="flex gap-2">
                                <button onClick={() => setFormData({ ...formData, content_type: 'faq' })} className={`flex-1 py-2 rounded-xl border transition-all text-sm font-medium flex items-center justify-center gap-2 ${formData.content_type === 'faq' ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400 ring-1 ring-amber-500' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}><HelpCircle size={16} />سوال متداول (FAQ)</button>
                                <button onClick={() => setFormData({ ...formData, content_type: 'product' })} className={`flex-1 py-2 rounded-xl border transition-all text-sm font-medium flex items-center justify-center gap-2 ${formData.content_type === 'product' ? 'bg-purple-50 border-purple-200 text-purple-700 dark:bg-purple-900/20 dark:border-purple-800 dark:text-purple-400 ring-1 ring-purple-500' : 'bg-gray-50 border-gray-200 text-gray-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400'}`}><ShoppingBag size={16} />محصول</button>
                            </div>
                        </div>
                        {formData.content_type === 'faq' ? (
                            <>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">سوال کاربر</label><input type="text" value={formData.content_question || ''} onChange={(e) => setFormData({ ...formData, content_question: e.target.value })} placeholder="مثال: هزینه ارسال چقدر است؟" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all" /></div>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">پاسخ ربات</label><textarea value={formData.content_answer || ''} onChange={(e) => setFormData({ ...formData, content_answer: e.target.value })} rows={4} placeholder="پاسخی که ربات باید دقیقا ارائه دهد..." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all resize-none" /></div>
                            </>
                        ) : (
                            <>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام محصول</label><input type="text" value={formData.content_product || ''} onChange={(e) => setFormData({ ...formData, content_product: e.target.value })} placeholder="مثال: گوشی آیفون ۱۳" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all" /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">قیمت (تومان)</label><input type="text" value={formData.content_price || ''} onChange={(e) => setFormData({ ...formData, content_price: e.target.value })} placeholder="50,000,000" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all" /></div>
                                    <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">کد محصول (SKU)</label><input type="text" value={formData.content_sku || ''} onChange={(e) => setFormData({ ...formData, content_sku: e.target.value })} placeholder="P-1234" className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all dir-ltr text-right" /></div>
                                </div>
                                <div className="space-y-2"><label className="text-sm font-medium text-gray-700 dark:text-gray-300">توضیحات و جزئیات</label><textarea value={formData.content_details || ''} onChange={(e) => setFormData({ ...formData, content_details: e.target.value })} rows={3} placeholder="ویژگی‌ها، رنگ‌بندی و..." className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all resize-none" /></div>
                            </>
                        )}
                        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-bold text-gray-50 dark:text-gray-400 mb-3">اطلاعات تکمیلی (مشترک)</h4>
                            <div className="space-y-3">
                                <div className="space-y-1"><label className="text-xs text-gray-600 dark:text-gray-400">لینک مرتبط (URL)</label><div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"><LinkIcon size={14} className="text-gray-400" /><input type="text" value={formData.content_link || ''} onChange={(e) => setFormData({ ...formData, content_link: e.target.value })} placeholder="https://..." className="flex-1 bg-transparent outline-none text-sm dir-ltr text-left" /></div></div>
                                <div className="space-y-1"><label className="text-xs text-gray-600 dark:text-gray-400">لینک تصویر (URL)</label><div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2"><ImageIcon size={14} className="text-gray-400" /><input type="text" value={formData.content_image || ''} onChange={(e) => setFormData({ ...formData, content_image: e.target.value })} placeholder="https://..." className="flex-1 bg-transparent outline-none text-sm dir-ltr text-left" /></div></div>
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 flex justify-end gap-3 shrink-0">
                        <button onClick={() => setIsModalOpen(false)} disabled={isSaving} className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm font-medium">انصراف</button>
                        <button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium shadow-md shadow-blue-600/20 disabled:opacity-70">{isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}{isSaving ? 'در حال ذخیره...' : 'ذخیره'}</button>
                    </div>
                </div>
            </div>
        )}

        {confirmDeleteState && (
            <ConfirmationModal 
                isOpen={confirmDeleteState.isOpen}
                onClose={() => setConfirmDeleteState(null)}
                onConfirm={handleConfirmDelete}
                title="حذف نهایی محتوا"
                message={
                    <div className="space-y-3">
                        <p>آیا از حذف این آیتم اطمینان دارید؟</p>
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-800">
                             <div className="flex items-start gap-2 text-xs text-red-700 dark:text-red-400 leading-relaxed">
                                <AlertCircle size={14} className="shrink-0 mt-0.5" />
                                <span>با تایید شما، ابتدا وکتور متناظر از Qdrant حذف شده و سپس رکورد از دیتابیس پاک می‌گردد. این عملیات غیرقابل بازگشت است.</span>
                             </div>
                        </div>
                    </div>
                }
                confirmText="حذف از وکتور و دیتابیس"
                confirmVariant="danger"
            />
        )}
    </>
  );
};

export default ContentManager;
