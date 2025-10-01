import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Leaf, BarChart3, Target, Plus, User, History, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCarbonData } from '@/hooks/useCarbonData';

// Import new components
import { AppNavigation } from '@/components/Navigation/AppNavigation';
import { AnalyticsDashboard } from '@/components/Dashboard/AnalyticsDashboard';
import { GoalsManager } from '@/components/Goals/GoalsManager';
import { UserProfile } from '@/components/Profile/UserProfile';
import { ActivityForm } from '@/components/ActivityForm';
import { ActivityHistory } from '@/components/ActivityHistory';
import { Dashboard } from '@/components/Dashboard';

export function CarbonTracker() {
  const { user, isGuest, loading, signOut } = useAuth();
  const { getRecentEntries } = useCarbonData();
  const [currentView, setCurrentView] = useState('dashboard');
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user && !isGuest) {
      navigate('/auth');
    }
  }, [user, isGuest, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-earth">
        <div className="text-center">
          <Leaf className="h-12 w-12 mx-auto mb-4 text-eco-green animate-pulse" />
          <p className="text-muted-foreground">Loading your carbon tracker...</p>
        </div>
      </div>
    );
  }

  if (!user && !isGuest) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-earth p-4">
        <Card className="w-full max-w-md bg-gradient-card border-0 shadow-card-eco">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Leaf className="h-8 w-8 text-eco-green" />
              <CardTitle className="text-2xl font-bold">Carbon Tracker</CardTitle>
            </div>
            <CardDescription>
              Track your environmental impact and make a difference
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-center text-muted-foreground">
              Please sign in to access your carbon tracking dashboard.
            </p>
            <Button 
              className="w-full" 
              onClick={() => navigate('/auth')}
            >
              Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const recentActivitiesCount = getRecentEntries(7).length;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'goals':
        return <GoalsManager />;
      case 'profile':
        return <UserProfile />;
      case 'add-activity':
        return (
          <div className="max-w-2xl mx-auto">
            <ActivityForm onBack={() => setCurrentView('dashboard')} />
          </div>
        );
      case 'history':
        return <ActivityHistory onBack={() => setCurrentView('dashboard')} />;
      case 'dashboard':
      default:
        return <Dashboard onAddActivity={() => setCurrentView('add-activity')} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Leaf className="h-8 w-8 text-eco-green" />
              <h1 className="text-2xl font-bold text-foreground">Carbon Tracker</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {isGuest ? (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    Guest Mode
                  </span>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => {
                      signOut();
                      navigate('/auth');
                    }}
                  >
                    Sign Up
                  </Button>
                </>
              ) : (
                <>
                  <span className="text-sm text-muted-foreground hidden sm:block">
                    Welcome, {user?.email?.split('@')[0]}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={signOut}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="sr-only sm:not-sr-only sm:ml-2">Sign Out</span>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <div className="border-b border-border/50 bg-background/60 backdrop-blur-sm sticky top-[73px] z-40">
        <div className="container mx-auto px-4 py-4">
          <AppNavigation 
            currentView={currentView}
            onViewChange={setCurrentView}
            recentActivitiesCount={recentActivitiesCount}
          />
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {renderCurrentView()}
      </main>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p className="flex items-center justify-center gap-2">
              <Leaf className="h-4 w-4 text-eco-green" />
              Track your impact, make a difference
            </p>
            <p className="text-sm mt-2">
              Every action counts towards a sustainable future 🌱
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}