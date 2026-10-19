/**
 * TypeScript interfaces for Two-Stage Consensus and Living Itinerary APIs.
 * Follows api-design-guide.md Section 2, 3 and database-schema.md.
 */

import type { StopCategory, VoteValue } from './plan.ts';

export const MAX_BACKUP_OPTIONS = 2;

export interface RoadmapTheme {
  day: number;
  theme: string;
}

export interface MacroLockRequest {
  macro_locked?: boolean;
}

export interface MacroLockResponse {
  event_id: string;
  macro_locked: boolean;
  locked_at: string;
  roadmap_themes: RoadmapTheme[];
}

export interface BackupOption {
  place_name: string;
  place_ref_id: string;
  category: StopCategory;
  estimated_cost: number;
  distance_km: number;
}

export interface StopVoteRequest {
  vote_value: VoteValue;
  comment?: string | null;
}

export interface StopVoteResponse {
  stop_id: string;
  up_votes: number;
  down_votes: number;
  recommend_swap: boolean;
  backup_options: BackupOption[];
}

export interface StopSwapRequest {
  target_backup_place_ref_id: string;
}

export interface StopSwapResponse {
  swapped_stop_id: string;
  new_place_name: string;
  category: StopCategory;
  lat: number;
  lng: number;
  updated_at: string;
}

export interface FinalLockRequest {
  final_locked?: boolean;
}

export interface FinalLockResponse {
  event_id: string;
  final_locked: boolean;
  locked_at: string;
  total_stops: number;
  total_budget: string;
}

export interface StopAdaptationRequest {
  place_name: string;
  place_ref_id: string;
  note?: string | null;
}

export interface StopAdaptationResponse {
  stop_id: string;
  place_name: string;
  place_ref_id: string;
  note: string;
  updated_at: string;
}
