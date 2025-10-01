import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryBreakdownProps {
  categoryTotals: Record<string, number>;
}

const COLORS = [
  'hsl(152, 65%, 35%)', // Primary green
  'hsl(120, 60%, 50%)', // Accent green
  'hsl(35, 40%, 45%)',  // Earth brown
  'hsl(210, 75%, 60%)', // Sky blue
  'hsl(45, 70%, 55%)',  // Yellow
  'hsl(270, 50%, 50%)', // Purple
];

const categoryIcons: Record<string, string> = {
  'Transportation': '🚗',
  'Energy': '⚡',
  'Food': '🍽️',
  'Waste': '🗑️',
  'Water': '💧',
  'Other': '📦'
};

export function CategoryBreakdown({ categoryTotals }: CategoryBreakdownProps) {
  const data = Object.entries(categoryTotals)
    .map(([category, total]) => ({
      name: category,
      value: total,
      icon: categoryIcons[category] || '📊'
    }))
    .sort((a, b) => b.value - a.value);

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium flex items-center gap-2">
            <span>{data.icon}</span>
            {data.name}
          </p>
          <p className="text-eco-green">
            {data.value.toFixed(2)} kg CO₂e ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices smaller than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="bold"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  if (data.length === 0) {
    return (
      <Card className="bg-gradient-card border-0 shadow-card-eco">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
          <CardDescription>
            No data available for this period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>Start logging activities to see your breakdown</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-0 shadow-card-eco">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Category Breakdown
        </CardTitle>
        <CardDescription>
          Your emissions by category this month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={CustomLabel}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        
        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm">{item.icon}</span>
              <span className="text-sm font-medium">{item.name}</span>
              <span className="text-sm text-muted-foreground ml-auto">
                {item.value.toFixed(1)} kg
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}