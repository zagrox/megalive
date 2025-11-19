
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowLeft, Loader2, KeyRound, CheckCircle2, ArrowRight, UserPlus, User } from 'lucide-react';

const Login: React.FC = () => {
  const { login, register, requestReset, confirmReset, error: authError } = useAuth();
  
  // View State: 'login' | 'forgot' | 'reset' | 'register'
  const [view, setView] = useState<'login' | 'forgot' | 'reset' | 'register'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resetToken, setResetToken] = useState<string | null>(null);
  
  // UI Feedback
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Check URL for reset token or register param on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const isRegister = params.has('register');

    if (token) {
      setResetToken(token);
      setView('reset');
      // Clean URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isRegister) {
      setView('register');
      // Clean URL without reloading
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Reset messages and some fields when switching views
  useEffect(() => {
    setLocalError(null);
    setSuccessMessage(null);
    setPassword('');
    // Keep email if populated
  }, [view]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await login(email, password);
    } catch (err) {
      // Error handled in context, but we can set local state if needed
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await register({ firstName, lastName, email, password });
      // Auto login handles redirect, no need for success message step
    } catch (err) {
      // Error handled in context
      setIsSubmitting(false);
    } 
    // Note: We don't call setIsSubmitting(false) on success because the component 
    // will likely unmount due to auto-login redirecting to dashboard.
  };

  const handleForgot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await requestReset(email);
      setSuccessMessage('لینک بازیابی رمز عبور به ایمیل شما ارسال شد.');
    } catch (err) {
      setLocalError('خطا در ارسال ایمیل. لطفا آدرس ایمیل را بررسی کنید.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !resetToken) return;

    setIsSubmitting(true);
    setLocalError(null);
    try {
      await confirmReset(resetToken, password);
      setSuccessMessage('رمز عبور با موفقیت تغییر کرد. اکنون می‌توانید وارد شوید.');
      setTimeout(() => {
        setView('login');
        setSuccessMessage('رمز عبور تغییر کرد. لطفا وارد شوید.');
      }, 2000);
    } catch (err) {
      setLocalError('تغییر رمز عبور ناموفق بود. لینک ممکن است منقضی شده باشد.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const error = localError || authError;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-vazir transition-colors duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        
        {/* Header */}
        <div className="bg-blue-600 dark:bg-blue-700 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-inner">
              {view === 'login' && <Lock className="text-white" size={32} />}
              {view === 'register' && <UserPlus className="text-white" size={32} />}
              {view === 'forgot' && <KeyRound className="text-white" size={32} />}
              {view === 'reset' && <CheckCircle2 className="text-white" size={32} />}
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {view === 'login' ? 'خوش آمدید' : 
               view === 'register' ? 'ایجاد حساب کاربری' :
               view === 'forgot' ? 'بازیابی رمز عبور' : 
               'تعیین رمز عبور جدید'}
            </h1>
            <p className="text-blue-100 text-sm">
              {view === 'login' ? 'لطفا برای دسترسی به داشبورد وارد شوید' : 
               view === 'register' ? 'اطلاعات خود را برای ثبت نام وارد کنید' :
               view === 'forgot' ? 'ایمیل خود را وارد کنید تا لینک بازیابی ارسال شود' :
               'رمز عبور جدید خود را وارد کنید'}
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="p-8">
          {/* Success Message */}
          {successMessage ? (
            <div className="bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 p-4 rounded-xl border border-green-100 dark:border-green-800 text-center mb-6 animate-fade-in">
              <div className="flex justify-center mb-2">
                <CheckCircle2 size={32} />
              </div>
              <p className="text-sm font-medium">{successMessage}</p>
              {view === 'forgot' && (
                <button 
                  onClick={() => setView('login')}
                  className="mt-4 text-blue-600 hover:underline text-sm font-medium"
                >
                  بازگشت به ورود
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm p-3 rounded-xl border border-red-100 dark:border-red-800 flex items-center justify-center mb-6 animate-fade-in">
                  {error}
                </div>
              )}

              {/* --- LOGIN VIEW --- */}
              {view === 'login' && (
                <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">ایمیل سازمانی</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">رمز عبور</label>
                      <button 
                        type="button"
                        onClick={() => setView('forgot')}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        فراموشی رمز عبور؟
                      </button>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>ورود به حساب</span>
                        <ArrowLeft size={20} />
                      </>
                    )}
                  </button>
                  
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      حساب کاربری ندارید؟ {' '}
                      <button 
                        type="button"
                        onClick={() => setView('register')}
                        className="text-blue-600 dark:text-blue-400 font-bold hover:underline"
                      >
                        ثبت نام کنید
                      </button>
                    </p>
                  </div>
                </form>
              )}

              {/* --- REGISTER VIEW --- */}
              {view === 'register' && (
                <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">نام</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full pr-9 pl-2 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white text-sm transition-all"
                          placeholder="نام"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">نام خانوادگی</label>
                      <div className="relative">
                        <input
                          type="text"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full px-3 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white text-sm transition-all"
                          placeholder="خانوادگی"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">ایمیل</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">رمز عبور</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="حداقل ۵ کاراکتر"
                        minLength={5}
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>ثبت نام</span>
                        <UserPlus size={20} />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRight size={18} />
                      <span>بازگشت به ورود</span>
                    </button>
                  </div>
                </form>
              )}

              {/* --- FORGOT VIEW --- */}
              {view === 'forgot' && (
                <form onSubmit={handleForgot} className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">ایمیل خود را وارد کنید</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="name@company.com"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">لینک تغییر رمز عبور به این ایمیل ارسال خواهد شد.</p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <Loader2 className="animate-spin" size={20} />
                      ) : (
                        <>
                          <span>ارسال لینک بازیابی</span>
                          <Mail size={20} />
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setView('login')}
                      className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
                    >
                      <ArrowRight size={18} />
                      <span>بازگشت به ورود</span>
                    </button>
                  </div>
                </form>
              )}

              {/* --- RESET VIEW --- */}
              {view === 'reset' && (
                <form onSubmit={handleReset} className="space-y-6 animate-fade-in">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block">رمز عبور جدید</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pr-10 pl-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-transparent outline-none text-gray-900 dark:text-white transition-all text-left dir-ltr"
                        placeholder="رمز عبور جدید"
                        required
                        minLength={8}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-green-600/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={20} />
                    ) : (
                      <>
                        <span>ذخیره رمز عبور جدید</span>
                        <CheckCircle2 size={20} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-800 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
             پشتیبانی شده توسط MegaLive CRM
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
