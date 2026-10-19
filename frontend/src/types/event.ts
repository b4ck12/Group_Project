/**
 * TypeScript interfaces for Event & Invitation APIs.
 * Mirrors backend Pydantic schemas: schemas/event.py, schemas/invitation.py
 * Endpoints: api-design-guide.md Section 2 & 3 — /api/v1/events, /api/v1/invitations
 */

// --- Enums ---
export type EventType =
  | 'TRAVEL'
  | 'DINING'
  | 'HANGOUT'
  | 'ENTERTAINMENT'
  | 'SIGHTSEEING'
  | 'CUSTOM';

export type EventScope = 'DAY_HANGOUT' | 'VACATION';

export type BudgetTier = 'BUDGET' | 'MODERATE' | 'LUXURY';

export type EventRole = 'HOST' | 'OWNER' | 'MEMBER' | 'VIEWER';

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'EXPIRED';

// --- Requests ---
export interface EventCreateRequest {
  name: string;
  description?: string | null;
  type?: EventType;
  scope?: EventScope;
  location?: string | null;
  destination?: string | null;
  budget_tier?: BudgetTier | null;
  start_date: string; // ISO 8601
  end_date: string;
}

export interface EventUpdateRequest {
  name?: string;
  description?: string | null;
  type?: EventType;
  scope?: EventScope;
  location?: string | null;
  destination?: string | null;
  budget_tier?: BudgetTier | null;
  start_date?: string;
  end_date?: string;
  macro_locked?: boolean;
  final_locked?: boolean;
}

export interface InvitationCreateRequest {
  email?: string | null;
  invited_user_id?: string | null;
}

export interface InvitationUpdateRequest {
  status: InvitationStatus;
}

// --- Responses ---
export interface EventResponse {
  id: string;
  name: string;
  description: string | null;
  type: EventType;
  scope: EventScope;
  location: string | null;
  destination: string | null;
  budget_tier: BudgetTier | null;
  start_date: string;
  end_date: string;
  macro_locked: boolean;
  final_locked: boolean;
  created_by?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface EventMemberResponse {
  id: string;
  event_id: string;
  user_id: string;
  role: EventRole;
  joined_at?: string;
}

export interface InvitationResponse {
  id: string;
  event_id: string;
  email: string | null;
  invited_by: string;
  invited_user_id: string | null;
  status: InvitationStatus;
  created_at: string;
  expires_at: string | null;
}
