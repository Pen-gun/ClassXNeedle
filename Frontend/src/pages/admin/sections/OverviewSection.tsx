import { useQuery } from '@tanstack/react-query';
import {
  adminGetCouponStats,
  adminGetOrderStats,
  adminGetProductStats,
  adminGetReviewStats,
  adminGetUserStats
} from '../../../lib/api';
import SectionShell from '../SectionShell';
import { formatCurrency } from '../utils';

const OverviewSection = () => {
  const { data: productStats } = useQuery({ queryKey: ['admin', 'stats', 'products'], queryFn: adminGetProductStats });
  const { data: orderStats } = useQuery({ queryKey: ['admin', 'stats', 'orders'], queryFn: adminGetOrderStats });
  const { data: userStats } = useQuery({ queryKey: ['admin', 'stats', 'users'], queryFn: adminGetUserStats });
  const { data: reviewStats } = useQuery({ queryKey: ['admin', 'stats', 'reviews'], queryFn: adminGetReviewStats });
  const { data: couponStats } = useQuery({ queryKey: ['admin', 'stats', 'coupons'], queryFn: adminGetCouponStats });

  const totalProducts = productStats?.totalStats?.[0]?.totalProducts ?? 0;
  const lowStock = productStats?.lowStock ?? [];

  const totalOrders = orderStats?.overall?.[0]?.totalOrders ?? 0;
  const totalRevenue = orderStats?.overall?.[0]?.totalRevenue ?? 0;

  const totalUsers = userStats?.overall?.[0]?.totalUsers ?? 0;
  const activeUsers = userStats?.overall?.[0]?.activeUsers ?? 0;

  const totalReviews = reviewStats?.overall?.[0]?.totalReviews ?? 0;
  const averageRating = reviewStats?.overall?.[0]?.averageRating ?? 0;

  const totalCoupons = couponStats?.overall?.[0]?.totalCoupons ?? 0;
  const activeCoupons = couponStats?.overall?.[0]?.activeCoupons ?? 0;

  return (
    <SectionShell title="Operations overview" subtitle="High-level visibility across your store.">
      <div className="grid md:grid-cols-3 gap-4">
        <StatCard title="Products" value={totalProducts} detail={`${lowStock.length} low stock items`} />
        <StatCard title="Orders" value={totalOrders} detail={formatCurrency(totalRevenue)} />
        <StatCard title="Customers" value={totalUsers} detail={`${activeUsers} active`} />
        <StatCard title="Reviews" value={totalReviews} detail={`${averageRating.toFixed(1)} avg rating`} />
        <StatCard title="Coupons" value={totalCoupons} detail={`${activeCoupons} active`} />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h3 className="text-lg font-medium">Low stock watchlist</h3>
        <div className="mt-4 grid md:grid-cols-2 gap-4">
          {lowStock.length === 0 && <p className="text-stone-400">All inventory healthy.</p>}
          {lowStock.map((item: { name: string; quantity: number; price?: number }) => (
            <div key={item.name} className="flex items-center justify-between rounded-xl bg-black/30 px-4 py-3">
              <div>
                <p className="text-sm">{item.name}</p>
                <p className="text-xs text-stone-400">Qty: {item.quantity}</p>
              </div>
              <span className="text-sm">{formatCurrency(item.price)}</span>
            </div>
          ))}
        </div>
      </div>
    </SectionShell>
  );
};

const StatCard = ({ title, value, detail }: { title: string; value: string | number; detail?: string }) => (
  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
    <p className="text-sm text-stone-400">{title}</p>
    <p className="text-2xl font-semibold mt-2">{value}</p>
    {detail && <p className="text-xs text-stone-500 mt-1">{detail}</p>}
  </div>
);

export default OverviewSection;
