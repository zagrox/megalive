import React, { useState } from 'react';
import { X, BookOpen, HelpCircle as FaqIcon, MessageSquare, Phone, Mail, Send, Linkedin, Instagram, ChevronDown } from 'lucide-react';

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
        <span className="font-semibold text-gray-800 dark:text-gray-200">{title}</span>
        <ChevronDown
          size={20}
          className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
      >
        <div className="overflow-hidden">
          <div className="pb-4 text-gray-600 dark:text-gray-400 space-y-2 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};


const HelpCenterPanel: React.FC<HelpCenterPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact'>('guide');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const TABS = [
    { id: 'guide' as const, label: 'راهنمای شروع', icon: <BookOpen size={20} /> },
    { id: 'faq' as const, label: 'پرسش پاسخ', icon: <FaqIcon size={20} /> },
    { id: 'contact' as const, label: 'پشتیبانی', icon: <MessageSquare size={20} /> },
  ];

  const faqs = [
    {
      q: 'چگونه رنگ و لوگوی ربات را تغییر دهم؟',
      a: <p>از منوی کناری به بخش <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">ظاهر چت‌بات</code> بروید. در این بخش می‌توانید رنگ اصلی را انتخاب کرده و آواتار جدیدی برای ربات خود آپلود کنید.</p>
    },
    {
      q: 'ربات من به پیام‌ها پاسخ نمی‌دهد، مشکل چیست؟',
      a: <>
        <p>ابتدا از فعال بودن ربات در <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">تنظیمات عمومی</code> مطمئن شوید.</p>
        <p>سپس، آدرس Webhook را در بخش <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">انتشار آنلاین</code> بررسی کرده و از صحت عملکرد آن در N8N اطمینان حاصل کنید. مشکلات CORS نیز می‌تواند باعث این خطا شود.</p>
      </>
    },
    {
      q: 'چه نوع فایل‌هایی را می‌توانم برای آموزش آپلود کنم؟',
      a: <p>شما می‌توانید فایل‌هایی با فرمت PDF, DOCX, TXT, و CSV را در بخش <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">پایگاه دانش</code> آپلود کنید.</p>
    },
    {
      q: 'چگونه می‌توانم ربات را به تلگرام متصل کنم؟',
      a: <p>از بخش <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">اتصال افزونه‌ها</code>، گزینه تلگرام را پیدا کرده و با دنبال کردن دستورالعمل‌ها، توکن ربات تلگرام خود را برای اتصال وارد کنید.</p>
    },
    {
      q: 'مصرف توکن چگونه محاسبه می‌شود؟',
      a: <p>مصرف توکن بر اساس تعداد کلمات ورودی کاربر و پاسخ تولید شده توسط مدل هوش مصنوعی محاسبه می‌شود. هر توکن تقریبا معادل یک کلمه است. شما می‌توانید میزان مصرف خود را در داشبورد اصلی مشاهده کنید.</p>
    },
    {
      q: 'وکتور چیست و چرا تعداد آن مهم است؟',
      a: <p>هر فایل دانشی که شما آپلود می‌کنید، به قطعات کوچکتر تقسیم شده و هر قطعه به یک "وکتور" عددی تبدیل می‌شود. این وکتورها به ربات اجازه می‌دهند تا معنای متون را درک کرده و پاسخ‌های دقیقی از دانش شما پیدا کند. تعداد بالاتر وکتور به معنی دانش بیشتر ربات است.</p>
    },
    {
      q: 'آیا می‌توانم ربات را به API اختصاصی خودم متصل کنم؟',
      a: <p>بله. از بخش <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">اتصال افزونه‌ها</code>، گزینه Custom API را انتخاب کنید. با این قابلیت می‌توانید ربات را برای دریافت اطلاعات یا انجام عملیات به سرویس‌های خودتان متصل کنید.</p>
    },
    {
      q: 'آدرس Webhook ربات من کجاست؟',
      a: <p>آدرس Webhook برای هر ربات به صورت یکتا ساخته می‌شود. شما می‌توانید این آدرس را از تب <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">انتشار آنلاین</code> کپی کرده و در سرویس N8N یا سایر ابزارهای خود استفاده کنید.</p>
    }
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
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">مرکز راهنمایی</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
          <div className="flex items-center gap-2">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'guide' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">راهنمای گام به گام</h3>
                <ol className="space-y-8 list-decimal list-inside marker:text-blue-500 marker:font-bold">
                    <li>
                        <h4 className="font-semibold inline text-gray-800 dark:text-white">ساخت اولین چت‌بات</h4>
                        <p className="mt-2 pr-6">از دکمه <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">افزودن بات جدید</code> در سایدبار برای شروع استفاده کنید. نام، شناسه (Slug) و نام کسب و کار را وارد کنید.</p>
                    </li>
                    <li>
                        <h4 className="font-semibold inline text-gray-800 dark:text-white">آموزش ربات با دانش شما</h4>
                        <p className="mt-2 pr-6">به تب <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">پایگاه دانش</code> بروید. فایل‌های خود (PDF, TXT, DOCX) را آپلود کرده و سپس دکمه <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">پردازش</code> را برای هر فایل بزنید تا ربات محتوای آن را یاد بگیرد.</p>
                    </li>
                    <li>
                        <h4 className="font-semibold inline text-gray-800 dark:text-white">شخصی‌سازی ظاهر ربات</h4>
                        <p className="mt-2 pr-6">در تب <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">ظاهر چت‌بات</code>، می‌توانید رنگ اصلی، آواتار و پیام خوش‌آمدگویی را مطابق با برند خود تغییر دهید.</p>
                    </li>
                    <li>
                        <h4 className="font-semibold inline text-gray-800 dark:text-white">انتشار ربات روی وب‌سایت</h4>
                        <p className="mt-2 pr-6">به تب <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">انتشار آنلاین</code> رفته، کد HTML داده شده را کپی کنید و آن را قبل از تگ پایانی <code className="text-sm bg-gray-100 dark:bg-gray-700 px-1 rounded">&lt;/body&gt;</code> در وب‌سایت خود قرار دهید.</p>
                    </li>
                </ol>
            </div>
          )}
          {activeTab === 'faq' && (
             <div className="animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">سوالات متداول</h3>
                {faqs.map((faq, index) => (
                    <FAQItem key={index} title={faq.q} openFaq={openFaq} index={index} setOpenFaq={setOpenFaq}>
                        {faq.a}
                    </FAQItem>
                ))}
             </div>
          )}
          {activeTab === 'contact' && (
             <div className="space-y-6 animate-fade-in">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">ارتباط با پشتیبانی</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Phone size={20} className="text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">پشتیبانی تلفنی</p>
                      <p className="font-semibold text-gray-800 dark:text-white dir-ltr text-left">021-12345678</p>
                    </div>
                  </div>
                   <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Mail size={20} className="text-blue-500 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">ایمیل پشتیبانی</p>
                      <a href="mailto:support@megalive.ir" className="font-semibold text-gray-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">support@megalive.ir</a>
                    </div>
                  </div>
                </div>
                <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-md font-semibold text-gray-800 dark:text-white mb-3">شبکه‌های اجتماعی</h4>
                    <div className="flex items-center gap-4">
                        <a href="#" target="_blank" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Send size={20} /></a>
                        <a href="#" target="_blank" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Linkedin size={20} /></a>
                        <a href="#" target="_blank" className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full text-gray-600 dark:text-gray-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"><Instagram size={20} /></a>
                    </div>
                </div>
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpCenterPanel;