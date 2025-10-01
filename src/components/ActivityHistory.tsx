import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Trash2, Clock, Calendar } from 'lucide-react';
import { useCarbonData, Entry, ActivityType } from '@/hooks/useCarbonData';
import { useToast } from '@/hooks/use-toast';
import { format } from "date-fns";

interface ActivityHistoryProps {
  onBack: () => void;
}

export function ActivityHistory({ onBack }: ActivityHistoryProps) {
  const { getRecentEntries, deleteEntry, activityTypes } = useCarbonData();
  const { toast } = useToast();
  const recentEntries = getRecentEntries(50);

  const handleDelete = async (entryId: string, activityName: string) => {
    await deleteEntry(entryId);
    toast({
      title: "Entry deleted",
      description: `Removed ${activityName} from your history`,
    });
  };

  const getActivityInfo = (activityTypeId: string): ActivityType | null => {
    return activityTypes.find(at => at.id === activityTypeId) || null;
  };

  // Group entries by date
  const groupedEntries = recentEntries.reduce((acc, entry) => {
    const date = entry.occurred_on;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {} as Record<string, Entry[]>);

  return (
    <div className="min-h-screen bg-gradient-earth p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="mb-4 text-eco-green hover:text-eco-dark hover:bg-eco-light/20"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Activity History</h1>
          <p className="text-muted-foreground">Review and manage your logged activities</p>
        </div>

        {Object.keys(groupedEntries).length === 0 ? (
          <Card className="bg-gradient-card border-0 shadow-card-eco">
            <CardContent className="pt-6 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground">No activities yet</h3>
              <p className="text-muted-foreground mb-4">Start tracking your carbon footprint by logging your first activity.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEntries)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([date, entries]) => {
                const dayTotal = entries.reduce((sum, entry) => {
                  return sum + (entry.co2e || 0);
                }, 0);

                return (
                  <Card key={date} className="bg-gradient-card border-0 shadow-card-eco">
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-5 w-5" />
                          {format(new Date(date), 'EEEE, MMMM d, yyyy')}
                        </div>
                        <div className="text-eco-green font-bold">
                          {dayTotal.toFixed(1)} kg CO₂e
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {entries
                          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                          .map((entry) => {
                            const activity = getActivityInfo(entry.activity_type_id) || entry.activity_types;
                            if (!activity) return null;

                            return (
                              <div 
                                key={entry.id}
                                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                              >
                                <div className="flex items-center gap-4">
                                  <span className="text-2xl">{activity.icon}</span>
                                  <div>
                                    <div className="font-medium">{activity.name}</div>
                                    <div className="text-sm text-muted-foreground">
                                      {entry.amount} {activity.unit}
                                    </div>
                                  </div>
                                </div>
                                
                                <div className="flex items-center gap-4">
                                  <div className="text-right">
                                    <div className="font-medium text-eco-green">
                                      {entry.co2e?.toFixed(2)} kg CO₂e
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                      {format(new Date(entry.created_at), 'h:mm a')}
                                    </div>
                                  </div>
                                  
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDelete(entry.id, activity.name)}
                                    className="text-destructive hover:text-destructive/80 hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}