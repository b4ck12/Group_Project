/**
 * TypeScript interfaces for Chat APIs.
 * Mirrors backend Pydantic schemas: schemas/chat.py
 * Endpoints: api-design-guide.md Section 2 — /api/v1/events/{id}/chat
 */

export type ChatRole = 'USER' | 'AI' | 'SYSTEM';

export interface ChatMessageCreateRequest {
  content: string;
  role?: ChatRole;
}

export interface ChatMessageResponse {
  id: string;
  event_id: string;
  user_id: string | null;
  role: ChatRole;
  content: string;
  created_at: string;
}
