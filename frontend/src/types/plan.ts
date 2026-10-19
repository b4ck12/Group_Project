/**
 * TypeScript interfaces for Plan, PlanStop & Vote APIs.
 * Mirrors backend Pydantic schemas: schemas/plan.py, schemas/vote.py
 * Endpoints: api-design-guide.md Section 2 & 3 — /api/v1/events/{eventId}/plans, votes
 */

import type { BackupOption, RoadmapTheme } from './consensus.ts';

// --- Enums ---
export type PlanStatus = 'DRAFT' | 'VOTING' | 'CONFIRMED' | 'ARCHIVED';

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
  total_budget?: string | null;
  is_ai_generated?: boolean;
  macro_roadmap?: RoadmapTheme[] | null;
}

export interface PlanUpdateRequest {
  title?: string;
  total_budget?: string | null;
  status?: PlanStatus;
  macro_roadmap?: RoadmapTheme[] | null;
}

export interface PlanStopCreateRequest {
  day_number?: number;
  time_slot?: TimeSlot | null;
  order: number;
  place_name: string;
  place_ref_id?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  estimated_cost?: string | null;
  category?: StopCategory | null;
  start_time?: string | null;
  duration_minutes?: number | null;
  metadata?: Record<string, unknown> | null;
  backup_options?: BackupOption[] | null;
}

export interface PlanStopUpdateRequest {
  day_number?: number;
  time_slot?: TimeSlot | null;
  order?: number;
  place_name?: string;
  place_ref_id?: string | null;
  lat?: number | null;
  lng?: number | null;
  note?: string | null;
  estimated_cost?: string | null;
  category?: StopCategory | null;
  start_time?: string | null;
  duration_minutes?: number | null;
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
  time_slot: TimeSlot | null;
  place_name: string;
  place_ref_id: string | null;
  lat: number | null;
  lng: number | null;
  note: string | null;
  estimated_cost: string | null; // Decimal serialized as string
  category: StopCategory | null;
  start_time: string | null;
  duration_minutes: number | null;
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
