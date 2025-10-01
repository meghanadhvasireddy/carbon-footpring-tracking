import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { useCarbonData } from '@/hooks/useCarbonData';
import { Calendar } from 'lucide-react';

export function MonthlyComparison() {
  const { getEntriesByDateRange } = useCarbonData();
  
  const currentMonth = new Date();
  const lastMonth = subMonths(currentMonth, 1);
  const twoMonthsAgo = subMonths(currentMonth, 2);
  
  const getMonthlyTotal = (month: Date) => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const entries = getEntriesByDateRange(format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'));
    return entries.reduce((sum, entry) => sum + (entry.co2e || 0), 0);
  };

  const data = [
    {
      month: format(twoMonthsAgo, 'MMM yyyy'),
      total: getMonthlyTotal(twoMonthsAgo),
      shortMonth: format(twoMonthsAgo, 'MMM')
    },
    {
      month: format(lastMonth, 'MMM yyyy'),
      total: getMonthlyTotal(lastMonth),
      shortMonth: format(lastMonth, 'MMM')
    },
    {
      month: format(currentMonth, 'MMM yyyy'),
      total: getMonthlyTotal(currentMonth),
      shortMonth: format(currentMonth, 'MMM')
    }
  ];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-eco-green">
            Total: {payload[0].value.toFixed(2)} kg CO₂e
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-card-eco">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Monthly Comparison
        </CardTitle>
        <CardDescription>
          Compare your carbon footprint across recent months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--eco-green))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--eco-green))" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="shortMonth" 
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="total" 
              fill="url(#barGradient)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
          {data.map((month, index) => {
            const isLowest = month.total === Math.min(...data.map(d => d.total));
            const isHighest = month.total === Math.max(...data.map(d => d.total));
            
            return (
              <div key={month.month} className="text-center">
                <p className="text-sm text-muted-foreground">{month.shortMonth}</p>
                <p className={`font-bold ${
                  isLowest ? 'text-eco-green' : 
                  isHighest ? 'text-destructive' : 
                  'text-foreground'
                }`}>
                  {month.total.toFixed(1)} kg
                </p>
                {isLowest && <p className="text-xs text-eco-green">Best month! 🎉</p>}
                {isHighest && <p className="text-xs text-destructive">Room for improvement</p>}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}