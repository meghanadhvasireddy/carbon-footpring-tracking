import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Target, 
  History, 
  Plus, 
  User, 
  Home,
  Settings
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AppNavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  recentActivitiesCount?: number;
}

export function AppNavigation({ 
  currentView, 
  onViewChange, 
  recentActivitiesCount = 0 
}: AppNavigationProps) {
  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      description: 'Overview and stats'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      description: 'Detailed insights'
    },
    {
      id: 'add-activity',
      label: 'Add Activity',
      icon: Plus,
      description: 'Log new activity'
    },
    {
      id: 'goals',
      label: 'Goals',
      icon: Target,
      description: 'Set and track targets'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      description: 'Activity history',
      badge: recentActivitiesCount > 0 ? recentActivitiesCount.toString() : undefined
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      description: 'Account settings'
    }
  ];

  return (
    <nav className="w-full">
      {/* Mobile Navigation - Horizontal Scroll */}
      <div className="md:hidden">
        <div className="flex gap-2 overflow-x-auto pb-2 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onViewChange(item.id)}
                className={`min-w-fit flex items-center gap-2 ${
                  isActive 
                    ? 'bg-eco-green text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge && (
                  <Badge variant="secondary" className="ml-1 h-5 w-5 text-xs p-0 flex items-center justify-center">
                    {item.badge}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Desktop Navigation - Grid */}
      <div className="hidden md:block">
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                onClick={() => onViewChange(item.id)}
                className={`h-auto p-4 flex flex-col items-center gap-2 ${
                  isActive 
                    ? 'bg-eco-green text-primary-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <div className="relative">
                  <Icon className="h-6 w-6" />
                  {item.badge && (
                    <Badge 
                      variant="secondary" 
                      className="absolute -top-2 -right-2 h-5 w-5 text-xs p-0 flex items-center justify-center"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </div>
                <div className="text-center">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs opacity-70">{item.description}</div>
                </div>
              </Button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}