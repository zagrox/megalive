
import React, { useEffect, useState } from 'react';
import { Check, Crown, Zap, MessageSquare, Database, Cpu, Bot, ArrowLeft } from 'lucide-react';
import { Plan } from '../../types';
import { fetchPricingPlans } from '../../services/configService';
import { useAuth } from '../../context/AuthContext';

interface PricingProps {
  onSelectPlan?: (plan: Plan) => void;
}

const Pricing: React.FC<PricingProps> = ({ onSelectPlan }) => {
  const { user } = useAuth();
  const profilePlan = user?.profile?.profile_plan;
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPricingPlans().then(data => {
      setPlans(data);
      setLoading(false);
    });
  }, []);

  const getPlanColor = (name: string) => {
    switch (String(name || '').toLowerCase()) {
      case 'enterprise': return 'border-purple-500 bg-purple-50 dark:bg-purple-900/20';
      case 'business': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/20';
      case 'starter': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      default: return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
    }
  };

  const getPlanIcon = (name: string) => {
    switch (String(name || '').toLowerCase()) {
      case 'enterprise': return <Crown size={24} className="text-purple-600 dark:text-purple-400" />;
      case 'business': return <Zap size={24} className="text-amber-600 dark:text-amber-400" />;
      case 'starter': return <Bot size={24} className="text-blue-600 dark:text-blue-400" />;
      default: return <Bot size={24} className="text-gray-500" />;
    }
  };

  const formatPrice = (price: number) => {
      return price.toLocaleString('en-US');
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
        <div>
            <p className="text-gray-500 dark:text-gray-400 text-lg">بهترین طرح را متناسب با نیاز کسب و کار خود انتخاب کنید.</p>
        </div>

        {loading ? (
             <div className="flex justify-center py-24">
                 <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
             </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
              {plans.map((plan, idx) => {
                // Robust check for current plan (ID match or fallback to name match)
                const isCurrent = 
                    plan.id === Number(profilePlan) || 
                    (typeof profilePlan === 'object' && (profilePlan as any)?.id === plan.id) ||
                    String(plan.plan_name || '').toLowerCase() === String(profilePlan || '').toLowerCase();

                return (
                  <div 
                    key={idx}
                    className={`relative rounded-2xl border-2 p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col ${getPlanColor(plan.plan_name)} ${isCurrent ? 'ring-2 ring-offset-2 ring-blue-500 dark:ring-offset-gray-900' : ''}`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-blue-600 text-white text-xs font-bold rounded-full shadow-md whitespace-nowrap">
                        طرح فعلی شما
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-4">
                       <div className="p-2 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
                          {getPlanIcon(plan.plan_name)}
                       </div>
                       <h3 className="text-lg font-bold text-gray-800 dark:text-white capitalize">{plan.plan_name}</h3>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            {plan.plan_monthly === 0 ? (
                                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                    رایگان
                                </span>
                            ) : (
                                <div className="flex items-baseline gap-1">
                                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {formatPrice(plan.plan_monthly)}
                                    </span>
                                    <span className="text-xs text-gray-500">تومان</span>
                                    <span className="text-xs text-gray-500">/ ماهانه</span>
                                </div>
                            )}
                        </div>
                        {plan.plan_yearly > 0 && (
                            <p className="text-xs text-gray-500 mt-1">
                                {formatPrice(plan.plan_yearly)} تومان سالانه
                            </p>
                        )}
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <Bot size={18} className="text-blue-500 shrink-0" />
                            <span><strong className="mx-1">{plan.plan_bots}</strong> عدد چت‌بات</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <MessageSquare size={18} className="text-green-500 shrink-0" />
                            <span><strong className="mx-1">{plan.plan_messages.toLocaleString('en-US')}</strong> پیام در ماه</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <Database size={18} className="text-amber-500 shrink-0" />
                            <span><strong className="mx-1">{plan.plan_storage.toLocaleString('en-US')}</strong> مگابایت فضا</span>
                        </li>
                        <li className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                            <Cpu size={18} className="text-purple-500 shrink-0" />
                            <span><strong className="mx-1">{plan.plan_llm}</strong> پایگاه دانش</span>
                        </li>
                    </ul>

                    <button 
                        onClick={() => onSelectPlan && onSelectPlan(plan)}
                        className={`w-full py-3 rounded-xl font-bold transition-all ${
                            isCurrent 
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/20 active:scale-95' 
                            : 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 active:scale-95'
                        }`}
                    >
                        {isCurrent ? 'تمدید طرح' : (plan.plan_monthly === 0 ? 'شروع رایگان' : 'انتخاب طرح')}
                    </button>
                  </div>
                );
              })}
            </div>
        )}
    </div>
  );
};

export default Pricing;
