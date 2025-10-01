import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Leaf, Settings, Save, Edit2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCarbonData } from '@/hooks/useCarbonData';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface UserProfile {
  display_name: string;
  avatar_url: string;
  bio?: string;
  location?: string;
  joined_date?: string;
}

export function UserProfile() {
  const { user, signOut } = useAuth();
  const { getTotalCarbonFootprint, getRecentEntries } = useCarbonData();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile>({
    display_name: '',
    avatar_url: '',
    bio: '',
    location: ''
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile({
          display_name: data.display_name || '',
          avatar_url: data.avatar_url || '',
          bio: data.bio || '',
          location: data.location || '',
          joined_date: data.created_at
        });
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          display_name: profile.display_name,
          avatar_url: profile.avatar_url,
          bio: profile.bio,
          location: profile.location,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: "Profile updated!",
        description: "Your profile information has been saved.",
      });
      
      setIsEditing(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error updating profile",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate user stats
  const totalCarbon = getTotalCarbonFootprint();
  const recentEntries = getRecentEntries(30);
  const totalEntries = recentEntries.length;
  const averageDaily = totalEntries > 0 ? totalCarbon / totalEntries : 0;
  
  // Calculate streak (consecutive days with entries)
  const today = new Date();
  let streak = 0;
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - i);
    const dateStr = checkDate.toISOString().split('T')[0];
    
    const hasEntry = recentEntries.some(entry => entry.occurred_on === dateStr);
    if (hasEntry) {
      streak++;
    } else {
      break;
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-48 bg-muted animate-pulse rounded-lg" />
        <div className="h-96 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="bg-gradient-card border-0 shadow-card-eco">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url} />
              <AvatarFallback className="text-lg bg-eco-light text-eco-dark">
                {getInitials(profile.display_name || user?.email?.split('@')[0] || 'U')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">
                  {profile.display_name || user?.email?.split('@')[0] || 'User'}
                </h1>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Edit2 className="h-4 w-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </div>
              
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>{user?.email}</span>
              </div>
              
              {profile.location && (
                <p className="text-muted-foreground">📍 {profile.location}</p>
              )}
              
              {profile.bio && (
                <p className="text-foreground">{profile.bio}</p>
              )}
              
              {profile.joined_date && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatDate(profile.joined_date)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      {isEditing && (
        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>
              Update your profile information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name</Label>
                <Input
                  id="display-name"
                  value={profile.display_name}
                  onChange={(e) => setProfile({ ...profile, display_name: e.target.value })}
                  placeholder="Your display name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location || ''}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  placeholder="City, Country"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="avatar-url">Avatar URL</Label>
              <Input
                id="avatar-url"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="https://example.com/avatar.jpg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio || ''}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={updateProfile} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-eco-green" />
              <div>
                <p className="text-2xl font-bold text-eco-green">
                  {totalCarbon.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total kg CO₂e tracked
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-eco-green" />
              <div>
                <p className="text-2xl font-bold text-eco-green">
                  {streak}
                </p>
                <p className="text-sm text-muted-foreground">
                  Day tracking streak
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-eco-green" />
              <div>
                <p className="text-2xl font-bold text-eco-green">
                  {totalEntries}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total activities logged
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-0 shadow-card-eco">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-eco-green" />
              <div>
                <p className="text-2xl font-bold text-eco-green">
                  {averageDaily.toFixed(1)}
                </p>
                <p className="text-sm text-muted-foreground">
                  Avg daily emissions
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Account Actions */}
      <Card className="bg-gradient-card border-0 shadow-card-eco">
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>
            Manage your account preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-border rounded-lg">
              <div>
                <h4 className="font-medium">Account Data</h4>
                <p className="text-sm text-muted-foreground">
                  Export your carbon tracking data
                </p>
              </div>
              <Button variant="outline" size="sm">
                Export Data
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-destructive/20 rounded-lg">
              <div>
                <h4 className="font-medium">Sign Out</h4>
                <p className="text-sm text-muted-foreground">
                  Sign out of your account
                </p>
              </div>
              <Button 
                variant="destructive" 
                size="sm"
                onClick={signOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}