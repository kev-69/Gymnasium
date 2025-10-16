import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface RevenueChartProps {
  data: Array<{ name: string; revenue: number; subscriptions: number }>;
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
            name="Revenue (GH₵)"
          />
          <Line
            type="monotone"
            dataKey="subscriptions"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
            activeDot={{ r: 6 }}
            name="Subscriptions"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

interface UserGrowthChartProps {
  data: Array<{ name: string; users: number; students: number; staff: number; public: number }>;
}

export function UserGrowthChart({ data }: UserGrowthChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">User Growth</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Bar dataKey="students" fill="#3b82f6" name="Students" />
          <Bar dataKey="staff" fill="#10b981" name="Staff" />
          <Bar dataKey="public" fill="#f59e0b" name="Public" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

interface SubscriptionStatusChartProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function SubscriptionStatusChart({ data }: SubscriptionStatusChartProps) {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Status</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

interface MonthlyComparisonChartProps {
  currentMonth: Array<{ name: string; value: number }>;
  previousMonth: Array<{ name: string; value: number }>;
}

export function MonthlyComparisonChart({
  currentMonth,
  previousMonth,
}: MonthlyComparisonChartProps) {
  // Combine data for comparison
  const combinedData = currentMonth.map((item, index) => ({
    name: item.name,
    current: item.value,
    previous: previousMonth[index]?.value || 0,
  }));

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Comparison</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={combinedData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '12px' }} />
          <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '0.5rem',
            }}
          />
          <Legend />
          <Bar dataKey="current" fill="#3b82f6" name="Current Month" />
          <Bar dataKey="previous" fill="#94a3b8" name="Previous Month" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
