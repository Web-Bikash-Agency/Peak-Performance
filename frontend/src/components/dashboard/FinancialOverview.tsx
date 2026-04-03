import { DollarSign, TrendingUp, Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";
import { MonthlyStats } from "@/types/dashboard";
import { PaymentStats } from "@/types/payment";

interface FinancialOverviewProps {
  monthlyStats: MonthlyStats[];
  paymentStats: PaymentStats | null;
  loading: boolean;
}

const TYPE_LABEL: Record<string, string> = {
  MEMBERSHIP: "Membership",
  PERSONAL_TRAINING: "Personal Training",
};

const PIE_COLORS = ["hsl(var(--primary))", "hsl(262 83% 58%)"];

function formatCurrency(amount: number) {
  if (amount >= 1_000_000) return `₹${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `₹${(amount / 1_000).toFixed(1)}K`;
  return `₹${amount.toFixed(0)}`;
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
  loading,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  color: string;
  loading: boolean;
}) {
  return (
    <Card className="animate-fade-in">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground cursor-default">{label}</p>
            {loading ? (
              <div className="h-7 w-24 bg-muted animate-pulse rounded" />
            ) : (
              <p className="text-2xl font-bold cursor-default">{value}</p>
            )}
            {sub && !loading && (
              <p className="text-xs text-muted-foreground cursor-default">{sub}</p>
            )}
          </div>
          <div className={`p-2 rounded-lg ${color}`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function FinancialOverview({ monthlyStats, paymentStats, loading }: FinancialOverviewProps) {
  const currentYear = new Date().getFullYear();

  const revenueData = monthlyStats
    .filter(s => s.year === currentYear)
    .map(s => ({ month: s.month, revenue: s.revenue }));

  // Only Membership and Personal Training
  const distributionData = (paymentStats?.paymentTypeDistribution ?? [])
    .filter(d => d.type === "MEMBERSHIP" || d.type === "PERSONAL_TRAINING")
    .map(d => ({ ...d, label: TYPE_LABEL[d.type] }));

  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2 cursor-default">
        <DollarSign className="w-6 h-6 text-primary" />
        Financial Overview
      </h2>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingUp}
          label="Total Revenue"
          value={paymentStats ? formatCurrency(paymentStats.totalRevenue) : "—"}
          sub="All-time paid"
          color="bg-primary"
          loading={loading}
        />
        <StatCard
          icon={DollarSign}
          label="This Month"
          value={paymentStats ? formatCurrency(paymentStats.monthlyRevenue) : "—"}
          sub="Current month revenue"
          color="bg-emerald-500"
          loading={loading}
        />
        <StatCard
          icon={Clock}
          label="Pending Payments"
          value={paymentStats ? String(paymentStats.pendingPayments) : "—"}
          sub="Awaiting collection"
          color="bg-amber-500"
          loading={loading}
        />
        <StatCard
          icon={AlertCircle}
          label="Overdue"
          value={paymentStats ? String(paymentStats.overduePayments) : "—"}
          sub="Require action"
          color="bg-destructive"
          loading={loading}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Area Chart — spans 2 cols */}
        <Card className="animate-fade-in lg:col-span-2">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-default">
              Monthly Revenue
            </CardTitle>
            <CardDescription className="cursor-default">
              Revenue collected per month ({currentYear})
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={revenueData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    className="opacity-30"
                    stroke="hsl(var(--muted-foreground))"
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                    tickLine={{ stroke: "hsl(var(--border))" }}
                    axisLine={{ stroke: "hsl(var(--border))" }}
                    width={55}
                    tickFormatter={(v) => formatCurrency(v)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "14px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    labelStyle={{ color: "hsl(var(--foreground))", fontWeight: "bold" }}
                    cursor={{ stroke: "hsl(var(--border))" }}
                    formatter={(value: number) => [formatCurrency(value), "Revenue"]}
                    labelFormatter={(label) => `${label} ${currentYear}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fill="url(#revenueGradient)"
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                    activeDot={{ r: 5, fill: "hsl(var(--primary))" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Type Pie Chart */}
        <Card className="animate-fade-in">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-default">
              Payment Types
            </CardTitle>
            <CardDescription className="cursor-default">
              Membership vs Personal Training
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0">
            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distributionData}
                    dataKey="count"
                    nameKey="label"
                    cx="50%"
                    cy="45%"
                    innerRadius="40%"
                    outerRadius="75%"
                    stroke="none"
                    paddingAngle={4}
                    label={({ label, percent }) =>
                      `${(percent * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {distributionData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                      fontSize: "14px",
                      padding: "8px 12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value: number, name: string) => [value, name]}
                  />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span style={{ color: "hsl(var(--foreground))", fontSize: 12 }}>
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
