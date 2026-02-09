
import React from 'react';
import { Milestone, Rocket, ShieldCheck, Briefcase, TrendingUp, Handshake, ChevronLeft, Zap, Target, Cpu } from 'lucide-react';

const Roadmap: React.FC = () => {
  const phases = [
    {
      id: 1,
      title: 'فاز ۱: تثبیت و هوشمندسازی عمیق',
      status: 'وضعیت فعلی',
      desc: 'بهینه‌سازی موتور RAG، پشتیبانی از فرمت‌های Excel و Vision AI، و یکپارچگی کامل با n8n.',
      icon: <Target className="text-blue-500" />,
      color: 'blue'
    },
    {
      id: 2,
      title: 'فاز ۲: توسعه کانال‌های ارتباطی (Omnichannel)',
      status: 'به زودی',
      desc: 'اتصال به ایتا، بله و روبیکا. طراحی ویجت‌های تعاملی جدید و پنل پاسخگویی انسانی متمرکز.',
      icon: <Zap className="text-amber-500" />,
      color: 'amber'
    },
    {
      id: 3,
      title: 'فاز ۳: هوش صوتی و چندرسانه‌ای',
      status: 'آینده نزدیک',
      desc: 'ورود به دنیای VoIP، پیاده‌سازی سرویس STT/TTS بومی و تحلیل احساسات مشتریان.',
      icon: <Cpu className="text-purple-500" />,
      color: 'purple'
    },
    {
      id: 4,
      title: 'فاز ۴: مأمورهای خودمختار (Agents)',
      status: 'چشم‌انداز نهایی',
      desc: 'اجرای تراکنش‌های مالی، اتوماسیون کامل وظایف اداری و یادگیری مستمر از بازخورد مدیر.',
      icon: <Rocket className="text-pink-500" />,
      color: 'pink'
    }
  ];

  const investmentModels = [
    {
      id: 'm&a',
      title: 'مدل اول: واگذاری کامل',
      subtitle: 'Full Acquisition',
      desc: 'انتقال کامل مالکیت معنوی (IP)، سورس‌کد و زیرساخت‌ها به هلدینگ‌های بزرگ جهت ادغام استراتژیک.',
      icon: <ShieldCheck size={32} />,
      gradient: 'from-blue-600 to-indigo-700'
    },
    {
      id: 'equity',
      title: 'مدل دوم: سرمایه‌گذاری استراتژیک',
      subtitle: 'Strategic Investment',
      desc: 'تزریق سرمایه هوشمند جهت رشد مقیاس (Scale-up) و تسریع در اجرای نقشه راه در قبال سهام.',
      icon: <TrendingUp size={32} />,
      gradient: 'from-emerald-600 to-teal-700'
    },
    {
      id: 'jv',
      title: 'مدل سوم: تأسیس نهاد مشترک',
      subtitle: 'Joint Venture',
      desc: 'ایجاد یک شرکت یا مرکز نوآوری جدید با مشارکت سازمان‌های بزرگ برای حل چالش‌های اختصاصی AI.',
      icon: <Handshake size={32} />,
      gradient: 'from-purple-600 to-pink-700'
    }
  ];

  return (
    <div className="space-y-12 animate-fade-in pb-20">
      {/* Roadmap Header */}
      <div className="text-right">
        <h2 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3">
          <Milestone className="text-blue-600" size={32} />
          نقشه راه و چشم‌انداز آینده
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">مسیر تحول مگالایو از یک دستیار هوشمند به مغز متفکر سازمان شما.</p>
      </div>

      {/* Vertical Timeline */}
      <div className="relative">
        <div className="absolute right-8 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-800 hidden md:block"></div>
        <div className="space-y-8">
          {phases.map((phase) => (
            <div key={phase.id} className="relative flex flex-col md:flex-row items-start gap-8 group">
              <div className="absolute right-6 w-4 h-4 rounded-full bg-white dark:bg-gray-900 border-4 border-blue-600 z-10 hidden md:block group-hover:scale-125 transition-transform"></div>
              <div className="md:mr-16 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm flex-1 group-hover:border-blue-300 dark:group-hover:border-blue-700 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800">{phase.icon}</div>
                    <h3 className="font-bold text-gray-800 dark:text-white">{phase.title}</h3>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${phase.id === 1 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                    {phase.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{phase.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collaboration Section */}
      <div className="pt-10 border-t border-gray-100 dark:border-gray-800">
        <div className="text-right mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white flex items-center gap-3">
            <Briefcase className="text-indigo-600" size={28} />
            درخواست و پیشنهاد همکاری
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">مدل‌های مشارکت استراتژیک برای سرمایه‌گذاران و سازمان‌های پیشرو.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {investmentModels.map((model) => (
            <div key={model.id} className="relative group cursor-pointer">
              <div className={`absolute inset-0 bg-gradient-to-br ${model.gradient} rounded-3xl blur opacity-20 group-hover:opacity-40 transition-opacity`}></div>
              <div className="relative bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl p-8 h-full flex flex-col items-center text-center hover:border-transparent transition-all group-hover:shadow-2xl">
                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${model.gradient} text-white flex items-center justify-center mb-6 shadow-xl`}>
                  {model.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-1">{model.title}</h3>
                <span className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-4">{model.subtitle}</span>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8 flex-1">{model.desc}</p>
                <button className="flex items-center gap-2 px-6 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold text-sm hover:bg-blue-600 hover:text-white transition-all">
                  درخواست دمو
                  <ChevronLeft size={16} className="rtl:rotate-0 rotate-180" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Roadmap;
