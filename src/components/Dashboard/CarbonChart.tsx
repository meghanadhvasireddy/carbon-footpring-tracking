import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format, subDays } from 'date-fns';
import { Entry } from '@/hooks/useCarbonData';
import { TrendingDown } from 'lucide-react';

interface CarbonChartProps {
  entries: Entry[];
}

export function CarbonChart({ entries }: CarbonChartProps) {
  // Create daily data for the last 30 days
  const dailyData = [];
  for (let i = 29; i >= 0; i--) {
    const date = subDays(new Date(), i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayEntries = entries.filter(entry => entry.occurred_on === dateStr);
    const total = dayEntries.reduce((sum, entry) => sum + (entry.co2e || 0), 0);
    
    dailyData.push({
      date: format(date, 'MMM d'),
      co2e: total,
      fullDate: dateStr,
      goal: 6.85 // Daily goal line
    });
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-eco-green">
            CO₂e: {payload[0].value.toFixed(2)} kg
          </p>
          <p className="text-muted-foreground text-sm">
            Goal: {payload[1]?.value.toFixed(2)} kg
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
          <TrendingDown className="h-5 w-5" />
          Daily Carbon Footprint
        </CardTitle>
        <CardDescription>
          Your daily CO₂ emissions over the last 30 days
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={dailyData}>
            <defs>
              <linearGradient id="carbonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--eco-green))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--eco-green))" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="date" 
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              label={{ value: 'kg CO₂e', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="co2e"
              stroke="hsl(var(--eco-green))"
              strokeWidth={2}
              fill="url(#carbonGradient)"
            />
            <Line
              type="monotone"
              dataKey="goal"
              stroke="hsl(var(--muted-foreground))"
              strokeDasharray="5 5"
              strokeWidth={1}
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}