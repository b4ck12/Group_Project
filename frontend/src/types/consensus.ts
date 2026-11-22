/**
 * TypeScript interfaces for Two-Stage Consensus and Living Itinerary APIs.
 * Follows api-design-guide.md Section 2, 3 and database-schema.md.
 */

import type { StopCategory, StopStatus } from './plan.ts';

export const DEFAULT_INITIAL_BACKUP_OPTIONS = 2;
export const MAX_BACKUP_OPTIONS = DEFAULT_INITIAL_BACKUP_OPTIONS;

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

export interface CandidateOption {
  candidate_id: string;
  place_name: string;
  place_ref_id: string;
  category: StopCategory;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  estimated_cost?: number;
  distance_km?: number | null;
  image_url?: string | null;
  description?: string | null;
  matched_desire?: Record<string, string> | null;
  is_indoor_backup?: boolean;
}

export interface CandidateVoteSummary {
  candidate_id: string;
  place_name: string;
  votes_count: number;
  voters: string[];
}

export interface BackupOption {
  option_index: number;
  place_name: string;
  place_ref_id: string;
  category: StopCategory;
  estimated_cost: number;
  distance_km: number;
}

export interface StopVoteRequest {
  candidate_id: string;
  comment?: string | null;
}

export interface StopVoteResponse {
  stop_id: string;
  selected_candidate_id: string | null;
  quorum_reached: boolean;
  stop_status: StopStatus;
  next_unlocked_stop_id: string | null;
  candidates: CandidateVoteSummary[];
}

export interface StopSwapRequest {
  target_backup_place_ref_id?: string | null;
  cycle_next?: boolean;
  change_reason?: string | null;
}

export interface StopSwapResponse {
  previous_stop_id: string;
  new_stop_id: string;
  new_place_name: string;
  selected_option_index: number;
  category: StopCategory;
  lat: number;
  lng: number;
  stop_status: StopStatus;
  replaced_by_stop_id: string;
  updated_at: string;
}

export interface FetchMoreBackupsRequest {
  clarification_notes?: string | null;
  dietary_filter?: string | null;
  exclude_place_ref_ids?: string[];
}

export interface FetchMoreBackupsResponse {
  stop_id: string;
  backup_options: BackupOption[];
  needs_clarification: boolean;
  clarification_question: string | null;
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
  new_place_name: string;
  new_place_ref_id: string;
  change_reason: string;
}

export interface StopAdaptationResponse {
  previous_stop_id: string;
  new_stop_id: string;
  new_place_name: string;
  new_place_ref_id: string;
  stop_status: StopStatus;
  replaced_by_stop_id: string;
  change_reason: string;
  cloned_plan_id?: string | null;
  updated_at: string;
}
