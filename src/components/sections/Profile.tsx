import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Save, Shield, Key, Bell } from 'lucide-react';

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'امیرحسین',
    lastName: 'محمدی',
    email: 'admin@megalive.ir',
    phone: '09123456789',
    role: 'مدیر کل سیستم',
    location: 'تهران، ایران',
    bio: 'علاقمند به هوش مصنوعی و توسعه نرم‌افزار. مدیر فنی پروژه MegaLive.',
    notifications: true,
    twoFactor: true
  });

  const handleSave = () => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">پروفایل کاربری</h2>
        <p className="text-gray-500 dark:text-gray-400">مدیریت اطلاعات شخصی و تنظیمات حساب کاربری.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left Column - Profile Card */}
        <div className="xl:col-span-1 space-y-6">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 text-center relative overflow-hidden shadow-sm">
             <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-r from-blue-500 to-purple-600 opacity-90"></div>
             
             <div className="relative mt-12 mb-4">
                <div className="w-28 h-28 mx-auto rounded-full border-4 border-white dark:border-gray-900 bg-gray-200 dark:bg-gray-800 overflow-hidden shadow-lg relative group cursor-pointer">
                    <img 
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Amir" 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="text-white" size={24} />
                    </div>
                </div>
             </div>

             <h3 className="text-xl font-bold text-gray-900 dark:text-white">{formData.firstName} {formData.lastName}</h3>
             <p className="text-blue-600 dark:text-blue-400 text-sm font-medium mb-6">{formData.role}</p>

             <div className="flex justify-center gap-4 border-t border-gray-100 dark:border-gray-800 pt-6">
                <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800 dark:text-white">12</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">پروژه‌ها</span>
                </div>
                <div className="w-px bg-gray-200 dark:bg-gray-800"></div>
                <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800 dark:text-white">85%</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">بهینه</span>
                </div>
                <div className="w-px bg-gray-200 dark:bg-gray-800"></div>
                 <div className="text-center">
                    <span className="block text-lg font-bold text-gray-800 dark:text-white">3</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">تیم‌ها</span>
                </div>
             </div>
          </div>

          {/* Security Status */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 shadow-sm">
              <h4 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
                  <Shield size={18} className="text-green-500" />
                  امنیت حساب
              </h4>
              <div className="space-y-4">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg">
                              <Key size={18} />
                          </div>
                          <div className="text-sm">
                              <p className="font-medium text-gray-800 dark:text-gray-200">احراز هویت دو مرحله‌ای</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">برای امنیت بیشتر فعال است</p>
                          </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${formData.twoFactor ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setFormData({...formData, twoFactor: !formData.twoFactor})}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.twoFactor ? '-translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400 rounded-lg">
                              <Bell size={18} />
                          </div>
                          <div className="text-sm">
                              <p className="font-medium text-gray-800 dark:text-gray-200">اعلان‌های امنیتی</p>
                              <p className="text-gray-500 dark:text-gray-400 text-xs">دریافت ایمیل ورودهای مشکوک</p>
                          </div>
                      </div>
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors cursor-pointer ${formData.notifications ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`} onClick={() => setFormData({...formData, notifications: !formData.notifications})}>
                          <div className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform ${formData.notifications ? '-translate-x-4' : 'translate-x-0'}`}></div>
                      </div>
                  </div>
              </div>
          </div>
        </div>

        {/* Right Column - Edit Form */}
        <div className="xl:col-span-2">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 lg:p-8 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">ویرایش مشخصات</h3>
                <button 
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-600/20"
                >
                    {loading ? (
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                        <>
                            <Save size={18} />
                            <span>ذخیره تغییرات</span>
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <User size={16} className="text-gray-400" />
                        نام
                    </label>
                    <input 
                        type="text" 
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">نام خانوادگی</label>
                    <input 
                        type="text" 
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Mail size={16} className="text-gray-400" />
                        آدرس ایمیل
                    </label>
                    <input 
                        type="email" 
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all text-left dir-ltr"
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Phone size={16} className="text-gray-400" />
                        شماره تماس
                    </label>
                    <input 
                        type="tel" 
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all text-left dir-ltr"
                    />
                </div>

                 <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <MapPin size={16} className="text-gray-400" />
                        موقعیت مکانی
                    </label>
                    <input 
                        type="text" 
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">درباره من</label>
                    <textarea 
                        rows={4}
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 outline-none transition-all resize-none"
                    />
                    <p className="text-xs text-gray-400 text-left dir-ltr">{formData.bio.length}/250</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;