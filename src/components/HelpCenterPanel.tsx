import React, { useState, useEffect } from 'react';
import { X, BookOpen, HelpCircle as FaqIcon, MessageSquare, Phone, Mail, ChevronDown, Loader2, AlertCircle, PlayCircle, UploadCloud, Settings, Rocket, FileText } from 'lucide-react';
import { directus } from '../services/directus';
import { readItems } from '@directus/sdk';
import { SystemFAQ } from '../types';

interface HelpCenterPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const FAQItem: React.FC<{ title: string; openFaq: number | null; index: number; setOpenFaq: (index: number | null) => void; children: React.ReactNode }> = ({ title, openFaq, index, setOpenFaq, children }) => {
  const isOpen = openFaq === index;
  return (
    <div className="border-b border-gray-200 dark:border-gray-700">
      <button
        onClick={() => setOpenFaq(isOpen ? null : index)}
        className="flex justify-between items-center w-full py-4 text-right"
      >
        <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm md:text-base leading-snug ml-2">{title}</span>
        <ChevronDown
          size={20}
          className={`text-gray-500 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed text-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

const GuideStep: React.FC<{ icon: React.ReactNode; title: string; children: React.ReactNode; number: number }> = ({ icon, title, children, number }) => (
    <div className="relative pl-0 pr-8 pb-8 border-r border-gray-200 dark:border-gray-800 last:border-0 last:pb-0">
        <span className="absolute -right-3 top-0 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 border-2 border-white dark:border-gray-900 flex items-center justify-center text-xs font-bold z-10">
            {number}
        </span>
        <div className="flex items-center gap-2 mb-2">
            <div className="text-gray-500 dark:text-gray-400">
                {icon}
            </div>
            <h4 className="font-bold text-gray-800 dark:text-white text-base">{title}</h4>
        </div>
        <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed space-y-2">
            {children}
        </div>
    </div>
);

const HelpCenterPanel: React.FC<HelpCenterPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact'>('guide');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  
  // Dynamic FAQ State
  const [systemFaqs, setSystemFaqs] = useState<SystemFAQ[]>([]);
  const [loadingFaqs, setLoadingFaqs] = useState(false);
  const [errorFaqs, setErrorFaqs] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && activeTab === 'faq' && systemFaqs.length === 0) {
        const fetchFaqs = async () => {
            setLoadingFaqs(true);
            setErrorFaqs(null);
            try {
                // @ts-ignore
                const result = await directus.request(readItems('faq', {
                    filter: { status: { _eq: 'published' } },
                    limit: -1
                }));
                setSystemFaqs(result as SystemFAQ[]);
            } catch (err: any) {
                console.error("Failed to fetch system FAQs:", err);
                // Robust error extraction
                let msg = 'خطا در برقراری ارتباط با سرور';
                if (typeof err === 'string') msg = err;
                else if (err?.errors?.[0]?.message) msg = err.errors[0].message;
                else if (err?.message) msg = err.message;
                
                setErrorFaqs(msg);
            } finally {
                setLoadingFaqs(false);
            }
        };
        fetchFaqs();
    }
  }, [isOpen, activeTab]);

  const TABS = [
    { id: 'guide' as const, label: 'راهنمای شروع', icon: <BookOpen size={20} /> },
    { id: 'faq' as const, label: 'پرسش و پاسخ', icon: <FaqIcon size={20} /> },
    { id: 'contact' as const, label: 'پشتیبانی', icon: <MessageSquare size={20} /> },
  ];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      {/* Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-xl z-50 transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-blue-600 dark:bg-gray-900">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <FaqIcon size={20} className="text-white/80" />
            مرکز راهنمایی
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0 bg-gray-50 dark:bg-gray-950">
          <div className="flex items-center gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm border border-gray-200 dark:border-gray-700' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-gray-900 custom-scrollbar">
          {activeTab === 'guide' && (
            <div className="animate-fade-in pb-10">
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 text-sm mb-2">به مگالایو خوش آمدید!</h3>
                    <p className="text-xs text-blue-700 dark:text-blue-400 leading-relaxed">
                        این پلتفرم به شما کمک می‌کند بدون نیاز به دانش برنامه‌نویسی، یک دستیار هوشمند اختصاصی برای پاسخگویی ۲۴ ساعته به مشتریان خود بسازید.
                    </p>
                </div>

                <div className="space-y-2">
                    <GuideStep number={1} icon={<PlayCircle size={18}/>} title="ساخت اولین ربات">
                        <p>از منوی «ساخت ربات جدید»، نام نمایشی (مثلاً «پشتیبانی فروش») و یک شناسه انگلیسی یکتا (Slug) انتخاب کنید.</p>
                        <p className="text-xs text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/20 p-2 rounded mt-2">
                            نکته: شناسه (Slug) باید فقط شامل حروف کوچک انگلیسی باشد و بعد از ساخت قابل تغییر نیست.
                        </p>
                    </GuideStep>

                    <GuideStep number={2} icon={<UploadCloud size={18}/>} title="آموزش (پایگاه دانش)">
                        <p>مهم‌ترین بخش! به تب «پایگاه دانش» بروید و فایل‌های PDF، Word یا متنی خود را آپلود کنید. این فایل‌ها مغز ربات شما هستند.</p>
                        <ul className="list-disc list-inside mt-2 space-y-1 marker:text-gray-400">
                            <li>اطلاعات محصولات و قیمت‌ها</li>
                            <li>قوانین و مقررات</li>
                            <li>سوالات متداول</li>
                        </ul>
                        <p className="mt-2 font-medium">پس از آپلود، حتماً دکمه «پردازش» (Build) را بزنید تا ربات آن‌ها را یاد بگیرد.</p>
                    </GuideStep>

                    <GuideStep number={3} icon={<Settings size={18}/>} title="شخصی‌سازی رفتار">
                        <p>در تب «تنظیمات عمومی» می‌توانید دستورالعمل سیستم (System Prompt) را ویرایش کنید.</p>
                        <p>مثلاً بنویسید: "تو یک مشاور املاک حرفه‌ای هستی که با لحنی رسمی و مؤدبانه صحبت می‌کنی."</p>
                    </GuideStep>

                    <GuideStep number={4} icon={<Rocket size={18}/>} title="انتشار نهایی">
                        <p>پس از تست ربات در پیش‌نمایش، به تب «انتشار» بروید.</p>
                        <p>کد اسکریپت را کپی کرده و در انتهای تگ <code>&lt;body&gt;</code> سایت خود قرار دهید. آیکون چت بلافاصله در گوشه سایت شما ظاهر می‌شود.</p>
                    </GuideStep>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
                    <h4 className="font-bold text-gray-800 dark:text-white mb-3 flex items-center gap-2">
                        <FileText size={18} className="text-green-500"/>
                        نکات طلایی برای پاسخ‌های بهتر
                    </h4>
                    <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                            <span>فایل‌های PDF باید دارای متن قابل انتخاب (Text-based) باشند. فایل‌های اسکن شده (تصویری) قابل خواندن نیستند.</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                            <span>سعی کنید هر موضوع را در یک فایل جداگانه آپلود کنید (مثلاً "لیست قیمت.pdf" جدا از "قوانین.pdf").</span>
                        </li>
                        <li className="flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-2 shrink-0"></span>
                            <span>در تنظیمات پیشرفته، می‌توانید "پیام اتصال به اپراتور" را تعیین کنید تا اگر ربات جواب را ندانست، کاربر را راهنمایی کند.</span>
                        </li>
                    </ul>
                </div>
            </div>
          )}
          
          {activeTab === 'faq' && (
             <div className="animate-fade-in space-y-2">
                {loadingFaqs ? (
                    <div className="flex flex-col items-center justify-center py-12 text-gray-400 gap-3">
                        <Loader2 className="animate-spin" size={24} />
                        <span className="text-sm">در حال دریافت سوالات...</span>
                    </div>
                ) : errorFaqs ? (
                    <div className="flex flex-col items-center justify-center py-12 text-red-500 gap-3 text-center">
                        <AlertCircle size={24} />
                        <span className="text-sm px-4">{errorFaqs}</span>
                        <button onClick={() => setSystemFaqs([])} className="text-xs underline hover:text-red-700">تلاش مجدد</button>
                    </div>
                ) : systemFaqs.length > 0 ? (
                    systemFaqs.map((faq, index) => (
                        <FAQItem key={faq.id || index} title={faq.faq_question} openFaq={openFaq} index={index} setOpenFaq={setOpenFaq}>
                            <div className="prose dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: faq.faq_answer }} />
                        </FAQItem>
                    ))
                ) : (
                    <div className="text-center py-8 text-gray-500">
                        سوالی یافت نشد.
                    </div>
                )}
             </div>
          )}
          
          {activeTab === 'contact' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">نیاز به کمک دارید؟</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">تیم پشتیبانی ما آماده پاسخگویی به سوالات فنی شما در مورد اتصال و تنظیمات ربات است.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm"><Phone size={20} /></div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">تلفن پشتیبانی</p>
                      <p className="font-bold text-gray-800 dark:text-white dir-ltr text-left">021-22891616</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm"><Mail size={20} /></div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">ایمیل</p>
                      <a href="mailto:support@megalive.ir" className="font-bold text-gray-800 dark:text-white hover:text-blue-600 transition-colors">support@megalive.ir</a>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800 text-center">
                    <p className="text-xs text-gray-400 mb-2">ساعات پاسخگویی</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">شنبه تا چهارشنبه: ۹ صبح تا ۵ عصر</p>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">پنج‌شنبه: ۹ صبح تا ۱ ظهر</p>
                </div>
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpCenterPanel;