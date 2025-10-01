import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

// Updated types to match Supabase schema
export interface ActivityType {
  id: string;
  slug: string;
  name: string;
  unit: string;
  emission_factor: number; // Decimal value from DB
  icon: string;
  category: string; // Allow any string from database
}

export interface Entry {
  id: string;
  user_id: string;
  activity_type_id: string;
  amount: number;
  occurred_on: string; // ISO date string
  co2e: number;
  created_at: string;
  activity_types?: ActivityType; // Joined data
}

export interface DailySummary {
  date: string;
  totalCo2e: number;
  entries: Entry[];
}

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  totalCo2e: number;
  dailyBreakdown: DailySummary[];
  topCategories: Array<{
    category: string;
    co2e: number;
    percentage: number;
  }>;
}

export function useCarbonData() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [activityTypes, setActivityTypes] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isGuest } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [user, isGuest]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Always load activity types (they're public and needed for everyone)
      const { data: typesData, error: typesError } = await supabase
        .from('activity_types')
        .select('*')
        .order('name');
      
      if (typesError) throw typesError;
      setActivityTypes(typesData || []);

      // Load entries based on mode
      if (isGuest) {
        // Load guest entries from localStorage
        const guestEntries = localStorage.getItem('guestEntries');
        if (guestEntries) {
          try {
            setEntries(JSON.parse(guestEntries));
          } catch (e) {
            console.error('Error parsing guest entries:', e);
            setEntries([]);
          }
        } else {
          setEntries([]);
        }
      } else if (user) {
        // Load authenticated user entries from Supabase
        const { data: entriesData, error: entriesError } = await supabase
          .from('entries')
          .select(`
            *,
            activity_types!inner(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (entriesError) throw entriesError;
        setEntries(entriesData || []);
      } else {
        // Not logged in and not guest
        setEntries([]);
      }
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast({
        variant: "destructive",
        title: "Error loading data",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const addEntry = async (activityTypeId: string, amount: number, occurredOn: string) => {
    const activityType = activityTypes.find(at => at.id === activityTypeId);
    if (!activityType) return;

    // Handle guest mode
    if (isGuest) {
      const co2e = amount * activityType.emission_factor;
      const newEntry: Entry = {
        id: `guest-${Date.now()}`,
        user_id: 'guest',
        activity_type_id: activityTypeId,
        amount,
        occurred_on: occurredOn,
        co2e,
        created_at: new Date().toISOString(),
        activity_types: activityType
      };
      
      const updatedEntries = [newEntry, ...entries];
      setEntries(updatedEntries);
      localStorage.setItem('guestEntries', JSON.stringify(updatedEntries));
      
      toast({
        title: "Entry added (Guest Mode)",
        description: `Added ${activityType.name} activity. Sign up to save permanently.`,
      });
      return;
    }

    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please sign in to add entries.",
      });
      return;
    }

    try {
      const co2e = amount * activityType.emission_factor;
      
      const { data, error } = await supabase
        .from('entries')
        .insert([{
          user_id: user.id,
          activity_type_id: activityTypeId,
          amount,
          occurred_on: occurredOn,
          co2e
        }])
        .select(`
          *,
          activity_types!inner(*)
        `)
        .single();

      if (error) throw error;

      // Add to local state
      setEntries([data, ...entries]);
      
      toast({
        title: "Entry added",
        description: `Added ${activityType.name} activity.`,
      });
    } catch (error: any) {
      console.error('Error adding entry:', error);
      toast({
        variant: "destructive",
        title: "Error adding entry",
        description: error.message,
      });
    }
  };

  const deleteEntry = async (id: string) => {
    // Handle guest mode
    if (isGuest) {
      const updatedEntries = entries.filter(e => e.id !== id);
      setEntries(updatedEntries);
      localStorage.setItem('guestEntries', JSON.stringify(updatedEntries));
      
      toast({
        title: "Entry deleted",
        description: "Activity entry has been removed.",
      });
      return;
    }

    if (!user) return;

    try {
      const { error } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove from local state
      setEntries(entries.filter(e => e.id !== id));
      
      toast({
        title: "Entry deleted",
        description: "Activity entry has been removed.",
      });
    } catch (error: any) {
      console.error('Error deleting entry:', error);
      toast({
        variant: "destructive",
        title: "Error deleting entry",
        description: error.message,
      });
    }
  };

  const calculateCo2e = (entry: Entry): number => {
    return entry.co2e || 0;
  };

  const getDailySummary = (date: string): DailySummary => {
    const dayEntries = entries.filter(e => e.occurred_on === date);
    const totalCo2e = dayEntries.reduce((sum, entry) => sum + calculateCo2e(entry), 0);
    
    return {
      date,
      totalCo2e,
      entries: dayEntries
    };
  };

  const getWeeklySummary = (startDate: string): WeeklySummary => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    
    const weekEntries = entries.filter(entry => {
      const entryDate = new Date(entry.occurred_on);
      return entryDate >= new Date(startDate) && entryDate <= endDate;
    });

    const totalCo2e = weekEntries.reduce((sum, entry) => sum + calculateCo2e(entry), 0);

    // Calculate category breakdown
    const categoryTotals = new Map<string, number>();
    weekEntries.forEach(entry => {
      const activityType = entry.activity_types || activityTypes.find(at => at.id === entry.activity_type_id);
      if (activityType) {
        const current = categoryTotals.get(activityType.category) || 0;
        categoryTotals.set(activityType.category, current + calculateCo2e(entry));
      }
    });

    const topCategories = Array.from(categoryTotals.entries())
      .map(([category, co2e]) => ({
        category,
        co2e,
        percentage: totalCo2e > 0 ? (co2e / totalCo2e) * 100 : 0
      }))
      .sort((a, b) => b.co2e - a.co2e);

    // Generate daily breakdown
    const dailyBreakdown: DailySummary[] = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateString = date.toISOString().split('T')[0];
      dailyBreakdown.push(getDailySummary(dateString));
    }

    return {
      startDate,
      endDate: endDate.toISOString().split('T')[0],
      totalCo2e,
      dailyBreakdown,
      topCategories
    };
  };

  const getRecentEntries = (limit = 10): Entry[] => {
    return entries
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  };

  const getTotalCarbonFootprint = (): number => {
    return entries.reduce((total, entry) => total + (entry.co2e || 0), 0);
  };

  const getEntriesByDateRange = (startDate: string, endDate: string): Entry[] => {
    return entries.filter(entry => {
      return entry.occurred_on >= startDate && entry.occurred_on <= endDate;
    });
  };

  return {
    entries,
    loading,
    addEntry,
    deleteEntry,
    getDailySummary,
    getWeeklySummary,
    getRecentEntries,
    getTotalCarbonFootprint,
    getEntriesByDateRange,
    activityTypes
  };
}