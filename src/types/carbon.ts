export interface ActivityType {
  id: string;
  slug: string;
  name: string;
  unit: string;
  emissionFactor: number; // kg CO2e per unit
  icon: string;
  category: 'transport' | 'energy' | 'food' | 'other';
}

export interface Entry {
  id: string;
  userId: string;
  activityTypeId: string;
  amount: number;
  occurredOn: string; // ISO date string
  createdAt: string;
  co2e?: number; // calculated field
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

export const ACTIVITY_TYPES: ActivityType[] = [
  {
    id: '1',
    slug: 'car_miles',
    name: 'Car Travel',
    unit: 'miles',
    emissionFactor: 0.25,
    icon: '🚗',
    category: 'transport'
  },
  {
    id: '2',
    slug: 'electricity_kwh',
    name: 'Electricity',
    unit: 'kWh',
    emissionFactor: 0.42,
    icon: '⚡',
    category: 'energy'
  },
  {
    id: '3',
    slug: 'beef_meal',
    name: 'Beef Meal',
    unit: 'meals',
    emissionFactor: 6.0,
    icon: '🥩',
    category: 'food'
  },
  {
    id: '4',
    slug: 'chicken_meal',
    name: 'Chicken Meal',
    unit: 'meals',
    emissionFactor: 1.5,
    icon: '🍗',
    category: 'food'
  },
  {
    id: '5',
    slug: 'vegetarian_meal',
    name: 'Vegetarian Meal',
    unit: 'meals',
    emissionFactor: 0.4,
    icon: '🥗',
    category: 'food'
  },
  {
    id: '6',
    slug: 'public_transport',
    name: 'Public Transport',
    unit: 'miles',
    emissionFactor: 0.05,
    icon: '🚌',
    category: 'transport'
  },
  {
    id: '7',
    slug: 'flight_miles',
    name: 'Flight',
    unit: 'miles',
    emissionFactor: 0.31,
    icon: '✈️',
    category: 'transport'
  },
  {
    id: '8',
    slug: 'natural_gas',
    name: 'Natural Gas',
    unit: 'therms',
    emissionFactor: 5.3,
    icon: '🔥',
    category: 'energy'
  }
];