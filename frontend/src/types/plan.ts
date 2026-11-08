/**
 * TypeScript interfaces for Plan, PlanStop & Vote APIs.
 * Mirrors backend Pydantic schemas: schemas/plan.py, schemas/vote.py
 * Endpoints: api-design-guide.md Section 2 & 3 — /api/v1/events/{eventId}/plans, votes
 */

import type { BackupOption, RoadmapTheme } from './consensus.ts';

// --- Enums ---
export type PlanStatus =
  | 'INITIAL'
  | 'DRAFT'
  | 'VOTING'
  | 'FINALIZED'
  | 'CONFIRMED'
  | 'ONGOING'
  | 'COMPLETED'
  | 'ARCHIVED';

export type StopStatus =
  | 'INITIAL_PROPOSED'
  | 'VOTING_OPEN'
  | 'SELECTED_AFTER_VOTE'
  | 'REJECTED_IN_VOTE'
  | 'FINALIZED_LOCKED'
  | 'ONGOING_ACTIVE'
  | 'ADAPTED_ON_TRIP'
  | 'SKIPPED_ON_TRIP'
  | 'COMPLETED';

export type TransportMode =
  | 'WALKING'
  | 'MOTORBIKE'
  | 'TAXI_GRAB'
  | 'CAR'
  | 'BUS'
  | 'TRAIN'
  | 'FLIGHT'
  | 'BOAT'
  | 'OTHER';

export type TimeSlot = 'MORNING' | 'AFTERNOON' | 'EVENING';

export type StopCategory =
  | 'ATTRACTION'
  | 'RESTAURANT'
  | 'CAFE'
  | 'HOTEL'
  | 'ENTERTAINMENT'
  | 'TRANSPORT'
  | 'SHOPPING'
  | 'OTHER';

export type VoteValue = 'UP' | 'DOWN' | 'NEUTRAL';

// --- Requests ---
export interface PlanCreateRequest {
  title: string;
  version_number?: number;
  total_budget?: string | null;
  parent_plan_id?: string | null;
  is_active?: boolean;
  change_summary?: string | null;
  is_ai_generated?: boolean;
  macro_roadmap?: RoadmapTheme[] | null;
}

export interface PlanUpdateRequest {
  title?: string;
  version_number?: number;
  total_budget?: string | null;
  parent_plan_id?: string | null;
  is_active?: boolean;
  change_summary?: string | null;
  status?: PlanStatus;
  macro_roadmap?: RoadmapTheme[] | null;
}

export interface PlanStopCreateRequest {
  day_number?: number;
  stop_date?: string | null;
  time_slot?: TimeSlot | null;
  order: number;
  place_name: string;
  place_ref_id?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  estimated_cost?: string | null;
  category?: StopCategory | null;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  transport_mode?: TransportMode | null;
  transit_duration_minutes?: number | null;
  transit_distance_km?: number | null;
  transit_cost?: string | null;
  stop_status?: StopStatus;
  is_initial_stop?: boolean;
  is_finalized_stop?: boolean;
  replaced_by_stop_id?: string | null;
  change_reason?: string | null;
  locked_at?: string | null;
  metadata?: Record<string, unknown> | null;
  backup_options?: BackupOption[] | null;
}

export interface PlanStopUpdateRequest {
  day_number?: number;
  stop_date?: string | null;
  time_slot?: TimeSlot | null;
  order?: number;
  place_name?: string;
  place_ref_id?: string | null;
  address?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  estimated_cost?: string | null;
  category?: StopCategory | null;
  start_time?: string | null;
  end_time?: string | null;
  duration_minutes?: number | null;
  transport_mode?: TransportMode | null;
  transit_duration_minutes?: number | null;
  transit_distance_km?: number | null;
  transit_cost?: string | null;
  stop_status?: StopStatus;
  is_initial_stop?: boolean;
  is_finalized_stop?: boolean;
  replaced_by_stop_id?: string | null;
  change_reason?: string | null;
  locked_at?: string | null;
  metadata?: Record<string, unknown> | null;
  backup_options?: BackupOption[] | null;
}

export interface PlanVoteCreateRequest {
  stop_id?: string;
  value: VoteValue;
  comment?: string | null;
}

// --- Plan Stop Response ---
export interface PlanStopResponse {
  id: string;
  plan_id: string;
  order: number;
  order_index?: number;
  day_number: number;
  stop_date?: string | null;
  time_slot: TimeSlot | null;
  place_name: string;
  place_ref_id: string | null;
  address?: string | null;
  lat: number | null;
  lng: number | null;
  note: string | null;
  estimated_cost: string | null; // Decimal serialized as string
  category: StopCategory | null;
  start_time: string | null;
  end_time?: string | null;
  duration_minutes: number | null;
  transport_mode?: TransportMode | null;
  transit_duration_minutes?: number | null;
  transit_distance_km?: number | null;
  transit_cost?: string | null;
  stop_status?: StopStatus;
  is_initial_stop?: boolean;
  is_finalized_stop?: boolean;
  replaced_by_stop_id?: string | null;
  change_reason?: string | null;
  locked_at?: string | null;
  metadata: Record<string, unknown> | null;
  up_votes: number;
  down_votes: number;
  backup_options?: BackupOption[] | null;
}

// --- Plan Response ---
export interface PlanResponse {
  id: string;
  event_id: string;
  title: string;
  version_number?: number;
  parent_plan_id?: string | null;
  is_active?: boolean;
  change_summary?: string | null;
  locked_at?: string | null;
  total_budget: string | null; // Decimal serialized as string
  status: PlanStatus;
  is_ai_generated: boolean;
  macro_roadmap?: RoadmapTheme[] | null;
  created_by_id: string | null;
  created_at: string;
  stops: PlanStopResponse[];
  macro_locked?: boolean;
  final_locked?: boolean;
}

export interface PlanStatusTransitionRequest {
  status: PlanStatus;
  change_summary?: string | null;
}

export interface PlanStageHistoryResponse {
  plan_id: string;
  event_id: string;
  version_number: number;
  current_status: PlanStatus;
  initial_stops: PlanStopResponse[];
  finalized_stops: PlanStopResponse[];
  ongoing_stops: PlanStopResponse[];
  rejected_or_skipped_stops: PlanStopResponse[];
}

// --- Vote Response ---
export interface PlanVoteResponse {
  id: string;
  stop_id: string;
  plan_id?: string;
  user_id: string;
  value: VoteValue;
  comment: string | null;
  created_at: string;
}
