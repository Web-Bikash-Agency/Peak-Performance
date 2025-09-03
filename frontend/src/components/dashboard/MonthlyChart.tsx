import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonthlyStats } from '@/types/member';
import { useState, useEffect } from 'react';

interface MonthlyChartProps {
  data: MonthlyStats[];
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  // FIXED: Default to current year (2025)
  const currentYear = new Date().getFullYear().toString();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  
  // FIXED: Generate available years dynamically from data
  const availableYears = [...new Set(data.map(stat => stat.year.toString()))]
    .sort((a, b) => parseInt(b) - parseInt(a)); // Sort descending (newest first)
  
  // FIXED: If no data for current year, default to the first available year
  useEffect(() => {
    if (availableYears.length > 0 && !availableYears.includes(currentYear)) {
      setSelectedYear(availableYears[0]);
    }
  }, [data, currentYear, availableYears]);
  
  const filteredData = data.filter(stat => stat.year.toString() === selectedYear);
  
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
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-full sm:w-24">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {/* FIXED: Dynamic year options from data */}
            {availableYears.map(year => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
            {/* Fallback: If no data, show current and previous years */}
            {availableYears.length === 0 && (
              <>
                <SelectItem value={currentYear}>{currentYear}</SelectItem>
                <SelectItem value={(parseInt(currentYear) - 1).toString()}>
                  {parseInt(currentYear) - 1}
                </SelectItem>
              </>
            )}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-3 sm:p-6">
        <div className="h-64 sm:h-80 lg:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={filteredData}
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
      </CardContent>
    </Card>
  );
}