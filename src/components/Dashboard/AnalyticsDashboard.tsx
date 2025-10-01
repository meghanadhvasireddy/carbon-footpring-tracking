import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingDown, 
  TrendingUp, 
  Target, 
  Calendar,
  Leaf,
  Award,
  BarChart3,
  PieChart
} from 'lucide-react';
import { useCarbonData } from '@/hooks/useCarbonData';
import { CarbonChart } from './CarbonChart';
import { CategoryBreakdown } from './CategoryBreakdown';
import { MonthlyComparison } from './MonthlyComparison';

export function AnalyticsDashboard() {
  const { getRecentEntries, getTotalCarbonFootprint, activityTypes } = useCarbonData();
  
  const last30Days = getRecentEntries(30);
  const last7Days = getRecentEntries(7);
  const totalCarbon = getTotalCarbonFootprint();
  
  // Calculate statistics
  const weeklyAverage = last7Days.reduce((sum, entry) => sum + (entry.co2e || 0), 0) / 7;
  const monthlyTotal = last30Days.reduce((sum, entry) => sum + (entry.co2e || 0), 0);
  const dailyGoal = 6.85; // Global daily average in kg CO2e
  const weeklyGoal = dailyGoal * 7;
  const monthlyGoal = dailyGoal * 30;
  
  // Calculate trends
  const firstHalf = last30Days.slice(0, 15);
  const secondHalf = last30Days.slice(15);
  const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + (entry.co2e || 0), 0) / 15;
  const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + (entry.co2e || 0), 0) / 15;
  const trend = secondHalfAvg - firstHalfAvg;
  
  // Calculate category breakdown
  const categoryTotals = last30Days.reduce((acc, entry) => {
    const activity = activityTypes.find(at => at.id === entry.activity_type_id);
    if (activity) {
      const category = activity.category;
      acc[category] = (acc[category] || 0) + (entry.co2e || 0);
    }
    return acc;
  }, {} as Record<string, number>);

  const achievements = [
    {
      title: "Eco Warrior",
      description: "7 days below daily goal",
      achieved: last7Days.every(entry => (entry.co2e || 0) < dailyGoal),
      icon: "🌱"
    },
    {
      title: "Carbon Conscious",
      description: "Logged activities for 30 days",
      achieved: last30Days.length >= 30,
      icon: "📊"
    },
    {
      title: "Trend Setter",
      description: "Reduced emissions this month",
      achieved: trend < 0,
      icon: "📉"
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Average</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {weeklyAverage.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              CO₂e per day
            </p>
            <Progress 
              value={(weeklyAverage / dailyGoal) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Total</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {monthlyTotal.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              CO₂e this month
            </p>
            <Progress 
              value={(monthlyTotal / monthlyGoal) * 100} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Trend</CardTitle>
            {trend < 0 ? (
              <TrendingDown className="h-4 w-4 text-eco-green" />
            ) : (
              <TrendingUp className="h-4 w-4 text-destructive" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${trend < 0 ? 'text-eco-green' : 'text-destructive'}`}>
              {trend > 0 ? '+' : ''}{trend.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              {trend < 0 ? 'Improvement!' : 'vs last half month'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tracked</CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {totalCarbon.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground">
              All time CO₂e
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CarbonChart entries={last30Days} />
        <CategoryBreakdown categoryTotals={categoryTotals} />
      </div>

      {/* Achievements */}
      <Card className="bg-gradient-card border-0 shadow-card-eco">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Achievements
          </CardTitle>
          <CardDescription>
            Your environmental milestones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {achievements.map((achievement, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border transition-all ${
                  achievement.achieved
                    ? 'bg-eco-light/20 border-eco-green'
                    : 'bg-muted/30 border-border'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{achievement.icon}</span>
                  <div>
                    <h4 className="font-medium">{achievement.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {achievement.description}
                    </p>
                  </div>
                </div>
                {achievement.achieved && (
                  <Badge variant="secondary" className="mt-2">
                    Achieved!
                  </Badge>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Comparison */}
      <MonthlyComparison />
    </div>
  );
}