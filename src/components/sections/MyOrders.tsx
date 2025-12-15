
import React, { useEffect, useState } from 'react';
import { readItems } from '@directus/sdk';
import { directus } from '../../services/directus';
import { Order, Plan } from '../../types';
import { Loader2, Package, Calendar, CreditCard, AlertCircle, ShoppingBag } from 'lucide-react';
import { fetchPricingPlans } from '../../services/configService';

const MyOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fetchedPlans, fetchedOrders] = await Promise.all([
          fetchPricingPlans(),
          // @ts-ignore
          directus.request(readItems('order', {
            sort: ['-date_created'],
            fields: ['id', 'date_created', 'order_status', 'order_amount', 'order_duration', 'order_plan', 'order_transaction']
          }))
        ]);

        setPlans(fetchedPlans);
        setOrders(fetchedOrders as Order[]);
      } catch (err) {
        console.error("Failed to load orders:", err);
        setError("خطا در دریافت لیست سفارش‌ها.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 px-2.5 py-0.5 rounded-full text-xs font-bold">تکمیل شده</span>;
      case 'processing':
        return <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 px-2.5 py-0.5 rounded-full text-xs font-bold">در انتظار تایید</span>;
      case 'pending':
        return <span className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2.5 py-0.5 rounded-full text-xs font-bold">در انتظار پرداخت</span>;
      case 'failed':
        return <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-2.5 py-0.5 rounded-full text-xs font-bold">پرداخت ناموفق</span>;
      case 'cancelled':
      case 'canceled': // Supporting both spellings to be safe
        return <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-bold">پرداخت لغو شده</span>;
      default:
        return <span className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400 px-2.5 py-0.5 rounded-full text-xs font-bold">{status}</span>;
    }
  };

  const getPlanName = (planId: number) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.plan_name : `Plan #${planId}`;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fa-IR', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400">
        <Loader2 size={40} className="animate-spin mb-4 text-blue-600" />
        <p>در حال دریافت اطلاعات سفارش‌ها...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">سفارش‌های من</h2>
        <p className="text-gray-500 dark:text-gray-400">تاریخچه خریدها و وضعیت پرداخت‌های شما.</p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle size={20} />
          {error}
        </div>
      )}

      {!loading && orders.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4 text-gray-400">
            <ShoppingBag size={32} />
          </div>
          <h3 className="text-lg font-bold text-gray-700 dark:text-gray-200 mb-2">هنوز سفارشی ثبت نشده است</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm max-w-md mx-auto">
            شما هنوز هیچ خریدی انجام نداده‌اید. برای ارتقای حساب کاربری خود به بخش قیمت‌گذاری مراجعه کنید.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">شماره سفارش</th>
                  <th className="px-6 py-4 font-medium">طرح خریداری شده</th>
                  <th className="px-6 py-4 font-medium">مبلغ (تومان)</th>
                  <th className="px-6 py-4 font-medium">تاریخ و ساعت</th>
                  <th className="px-6 py-4 font-medium">وضعیت</th>
                  <th className="px-6 py-4 font-medium">کد پیگیری</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-600 dark:text-gray-300">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                          <Package size={16} />
                        </div>
                        <div>
                          <span className="block text-sm font-bold text-gray-800 dark:text-white capitalize">
                            {getPlanName(order.order_plan)}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400">
                            {order.order_duration === 'yearly' ? 'اشتراک سالانه' : 'اشتراک ماهانه'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 font-mono text-sm font-medium text-gray-700 dark:text-gray-200">
                        <CreditCard size={14} className="text-gray-400" />
                        {parseInt(order.order_amount).toLocaleString('en-US')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                        <Calendar size={14} />
                        <span className="font-mono">{formatDate(order.date_created)}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.order_status)}
                    </td>
                    <td className="px-6 py-4">
                        {order.order_transaction ? (
                            <span className="font-mono text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded select-all">
                                {typeof order.order_transaction === 'object' ? order.order_transaction.trackid || order.order_transaction.id : order.order_transaction}
                            </span>
                        ) : (
                            <span className="text-xs text-gray-400">-</span>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyOrders;
