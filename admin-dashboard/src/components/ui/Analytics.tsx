interface AnalyticsCardProps {
  title: string;
  items: Array<{ label: string; value: string | number; percentage?: number; color?: string }>;
  icon?: React.ReactNode;
}

function AnalyticsCard({ title, items, icon }: AnalyticsCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {item.color && (
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
              )}
              <span className="text-sm text-gray-600">{item.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-900">{item.value}</span>
              {item.percentage !== undefined && (
                <span
                  className={`text-xs font-medium ${
                    item.percentage >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {item.percentage >= 0 ? '+' : ''}
                  {item.percentage}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface RevenueByUserTypeProps {
  data: {
    student: { amount: number; count: number };
    staff: { amount: number; count: number };
    public: { amount: number; count: number };
  };
}

export function RevenueByUserType({ data }: RevenueByUserTypeProps) {
  const formatCurrency = (amount: number) => `GH₵${amount.toFixed(2)}`;
  
  const totalRevenue = data.student.amount + data.staff.amount + data.public.amount;
  
  const items = [
    {
      label: 'Students',
      value: formatCurrency(data.student.amount),
      percentage: totalRevenue > 0 ? Math.round((data.student.amount / totalRevenue) * 100) : 0,
      color: '#3b82f6',
    },
    {
      label: 'Staff',
      value: formatCurrency(data.staff.amount),
      percentage: totalRevenue > 0 ? Math.round((data.staff.amount / totalRevenue) * 100) : 0,
      color: '#10b981',
    },
    {
      label: 'Public',
      value: formatCurrency(data.public.amount),
      percentage: totalRevenue > 0 ? Math.round((data.public.amount / totalRevenue) * 100) : 0,
      color: '#f59e0b',
    },
  ];

  return (
    <AnalyticsCard
      title="Revenue by User Type"
      items={items}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      }
    />
  );
}

interface PopularPlansProps {
  plans: Array<{
    name: string;
    subscriptions: number;
    revenue: number;
  }>;
}

export function PopularPlans({ plans }: PopularPlansProps) {
  // Sort by subscriptions count and take top 5
  const topPlans = [...plans]
    .sort((a, b) => b.subscriptions - a.subscriptions)
    .slice(0, 5);

  const items = topPlans.map((plan) => ({
    label: plan.name,
    value: `${plan.subscriptions} subs`,
    color: undefined,
  }));

  return (
    <AnalyticsCard
      title="Most Popular Plans"
      items={items}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      }
    />
  );
}

interface RenewalRatesProps {
  data: {
    totalSubscriptions: number;
    renewedSubscriptions: number;
    cancelledSubscriptions: number;
    expiredSubscriptions: number;
  };
}

export function RenewalRates({ data }: RenewalRatesProps) {
  const renewalRate =
    data.totalSubscriptions > 0
      ? Math.round((data.renewedSubscriptions / data.totalSubscriptions) * 100)
      : 0;
  
  const cancellationRate =
    data.totalSubscriptions > 0
      ? Math.round((data.cancelledSubscriptions / data.totalSubscriptions) * 100)
      : 0;

  const items = [
    {
      label: 'Renewal Rate',
      value: `${renewalRate}%`,
      color: '#10b981',
    },
    {
      label: 'Renewed',
      value: data.renewedSubscriptions,
    },
    {
      label: 'Cancelled',
      value: data.cancelledSubscriptions,
      percentage: -cancellationRate,
    },
    {
      label: 'Expired',
      value: data.expiredSubscriptions,
    },
  ];

  return (
    <AnalyticsCard
      title="Subscription Renewal Rates"
      items={items}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      }
    />
  );
}

interface PeakPeriodsProps {
  data: Array<{
    period: string;
    registrations: number;
    subscriptions: number;
  }>;
}

export function PeakPeriods({ data }: PeakPeriodsProps) {
  // Find peak periods
  const sortedByRegistrations = [...data].sort(
    (a, b) => b.registrations - a.registrations
  );
  
  const items = sortedByRegistrations.slice(0, 5).map((period) => ({
    label: period.period,
    value: `${period.registrations} users`,
    color: undefined,
  }));

  return (
    <AnalyticsCard
      title="Peak Registration Periods"
      items={items}
      icon={
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      }
    />
  );
}
