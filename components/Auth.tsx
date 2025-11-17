import React, { useState, useEffect } from 'react';
import { Mail, Lock, User, ArrowRight, Check, Loader2, Eye, EyeOff, AlertCircle, Layers, Globe } from 'lucide-react';
import { client } from '../services/client';
import { createUser, passwordRequest } from '@directus/sdk';
import { fetchCrmConfig } from '../services/configService';
import { BotConfig } from '../types';

interface AuthProps {
  onLogin: () => void;
}

type AuthView = 'login' | 'register' | 'forgot';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [config, setConfig] = useState<Partial<BotConfig>>({});

  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  useEffect(() => {
    const loadConfig = async () => {
      const c = await fetchCrmConfig();
      setConfig(c);
    };
    loadConfig();
  }, []);

  const appColor = config.appColor || '#3b82f6'; // Default blue
  const appLogo = config.appLogoUrl;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await client.login(email, password);
      onLogin();
    } catch (err: any) {
      console.error('Login failed:', err);
      if (err?.errors?.[0]?.message === 'Invalid user credentials.') {
        setError('ایمیل یا رمز عبور اشتباه است.');
      } else {
        setError('خطا در ورود به سیستم. لطفا اتصال اینترنت خود را بررسی کنید.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await client.request(createUser({
        email,
        password,
        first_name: firstName,
        last_name: lastName,
      }));
      
      setSuccessMsg('حساب کاربری با موفقیت ایجاد شد. لطفا وارد شوید.');
      setView('login');
      setPassword('');
    } catch (err: any) {
      console.error('Registration failed:', err);
      if (err?.errors?.[0]?.extensions?.code === 'RECORD_NOT_UNIQUE') {
        setError('این ایمیل قبلا ثبت شده است.');
      } else {
        setError('خطا در ثبت نام. لطفا ورودی‌ها را بررسی کنید.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
        await client.request(passwordRequest(email));
        setSuccessMsg('اگر این ایمیل ثبت شده باشد، لینک بازیابی ارسال خواهد شد.');
    } catch (err) {
        console.error("Reset password error", err);
        setError("خطا در ارسال درخواست.");
    } finally {
        setIsLoading(false);
    }
  };

  const resetState = (newView: AuthView) => {
      setView(newView);
      setError(null);
      setSuccessMsg(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row font-vazir bg-[#0f172a]" dir="rtl">
      
      {/* Right Side (Form) - Visually Right in RTL (First Child) */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 lg:p-24 relative z-10 bg-[#0f172a]">
        <div className="w-full max-w-[440px] space-y-8">
          
          {/* Header Text */}
          <div className="text-right">
             <h2 className="text-4xl font-bold text-white mb-4 tracking-tight">
                {view === 'login' && 'ورود به حساب'}
                {view === 'register' && 'ساخت حساب کاربری'}
                {view === 'forgot' && 'بازیابی رمز عبور'}
             </h2>
             <p className="text-gray-400 text-lg">
                {view === 'login' && 'خوش آمدید! لطفا اطلاعات خود را وارد کنید.'}
                {view === 'register' && 'لطفا مشخصات خود را جهت ثبت نام وارد نمایید.'}
                {view === 'forgot' && 'ایمیل خود را جهت دریافت لینک بازیابی وارد کنید.'}
             </p>
          </div>

          {/* Alerts */}
          {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-base animate-fade-in">
                    <AlertCircle size={20} className="flex-shrink-0 mt-1" />
                    <p>{error}</p>
                </div>
            )}
            {successMsg && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl flex items-start gap-3 text-green-400 text-base animate-fade-in">
                    <Check size={20} className="flex-shrink-0 mt-1" />
                    <p>{successMsg}</p>
                </div>
            )}

          {/* Forms */}
          {view === 'login' && (
            <form onSubmit={handleLogin} className="space-y-6 animate-fade-in">
                <div className="space-y-5">
                    {/* Email */}
                    <div className="relative group">
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <Mail className="text-gray-500 group-focus-within:text-white transition-colors" size={24} />
                        </div>
                        <input 
                            type="email" 
                            required
                            placeholder="آدرس ایمیل"
                            tabIndex={1}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-5 pr-14 pl-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right dir-ltr placeholder:text-right"
                        />
                    </div>

                    {/* Password */}
                    <div className="relative group">
                        {/* Tab Index 2 goes to Eye Icon */}
                        <button 
                            type="button" 
                            onClick={() => setShowPassword(!showPassword)} 
                            tabIndex={2}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 z-20 transition-colors"
                        >
                            {showPassword ? <EyeOff size={24}/> : <Eye size={24}/>}
                        </button>

                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none z-10">
                            <Lock className="text-gray-500 group-focus-within:text-white transition-colors" size={24} />
                        </div>

                        <input 
                            type={showPassword ? "text" : "password"}
                            required 
                            placeholder="رمز عبور"
                            tabIndex={3}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-5 pr-14 pl-14 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right dir-ltr placeholder:text-right"
                        />
                    </div>
                </div>

                <div className="flex items-center justify-between text-base pt-1">
                    <button type="button" onClick={() => resetState('forgot')} className="text-blue-400 hover:text-blue-300 transition-colors">
                        فراموشی رمز عبور؟
                    </button>
                </div>

                <button 
                    type="submit" 
                    disabled={isLoading}
                    className="w-full text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                    style={{ backgroundColor: appColor }}
                >
                    {isLoading ? <Loader2 size={28} className="animate-spin" /> : 'ورود به حساب'}
                </button>
            </form>
          )}

          {view === 'register' && (
              <form onSubmit={handleRegister} className="space-y-5 animate-fade-in">
                  <div className="grid grid-cols-2 gap-4">
                      <input 
                          type="text" 
                          required
                          placeholder="نام"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-4 px-5 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                       <input 
                          type="text" 
                          required
                          placeholder="نام خانوادگی"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-4 px-5 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                      />
                  </div>

                   <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={24} />
                        <input 
                            type="email" 
                            required
                            placeholder="آدرس ایمیل"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-5 pr-14 pl-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right dir-ltr placeholder:text-right"
                        />
                    </div>

                    <div className="relative group">
                        <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={24} />
                        <input 
                            type="password"
                            required 
                            placeholder="رمز عبور"
                            minLength={8}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-5 pr-14 pl-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right dir-ltr placeholder:text-right"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110 mt-2"
                        style={{ backgroundColor: appColor }}
                    >
                        {isLoading ? <Loader2 size={28} className="animate-spin" /> : 'اکنون ثبت نام کنید'}
                    </button>

                    <div className="text-center pt-4">
                         <button 
                            type="button" 
                            onClick={() => resetState('login')} 
                            className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-lg"
                        >
                            <ArrowRight size={20} />
                            بازگشت به ورود
                        </button>
                    </div>
              </form>
          )}

           {view === 'forgot' && (
              <form onSubmit={handleForgotPassword} className="space-y-6 animate-fade-in">
                   <div className="relative group">
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-white transition-colors" size={24} />
                        <input 
                            type="email" 
                            required
                            placeholder="آدرس ایمیل"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-[#1e293b] border border-gray-700 rounded-2xl py-5 pr-14 pl-4 text-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-right dir-ltr placeholder:text-right"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full text-white font-bold text-xl py-4 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed hover:brightness-110"
                        style={{ backgroundColor: appColor }}
                    >
                        {isLoading ? <Loader2 size={28} className="animate-spin" /> : 'ارسال لینک بازیابی'}
                    </button>

                    <div className="text-center pt-4">
                         <button 
                            type="button" 
                            onClick={() => resetState('login')} 
                            className="text-gray-400 hover:text-white transition-colors flex items-center justify-center gap-2 mx-auto text-lg"
                        >
                            <ArrowRight size={20} />
                            بازگشت به ورود
                        </button>
                    </div>
              </form>
          )}

          {/* Signup Prompt for Login View */}
          {view === 'login' && (
              <div className="pt-6 border-t border-gray-800">
                  <p className="text-gray-400 mb-4 text-center text-lg">حساب کاربری ندارید؟</p>
                  <button 
                    onClick={() => resetState('register')}
                    className="w-full py-4 rounded-2xl border-2 border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-bold text-lg transition-all bg-transparent hover:bg-[#1e293b]"
                  >
                    اکنون ثبت نام کنید
                  </button>
              </div>
          )}

        </div>
      </div>

      {/* Left Side (Branding) - Visually Left in RTL (Second Child) */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 text-white relative overflow-hidden"
        style={{ backgroundColor: appColor }}
      >
         {/* Background Patterns */}
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
         <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
         
         <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
             {/* Large Glassy Logo */}
             <div className="w-32 h-32 bg-white/20 backdrop-blur-xl rounded-[2rem] flex items-center justify-center shadow-2xl mb-10 border border-white/20">
                 {appLogo ? (
                      <img src={appLogo} className="w-20 h-20 object-contain drop-shadow-md" alt="App Logo" />
                  ) : (
                      <Layers size={64} className="drop-shadow-md" />
                  )}
             </div>
             
             <h1 className="text-5xl font-bold mb-6 tracking-tight drop-shadow-sm">{config.appTitle || 'MEGAMAIL'}</h1>
             <p className="text-xl text-blue-50 leading-relaxed font-medium opacity-90 drop-shadow-sm">
                 {config.description || 'دسترسی به ابزار ایمیل مارکتینگ. با مخاطبان خود ارتباط برقرار کنید. مگامیل ابزارهای مورد نیاز برای بازاریابی ایمیلی قدرتمند و موثر را فراهم می‌کند.'}
             </p>
             
             <div className="mt-16 font-mono text-sm bg-black/20 px-4 py-1.5 rounded-full text-blue-100 backdrop-blur-sm border border-white/10">
                 App Version 0.9.8
             </div>
         </div>
      </div>

    </div>
  );
};

export default Auth;