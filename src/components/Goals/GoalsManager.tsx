import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Target, Plus, Edit2, Trash2, CheckCircle } from 'lucide-react';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useToast } from '@/hooks/use-toast';

interface Goal {
  id: string;
  title: string;
  targetValue: number;
  currentValue: number;
  period: 'daily' | 'weekly' | 'monthly';
  category?: string;
  deadline?: string;
  achieved: boolean;
}

export function GoalsManager() {
  const { getRecentEntries, getTotalCarbonFootprint } = useCarbonData();
  const { toast } = useToast();
  
  // Mock goals data - in a real app, this would come from Supabase
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: 'Daily Carbon Limit',
      targetValue: 6.85,
      currentValue: 0,
      period: 'daily',
      achieved: false
    },
    {
      id: '2',
      title: 'Weekly Target',
      targetValue: 48,
      currentValue: 0,
      period: 'weekly',
      achieved: false
    },
    {
      id: '3',
      title: 'Monthly Eco Goal',
      targetValue: 200,
      currentValue: 0,
      period: 'monthly',
      achieved: false
    }
  ]);

  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetValue: '',
    period: 'daily' as 'daily' | 'weekly' | 'monthly',
    category: ''
  });

  // Calculate current values for goals
  const updateGoalProgress = () => {
    const dailyEntries = getRecentEntries(1);
    const weeklyEntries = getRecentEntries(7);
    const monthlyEntries = getRecentEntries(30);

    const dailyTotal = dailyEntries.reduce((sum, entry) => sum + (entry.co2e || 0), 0);
    const weeklyTotal = weeklyEntries.reduce((sum, entry) => sum + (entry.co2e || 0), 0);
    const monthlyTotal = monthlyEntries.reduce((sum, entry) => sum + (entry.co2e || 0), 0);

    setGoals(prevGoals => 
      prevGoals.map(goal => {
        let currentValue = 0;
        switch (goal.period) {
          case 'daily':
            currentValue = dailyTotal;
            break;
          case 'weekly':
            currentValue = weeklyTotal;
            break;
          case 'monthly':
            currentValue = monthlyTotal;
            break;
        }
        
        return {
          ...goal,
          currentValue,
          achieved: currentValue <= goal.targetValue
        };
      })
    );
  };

  React.useEffect(() => {
    updateGoalProgress();
  }, []);

  const handleAddGoal = () => {
    if (!newGoal.title || !newGoal.targetValue) return;

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      targetValue: parseFloat(newGoal.targetValue),
      currentValue: 0,
      period: newGoal.period,
      category: newGoal.category || undefined,
      achieved: false
    };

    setGoals([...goals, goal]);
    setNewGoal({ title: '', targetValue: '', period: 'daily', category: '' });
    setShowAddForm(false);
    
    toast({
      title: "Goal added!",
      description: `Your new ${goal.period} goal has been created.`,
    });
  };

  const handleDeleteGoal = (goalId: string) => {
    setGoals(goals.filter(goal => goal.id !== goalId));
    toast({
      title: "Goal deleted",
      description: "The goal has been removed.",
    });
  };

  const getProgressColor = (goal: Goal) => {
    const percentage = (goal.currentValue / goal.targetValue) * 100;
    if (percentage <= 70) return 'text-eco-green';
    if (percentage <= 90) return 'text-yellow-600';
    return 'text-destructive';
  };

  const getProgressValue = (goal: Goal) => {
    return Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card border-0 shadow-card-eco">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Carbon Goals
              </CardTitle>
              <CardDescription>
                Set and track your emission reduction targets
              </CardDescription>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>
        </CardHeader>
        
        {showAddForm && (
          <CardContent className="border-t border-border pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Daily Transport Limit"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-target">Target (kg CO₂e)</Label>
                <Input
                  id="goal-target"
                  type="number"
                  step="0.1"
                  placeholder="6.85"
                  value={newGoal.targetValue}
                  onChange={(e) => setNewGoal({ ...newGoal, targetValue: e.target.value })}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-period">Period</Label>
                <Select 
                  value={newGoal.period} 
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setNewGoal({ ...newGoal, period: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-end gap-2">
                <Button 
                  onClick={handleAddGoal}
                  className="flex-1"
                >
                  Add Goal
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {goals.map((goal) => (
          <Card key={goal.id} className="bg-gradient-card border-0 shadow-card-eco">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{goal.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {goal.achieved && (
                    <CheckCircle className="h-5 w-5 text-eco-green" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <Badge variant="secondary" className="w-fit">
                {goal.period}
              </Badge>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Progress</span>
                  <span className={`font-medium ${getProgressColor(goal)}`}>
                    {goal.currentValue.toFixed(1)} / {goal.targetValue} kg
                  </span>
                </div>
                
                <Progress 
                  value={getProgressValue(goal)}
                  className="h-2"
                />
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">
                    {getProgressValue(goal).toFixed(0)}% of target
                  </span>
                  {goal.achieved ? (
                    <Badge className="bg-eco-green text-primary-foreground">
                      Achieved! 🎉
                    </Badge>
                  ) : getProgressValue(goal) > 90 ? (
                    <Badge variant="destructive">
                      Over target
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      On track
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {goals.length === 0 && (
        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardContent className="pt-6 text-center">
            <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground">No goals set yet</h3>
            <p className="text-muted-foreground mb-4">
              Create your first carbon reduction goal to start tracking your progress.
            </p>
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Goal
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}