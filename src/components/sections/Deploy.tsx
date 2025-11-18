import React from 'react';
import { Copy, Check } from 'lucide-react';

const Deploy: React.FC = () => {
  const [copied, setCopied] = React.useState(false);
  const embedCode = `<script src="https://cdn.n8n-chatbot.com/widget.js"></script>
<script>
  window.initN8NBot({
    id: "YOUR_BOT_ID",
    region: "ir-teh"
  });
</script>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 animate-fade-in">
       <div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">از این قطعه کد برای قرار دادن چت‌بات در وب‌سایت خود استفاده کنید.</p>
      </div>

      <div className="bg-gray-900 rounded-xl p-6 relative overflow-hidden border border-gray-800 dark:border-gray-700">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
        <div className="flex justify-between items-start mb-4">
            <span className="text-gray-400 text-xs font-mono">HTML Embed Code</span>
            <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors"
            >
                {copied ? <Check size={14} className="text-green-400"/> : <Copy size={14} />}
                {copied ? 'کپی شد' : 'کپی کد'}
            </button>
        </div>
        <pre className="font-mono text-sm text-blue-300 overflow-x-auto dir-ltr text-left bg-black/30 p-4 rounded-lg border border-white/5">
            {embedCode}
        </pre>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer group bg-white dark:bg-gray-800">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">لینک مستقیم</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">دریافت لینک صفحه اختصاصی چت‌بات برای اشتراک‌گذاری.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer group bg-white dark:bg-gray-800">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">اتصال به تلگرام</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">راه‌اندازی ربات روی تلگرام با یک کلیک.</p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer group bg-white dark:bg-gray-800">
              <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">API Key</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">دریافت کلید API برای استفاده در اپلیکیشن‌های دیگر.</p>
          </div>
      </div>
    </div>
  );
};

export default Deploy;