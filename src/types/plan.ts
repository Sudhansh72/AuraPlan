export interface PlannerFormData {
  eventType: string;
  location: string;
  date: string;
  time: string;
  guestCount: string;
  budget: string;
  theme: string;
  culturalPreference: string;
  dietaryConstraints: string;
  specialNotes: string;
}

export interface EventRequest {
  event_type: string;
  location: string;
  date: string;
  time: string;
  guest_count: number;
  budget: number;
  theme_preference?: string;
  age_group?: string;
  cultural_preference?: string;
  dietary_constraints?: string;
  special_notes?: string;
}

export interface ThemeSummary {
  title: string;
  description: string;
  vibe: string;
  location: string;
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  icon?: string;
}

export interface BudgetItem {
  item: string;
  category: string;
  estimated_cost: number;
  notes: string;
}

export interface Recommendation {
  type: string;
  title: string;
  description: string;
  location?: string | null;
  estimated_price?: string | null;
  rating?: "A" | "B" | "C" | "D" | "F" | string | null;
  review_snippet?: string | null;
  source_url?: string | null;
  image_url?: string | null;
  specialties?: string[] | null;
}

export interface EventPlan {
  theme_summary: ThemeSummary;
  itinerary: ItineraryItem[];
  budget_matrix: BudgetItem[];
  recommendations: Recommendation[];
  total_estimated_cost: number;
  generated_for: string;
  guest_count: number;
  budget_target: number;
  notes: string;
  blueprint_url?: string | null;
}

// Auth Types
export interface User {
  id: string;
  email: string;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

// History Types
export interface EventHistoryItem {
  id: string;
  event_type: string;
  location: string;
  date: string;
  time: string;
  guest_count: number;
  budget: number;
  generated_plan_json: EventPlan;
  created_at: string;
}
