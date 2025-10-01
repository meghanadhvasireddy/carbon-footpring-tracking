-- Create activity_types table with predefined emission factors
CREATE TABLE public.activity_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  unit TEXT NOT NULL,
  emission_factor DECIMAL(10,4) NOT NULL, -- kg CO2e per unit
  icon TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('transport', 'energy', 'food', 'other')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entries table for carbon footprint tracking
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  activity_type_id UUID NOT NULL REFERENCES public.activity_types(id) ON DELETE RESTRICT,
  amount DECIMAL(10,2) NOT NULL,
  occurred_on DATE NOT NULL,
  co2e DECIMAL(10,4) NOT NULL, -- calculated CO2e value
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- RLS Policies for entries
CREATE POLICY "Users can view their own entries" 
ON public.entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own entries" 
ON public.entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own entries" 
ON public.entries FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own entries" 
ON public.entries FOR DELETE 
USING (auth.uid() = user_id);

-- Activity types are public readable
CREATE POLICY "Activity types are viewable by everyone" 
ON public.activity_types FOR SELECT 
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entries_updated_at
  BEFORE UPDATE ON public.entries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, avatar_url)
  VALUES (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert predefined activity types
INSERT INTO public.activity_types (slug, name, unit, emission_factor, icon, category) VALUES
('car_miles', 'Car Travel', 'miles', 0.25, '🚗', 'transport'),
('electricity_kwh', 'Electricity', 'kWh', 0.42, '⚡', 'energy'),
('beef_meal', 'Beef Meal', 'meals', 6.0, '🥩', 'food'),
('chicken_meal', 'Chicken Meal', 'meals', 1.5, '🍗', 'food'),
('vegetarian_meal', 'Vegetarian Meal', 'meals', 0.4, '🥗', 'food'),
('public_transport', 'Public Transport', 'miles', 0.05, '🚌', 'transport'),
('flight_miles', 'Flight', 'miles', 0.31, '✈️', 'transport'),
('natural_gas', 'Natural Gas', 'therms', 5.3, '🔥', 'energy');