import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyStats } from '@/types/dashboard';
import { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { dashboardAPI } from '@/services/api';

export function MonthlyChart() {
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const yearsQuery = useQuery({
    queryKey: ['dashboard', 'available-years'],
    queryFn: () => dashboardAPI.getAvailableYears().then(response => response.data),
    staleTime: 5 * 60 * 1000,
  });

  const availableYears = useMemo(
    () => {
      const years = [...(yearsQuery.data?.memberYears ?? []), ...(yearsQuery.data?.revenueYears ?? [])];
      const uniqueYears = [...new Set(years)].sort((a, b) => b - a);
      return uniqueYears.length > 0 ? uniqueYears : [currentYear, currentYear - 1];
    },
    [yearsQuery.data, currentYear]
  );

  useEffect(() => {
    if (availableYears.length === 0) return;
    if (!availableYears.includes(selectedYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [availableYears, selectedYear]);

  const monthlyQuery = useQuery({
    queryKey: ['dashboard', 'monthly-stats', selectedYear],
    queryFn: () => dashboardAPI.getMonthlyStats(selectedYear).then(response => response.data),
    enabled: availableYears.length === 0 || availableYears.includes(selectedYear),
    staleTime: 0,
  });

  const chartData = monthlyQuery.data ?? [];
  const isLoading = yearsQuery.isLoading || monthlyQuery.isLoading;
  const isEmpty = availableYears.length === 0;

  return (
    <Card className="animate-fade-in w-full">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 p-4 sm:p-6">
        <div>
          <CardTitle className="text-lg sm:text-xl font-bold bg-gradient-primary bg-clip-text text-transparent cursor-default">
            New Members by Month
          </CardTitle>
          <CardDescription className="text-sm cursor-default">
            Track monthly member acquisition trends
          </CardDescription>
        </div>
        <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value, 10))}>
          <SelectTrigger className="w-full sm:w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map(year => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-64 sm:h-80 lg:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0
              }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                className="opacity-30"
                stroke="hsl(var(--muted-foreground))"
              />
              <XAxis
                dataKey="month"
                tick={{
                  fontSize: 10,
                  fill: 'hsl(var(--muted-foreground))'
                }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                angle={-45}
                textAnchor="end"
                height={60}
                interval={0}
              />
              <YAxis
                tick={{
                  fontSize: 10,
                  fill: 'hsl(var(--muted-foreground))'
                }}
                tickLine={{ stroke: 'hsl(var(--border))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                width={40}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  color: 'hsl(var(--foreground))',
                  fontSize: '14px',
                  padding: '8px 12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                }}
                labelStyle={{
                  color: 'hsl(var(--foreground))',
                  fontWeight: 'bold'
                }}
                cursor={{
                  fill: 'hsl(var(--muted))',
                  opacity: 0.3
                }}
                formatter={(value, name) => [
                  value,
                  name === 'newMembers' ? 'New Members' : name
                ]}
                labelFormatter={(label) => `${label} ${selectedYear}`}
              />
              <Bar
                dataKey="newMembers"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                className="drop-shadow-sm"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {isLoading && (
          <p className="mt-3 text-sm text-muted-foreground cursor-default">Loading available years and monthly data...</p>
        )}
        {isEmpty && (
          <p className="mt-3 text-sm text-muted-foreground cursor-default">No member data available yet.</p>
        )}
      </CardContent>
    </Card>
  );
}