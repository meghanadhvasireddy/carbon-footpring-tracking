import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Calculator, Calendar } from 'lucide-react';
import { useCarbonData, ActivityType } from '@/hooks/useCarbonData';
import { useToast } from '@/hooks/use-toast';

interface ActivityFormProps {
  onBack: () => void;
}

export function ActivityForm({ onBack }: ActivityFormProps) {
  const { activityTypes, addEntry } = useCarbonData();
  const { toast } = useToast();
  
  const [selectedActivityType, setSelectedActivityType] = useState<ActivityType | null>(null);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);

  const estimatedCo2e = selectedActivityType && amount 
    ? parseFloat(amount) * selectedActivityType.emission_factor 
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedActivityType || !amount || !date) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast({
        title: "Invalid Amount", 
        description: "Please enter a valid positive number",
        variant: "destructive"
      });
      return;
    }

    await addEntry(selectedActivityType.id, numAmount, date);
    
    // Reset form
    setSelectedActivityType(null);
    setAmount("");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="min-h-screen bg-gradient-earth p-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-eco-green hover:text-eco-dark hover:bg-eco-light/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Log Activity</h1>
          <p className="text-muted-foreground">Track your daily carbon footprint</p>
        </div>

        <Card className="bg-gradient-card border-0 shadow-eco">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Add New Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="activity-type">Activity Type</Label>
                <Select value={selectedActivityType?.id || ''} onValueChange={(value) => {
                  const activity = activityTypes.find(at => at.id === value);
                  setSelectedActivityType(activity || null);
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an activity..." />
                  </SelectTrigger>
                  <SelectContent>
                    {activityTypes.map((activity) => (
                      <SelectItem key={activity.id} value={activity.id}>
                        <div className="flex items-center gap-2">
                          <span>{activity.icon}</span>
                          <span>{activity.name}</span>
                          <span className="text-muted-foreground">({activity.unit})</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedActivityType && (
                  <p className="text-sm text-muted-foreground">
                    Emission factor: {selectedActivityType.emission_factor} kg CO₂e per {selectedActivityType.unit}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">
                  Amount {selectedActivityType && `(${selectedActivityType.unit})`}
                </Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.1"
                  min="0"
                  placeholder={selectedActivityType ? `Enter ${selectedActivityType.unit}` : "Enter amount"}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>

              {selectedActivityType && amount && (
                <Card className="bg-eco-light/10 border-eco-light">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-eco-dark">
                      <Calculator className="h-5 w-5" />
                      <span className="font-medium">Estimated Impact:</span>
                      <span className="font-bold text-lg">{estimatedCo2e.toFixed(2)} kg CO₂e</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button 
                type="submit" 
                className="w-full bg-gradient-eco hover:shadow-eco transition-all duration-300"
                size="lg"
              >
                Add Activity
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Activity Quick Reference */}
        <Card className="mt-6 bg-gradient-card border-0 shadow-card-eco">
          <CardHeader>
            <CardTitle>Activity Reference</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-2">
              {activityTypes.map((activity) => (
                <div 
                  key={activity.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                  onClick={() => setSelectedActivityType(activity)}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{activity.icon}</span>
                    <div>
                      <div className="font-medium text-sm">{activity.name}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {activity.category}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-eco-green">
                      {activity.emission_factor} kg
                    </div>
                    <div className="text-xs text-muted-foreground">
                      per {activity.unit}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}