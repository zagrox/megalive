import React from 'react';
import { BotConfig } from '../../types';
import { HexColorPicker } from 'react-colorful'; // Note: In a real app I'd add this lib, but here I'll use simple input type='color'
import { Save, Upload } from 'lucide-react';

interface Props {
  config: BotConfig;
  setConfig: React.Dispatch<React.SetStateAction<BotConfig>>;
}

const AppearanceSettings: React.FC<Props> = ({ config, setConfig }) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <p className="text-gray-500 dark:text-gray-400 text-lg">رنگ‌بندی و آیکون‌های چت‌بات را شخصی‌سازی کنید.</p>
      </div>

      <div className="space-y-8">
        {/* Welcome Message */}
        <div className="grid gap-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">پیام خوش‌آمدگویی</label>
          <input
            type="text"
            value={config.welcomeMessage}
            onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
            className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-blue-100 dark:focus:ring-blue-900 focus:border-blue-500 dark:focus:border-blue-500 outline-none transition-all"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Color Picker */}
          <div>
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">رنگ اصلی برند</label>
             <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-4 border-gray-100 dark:border-gray-700 shadow-inner">
                    <input 
                        type="color" 
                        value={config.primaryColor}
                        onChange={(e) => setConfig({...config, primaryColor: e.target.value})}
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                    />
                </div>
                <div>
                    <p className="text-sm font-mono text-gray-600 dark:text-gray-300 mb-1 uppercase">{config.primaryColor}</p>
                    <p className="text-xs text-gray-400">برای تغییر کلیک کنید</p>
                </div>
             </div>
          </div>

          {/* Avatar Upload */}
           <div>
             <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-3">آواتار ربات</label>
             <div className="flex items-center gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800">
                 <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 overflow-hidden relative">
                    <img src={config.logoUrl} alt="Avatar" className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1">
                    <button className="text-sm text-blue-600 dark:text-blue-400 font-medium flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-3 py-1.5 rounded-lg transition-colors w-full justify-center border border-blue-200 dark:border-blue-800 border-dashed">
                        <Upload size={16} />
                        آپلود تصویر جدید
                    </button>
                 </div>
             </div>
          </div>
        </div>
        
        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
             <button className="flex items-center gap-2 bg-gray-900 dark:bg-blue-600 text-white px-6 py-2.5 rounded-xl hover:bg-gray-800 dark:hover:bg-blue-700 transition-all shadow-lg shadow-gray-900/20 dark:shadow-blue-600/20 active:scale-95">
                 <Save size={18} />
                 ذخیره ظاهر
             </button>
        </div>
      </div>
    </div>
  );
};

export default AppearanceSettings;