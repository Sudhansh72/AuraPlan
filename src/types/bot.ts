import type { EventPlan } from './plan';

export type BotMode = "planner" | "budget" | "vendors" | "food" | "decor" | "timeline" | "culture";

export interface BotChatRequest {
  message: string;
  bot_mode: BotMode;
  event_context?: EventPlan | Record<string, unknown> | null;
  plan_id?: string | null;
  location?: string | null;
}

export interface VendorMatch {
  name: string;
  type: string;
  location: string;
  description: string;
  image_url?: string | null;
  estimated_price_range: string;
  review_snippet: string;
  sentiment_grade: "A" | "B" | "C" | "D" | "F";
  source_url?: string | null;
}

export interface ResourceImage {
  title: string;
  image_url: string;
  source_url?: string | null;
}

export interface BotChatResponse {
  bot_response: string;
  matched_vendors: VendorMatch[];
  resource_images: ResourceImage[];
  used_search: boolean;
  plan_update?: unknown;
  provider: string;
  bot_mode: BotMode;
  notes?: string | null;
}


