import React, { useState } from 'react';
import { X, BookOpen, HelpCircle as FaqIcon, MessageSquare, Phone, Mail, Send, Linkedin, Instagram, ChevronDown, Copy, Check, AlertTriangle } from 'lucide-react';

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

const CodeBlock = ({ code }: { code: string }) => {
    const [copied, setCopied] = useState(false);
    
    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="relative mt-2 mb-4 bg-gray-900 rounded-lg p-3 border border-gray-700 dir-ltr text-left group">
            <button 
                onClick={handleCopy}
                className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors opacity-0 group-hover:opacity-100"
            >
                {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
            </button>
            <pre className="text-xs text-blue-300 font-mono overflow-x-auto p-1">
                <code>{code}</code>
            </pre>
        </div>
    );
};


const HelpCenterPanel: React.FC<HelpCenterPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact'>('faq');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const TABS = [
    { id: 'faq' as const, label: 'رفع اشکال N8N', icon: <FaqIcon size={20} /> },
    { id: 'guide' as const, label: 'راهنمای شروع', icon: <BookOpen size={20} /> },
    { id: 'contact' as const, label: 'پشتیبانی', icon: <MessageSquare size={20} /> },
  ];

  const splitterCode = `// Configuration
// کاهش حجم به 2000 برای جلوگیری از خطای محدودیت (Rate Limit)
const CHUNK_SIZE = 2000; 
const OVERLAP = 200;
const results = [];

// Loop over input items
for (const item of $input.all()) {
  // نام فیلد ورودی را اینجا چک کنید (معمولا data یا text)
  const text = item.json.data || item.json.text; 

  if (text && typeof text === 'string') {
    let startIndex = 0;
    while (startIndex < text.length) {
      const chunk = text.substring(startIndex, startIndex + CHUNK_SIZE);
      
      // ساخت خروجی جدید برای هر تکه
      results.push({
        json: { 
            data: chunk,
            chunk_index: results.length 
        }
      });

      startIndex += (CHUNK_SIZE - OVERLAP);
      if (chunk.length < CHUNK_SIZE) break;
    }
  }
}

return results;`;

  const faqs = [
    {
      q: 'ارور "No fields - item(s) exist, but they\'re empty" چیست؟',
      a: <>
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800 text-sm mb-3">
            <span className="font-bold text-red-600 dark:text-red-400 block mb-1">علت خطا:</span>
            نود Text Splitter هیچ داده‌ای در ورودی دریافت نکرده است یا کد داخل آن پیش‌فرض است.
        </div>
        <p><strong>راه حل:</strong></p>
        <ol className="list-decimal pr-5 space-y-1 text-sm">
            <li>مطمئن شوید نود قبلی (Extract Document Text) خروجی دارد (Execute کنید).</li>
            <li>کد جاوا اسکریپت پیش‌فرض داخل نود Splitter را کاملا پاک کنید.</li>
            <li>کد اصلاح شده زیر را کپی و جایگزین کنید.</li>
        </ol>
      </>
    },
    {
      q: 'با وجود Loop باز هم خطای Rate Limit دریافت می‌کنم',
      a: <>
        <p>اگر با وجود حلقه باز هم خطا دارید، یعنی حجم توکن‌های ارسالی در دقیقه بیشتر از حد مجاز حساب شماست:</p>
        <ul className="list-disc pr-5 mt-3 space-y-2 text-sm">
            <li><strong>کاهش حجم هر تکه:</strong> کد Text Splitter خود را با کد زیر جایگزین کنید (مقدار <code>CHUNK_SIZE</code> به 2000 کاهش یافته است).</li>
            <li><strong>افزایش زمان Wait:</strong> زمان نود Wait داخل حلقه را به <strong>10 تا 15 ثانیه</strong> افزایش دهید.</li>
            <li><strong>صبر کنید:</strong> محدودیت OpenAI دقیقه‌ای است. یک دقیقه صبر کنید تا ظرفیت خالی شود، سپس دوباره امتحان کنید.</li>
            <li><strong>شارژ حساب:</strong> اگر حساب OpenAI شما Free Tier است، با پرداخت حداقل 5 دلار، سقف سرعت شما 5 تا 10 برابر می‌شود.</li>
        </ul>
      </>
    },
    {
      q: 'کد اصلاح شده برای Text Splitter (ضد خطا)',
      a: <>
        <p>این کد متن را به تکه‌های کوچک‌تر (2000 کاراکتر) تقسیم می‌کند تا در هر درخواست توکن کمتری مصرف شود:</p>
        <CodeBlock code={splitterCode} />
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
            <AlertTriangle size={12} className="inline mr-1" />
            نکته مهم: اگر خروجی نود قبلی شما نامی غیر از <code>data</code> دارد، خط 8 کد را ویرایش کنید.
        </p>
      </>
    },
    {
      q: 'ترتیب صحیح اتصال نودها (Loop Topology) چگونه است؟',
      a: <>
        <p>در نسخه‌های جدید N8N نیازی به بستن دستی حلقه نیست:</p>
        <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-lg text-sm mt-2 font-mono dir-ltr text-left text-xs sm:text-sm overflow-x-auto whitespace-nowrap">
            Extract <span className="text-blue-500">→</span> Splitter <span className="text-blue-500">→</span> Loop <span className="text-blue-500">→</span> AI Model <span className="text-blue-500">→</span> Wait <span className="text-blue-500">→</span> (پایان شاخه)
        </div>
        <p className="mt-2 text-sm">خروجی Wait را رها کنید. نود Loop خودش می‌فهمد چه زمانی تکرار بعدی را انجام دهد.</p>
      </>
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
        <div className="flex-1 overflow-y-auto p-5 bg-white dark:bg-gray-900">
          {activeTab === 'guide' && (
            <div className="space-y-6 text-gray-700 dark:text-gray-300 leading-relaxed animate-fade-in">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4 border-b pb-2 dark:border-gray-800">شروع کار با سیستم</h3>
                <ol className="space-y-6 relative border-r border-gray-200 dark:border-gray-800 mr-2">
                    <li className="mr-6">
                        <span className="absolute -right-2 top-1 w-4 h-4 rounded-full bg-blue-600 border-4 border-white dark:border-gray-900"></span>
                        <h4 className="font-bold text-gray-800 dark:text-white">۱. ساخت چت‌بات</h4>
                        <p className="mt-1 text-sm">از منوی "ساخت ربات جدید"، نام و شناسه یکتای ربات خود را وارد کنید.</p>
                    </li>
                    <li className="mr-6">
                        <span className="absolute -right-2 top-1 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-gray-900"></span>
                        <h4 className="font-bold text-gray-800 dark:text-white">۲. آموزش (Knowledge Base)</h4>
                        <p className="mt-1 text-sm">فایل‌های PDF یا متنی خود را آپلود کنید و دکمه "پردازش" را بزنید تا ربات آن‌ها را یاد بگیرد.</p>
                    </li>
                    <li className="mr-6">
                        <span className="absolute -right-2 top-1 w-4 h-4 rounded-full bg-gray-300 dark:bg-gray-700 border-4 border-white dark:border-gray-900"></span>
                        <h4 className="font-bold text-gray-800 dark:text-white">۳. اتصال N8N</h4>
                        <p className="mt-1 text-sm">ورک‌فلو N8N را طبق راهنمای تب "رفع اشکال" تنظیم کنید تا داده‌ها را از فایل‌ها استخراج کند.</p>
                    </li>
                </ol>
            </div>
          )}
          {activeTab === 'faq' && (
             <div className="animate-fade-in space-y-2">
                {faqs.map((faq, index) => (
                    <FAQItem key={index} title={faq.q} openFaq={openFaq} index={index} setOpenFaq={setOpenFaq}>
                        {faq.a}
                    </FAQItem>
                ))}
             </div>
          )}
          {activeTab === 'contact' && (
             <div className="space-y-6 animate-fade-in">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50">
                    <h3 className="font-bold text-blue-800 dark:text-blue-300 mb-2">نیاز به کمک دارید؟</h3>
                    <p className="text-sm text-blue-600 dark:text-blue-400">تیم پشتیبانی ما آماده پاسخگویی به سوالات فنی شما در مورد اتصال N8N و تنظیمات ربات است.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="bg-white dark:bg-gray-700 p-2 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm"><Phone size={20} /></div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">تلفن پشتیبانی</p>
                      <p className="font-bold text-gray-800 dark:text-white dir-ltr text-left">021-91000000</p>
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
             </div>
          )}
        </div>
      </div>
    </>
  );
};

export default HelpCenterPanel;