
import React, { useState } from 'react';
import { Plan } from '../../types';
import { ArrowLeft, Check, CreditCard, Landmark, ShieldCheck, AlertCircle, Bot, MessageSquare, Database, Cpu } from 'lucide-react';

interface CheckoutProps {
  plan: Plan | null;
  onBack: () => void;
}

const Checkout: React.FC<CheckoutProps> = ({ plan, onBack }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [paymentMethod, setPaymentMethod] = useState<'online' | 'offline'>('online');

  if (!plan) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <AlertCircle size={48} className="mb-4 opacity-20" />
            <p>طرحی انتخاب نشده است. لطفا بازگردید و یک طرح انتخاب کنید.</p>
            <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">بازگشت به لیست قیمت‌ها</button>
        </div>
    );
  }

  const basePrice = billingCycle === 'monthly' ? plan.plan_monthly : plan.plan_yearly;
  const taxRate = 0.09; // 9% VAT
  const taxAmount = basePrice * taxRate;
  const finalPrice = basePrice + taxAmount;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="flex items-center gap-4">
        <button onClick={onBack} className="p-2 text-gray-500 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            <ArrowLeft size={24} />
        </button>
        <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">تکمیل خرید</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">اطلاعات پرداخت خود را بررسی و نهایی کنید.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Configuration & Payment */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Billing Cycle */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">دوره پرداخت</h3>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setBillingCycle('monthly')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between ${billingCycle === 'monthly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                    >
                        <span className="font-bold text-gray-700 dark:text-gray-200">ماهانه</span>
                        {billingCycle === 'monthly' && <Check size={20} className="text-blue-600" />}
                    </button>
                    <button 
                        onClick={() => setBillingCycle('yearly')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all flex items-center justify-between ${billingCycle === 'yearly' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'}`}
                    >
                        <div>
                            <span className="font-bold text-gray-700 dark:text-gray-200 block text-right">سالانه</span>
                            <span className="text-xs text-green-600 dark:text-green-400 block text-right mt-1">به صرفه‌تر</span>
                        </div>
                        {billingCycle === 'yearly' && <Check size={20} className="text-blue-600" />}
                    </button>
                </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-4">روش پرداخت</h3>
                <div className="space-y-3">
                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'online' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={paymentMethod === 'online'}
                            onChange={() => setPaymentMethod('online')}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'online' ? 'border-blue-600' : 'border-gray-400'}`}>
                            {paymentMethod === 'online' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-blue-600 dark:text-blue-400 shadow-sm">
                            <CreditCard size={24} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-gray-800 dark:text-white block">پرداخت آنلاین</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">پرداخت امن با کلیه کارت‌های عضو شتاب</span>
                        </div>
                    </label>

                    <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'offline' ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            className="hidden" 
                            checked={paymentMethod === 'offline'}
                            onChange={() => setPaymentMethod('offline')}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${paymentMethod === 'offline' ? 'border-blue-600' : 'border-gray-400'}`}>
                            {paymentMethod === 'offline' && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                        <div className="p-2 bg-white dark:bg-gray-800 rounded-lg text-amber-600 dark:text-amber-400 shadow-sm">
                            <Landmark size={24} />
                        </div>
                        <div className="flex-1">
                            <span className="font-bold text-gray-800 dark:text-white block">کارت به کارت / حواله</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">ثبت فیش واریزی (تایید توسط پشتیبانی)</span>
                        </div>
                    </label>
                </div>

                {paymentMethod === 'offline' && (
                    <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl text-sm text-amber-800 dark:text-amber-200">
                        <p className="font-bold mb-2">اطلاعات حساب:</p>
                        <p className="font-mono dir-ltr text-left mb-1">Bank Mellat</p>
                        <p className="font-mono dir-ltr text-left">Card: 6104-3378-1234-5678</p>
                        <p className="mt-2 text-xs opacity-80">لطفا پس از واریز، تصویر فیش را به پشتیبانی ارسال کنید.</p>
                    </div>
                )}
            </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6 sticky top-24 shadow-lg shadow-gray-200/50 dark:shadow-black/20">
                <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">خلاصه سفارش</h3>
                
                {/* Plan Card Mini */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-gray-800 dark:text-white capitalize">{plan.plan_name}</span>
                        <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md">
                            {billingCycle === 'monthly' ? 'یک ماهه' : 'یک ساله'}
                        </span>
                    </div>
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Bot size={14} /> <span>{plan.plan_bots} ربات</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <MessageSquare size={14} /> <span>{parseInt(plan.plan_messages).toLocaleString('en-US')} پیام</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Database size={14} /> <span>{parseInt(plan.plan_storage).toLocaleString('en-US')} مگابایت</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                            <Cpu size={14} /> <span>{plan.plan_llm} پایگاه دانش</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 pb-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>قیمت پایه</span>
                        <span className="font-mono">{basePrice.toLocaleString('en-US')} <span className="text-xs">تومان</span></span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                        <span>مالیات (۹٪)</span>
                        <span className="font-mono">{taxAmount.toLocaleString('en-US')} <span className="text-xs">تومان</span></span>
                    </div>
                </div>

                <div className="pt-4 mb-6">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 dark:text-white">مبلغ قابل پرداخت</span>
                        <div className="text-right">
                            <span className="block text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                                {finalPrice.toLocaleString('en-US')}
                            </span>
                            <span className="text-xs text-gray-500">تومان</span>
                        </div>
                    </div>
                </div>

                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 active:scale-95 transition-all flex items-center justify-center gap-2">
                    {paymentMethod === 'online' ? 'پرداخت و فعال‌سازی' : 'ثبت سفارش'}
                    <ShieldCheck size={18} />
                </button>
                
                <p className="text-xs text-center text-gray-400 mt-4">
                    با پرداخت این مبلغ، با قوانین و مقررات سرویس موافقت می‌کنید.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
