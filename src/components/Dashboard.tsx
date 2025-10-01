import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCarbonData } from "@/hooks/useCarbonData";
import { format } from "date-fns";
import { Leaf, TrendingDown, Activity, Target } from "lucide-react";

interface DashboardProps {
  onAddActivity: () => void;
}

export function Dashboard({ onAddActivity }: DashboardProps) {
  const { getWeeklySummary, getDailySummary } = useCarbonData();
  
  const today = new Date().toISOString().split('T')[0];
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const weekStart = startOfWeek.toISOString().split('T')[0];
  
  const todaySummary = getDailySummary(today);
  const weekSummary = getWeeklySummary(weekStart);
  
  const avgDaily = weekSummary.totalCo2e / 7;
  const weeklyTarget = 70; // kg CO2e target per week
  const progressPercentage = Math.min((weekSummary.totalCo2e / weeklyTarget) * 100, 100);

  return (
    <div className="min-h-screen bg-gradient-earth p-6">
      {/* Hero Section */}
      <div className="relative mb-8 overflow-hidden rounded-2xl">
        <div 
          className="bg-gradient-eco px-8 py-12 text-white"
          style={{
            backgroundImage: 'linear-gradient(135deg, rgba(34, 139, 34, 0.9), rgba(50, 205, 50, 0.8))',
          }}
        >
          <div className="relative z-10">
            <h1 className="mb-4 text-4xl font-bold">Carbon Footprint Tracker</h1>
            <p className="mb-6 text-lg opacity-90">
              Track your daily activities and reduce your environmental impact
            </p>
            <Button 
              onClick={onAddActivity} 
              size="lg" 
              variant="secondary"
              className="bg-white/90 text-eco-green hover:bg-white/100 shadow-lg"
            >
              <Activity className="mr-2 h-5 w-5" />
              Log Activity
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Leaf className="h-4 w-4" />
              Today's Impact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {todaySummary.totalCo2e.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              CO₂ equivalent
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <TrendingDown className="h-4 w-4" />
              Weekly Total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {weekSummary.totalCo2e.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Activity className="h-4 w-4" />
              Daily Average
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {avgDaily.toFixed(1)} kg
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Per day this week
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Target className="h-4 w-4" />
              Weekly Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-eco-green">
              {progressPercentage.toFixed(0)}%
            </div>
            <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-eco transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progressPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              of 70kg target
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Chart */}
      <Card className="mb-8 bg-gradient-card border-0 shadow-card-eco">
        <CardHeader>
          <CardTitle>Weekly Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weekSummary.dailyBreakdown.map((day, index) => (
              <div key={day.date} className="flex items-center gap-4">
                <div className="w-20 text-sm font-medium">
                  {format(new Date(day.date), 'EEE d')}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm text-muted-foreground">
                      {day.totalCo2e.toFixed(1)} kg CO₂e
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-eco transition-all duration-300"
                      style={{ 
                        width: `${Math.max(5, (day.totalCo2e / Math.max(weekSummary.totalCo2e / 7 * 2, 1)) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      {weekSummary.topCategories.length > 0 && (
        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader>
            <CardTitle>Top Categories This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weekSummary.topCategories.slice(0, 4).map((category) => (
                <div key={category.category} className="flex items-center gap-4">
                  <div className="w-24 text-sm font-medium capitalize">
                    {category.category}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        {category.co2e.toFixed(1)} kg ({category.percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-eco transition-all duration-300"
                        style={{ width: `${category.percentage}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}