/**
 * TypeScript interfaces for Chat APIs.
 * Mirrors backend Pydantic schemas: schemas/chat.py
 * Endpoints: api-design-guide.md Section 2 — /api/v1/events/{id}/chat
 */

export type ChatRole = 'USER' | 'AI' | 'SYSTEM';

export type ChatMessageType = 'CHAT' | 'AGENT_QA' | 'AGENT_TRIGGER' | 'SYSTEM';

export interface ChatMessageCreateRequest {
  content: string;
  role?: ChatRole;
  message_type?: ChatMessageType;
  metadata?: Record<string, unknown> | null;
}

export interface ChatMessageResponse {
  id: string;
  event_id: string;
  user_id: string | null;
  role: ChatRole;
  message_type?: ChatMessageType;
  content: string;
  metadata?: Record<string, unknown> | null;
  created_at: string;
}

export interface ChatMessageListResponse {
  messages: ChatMessageResponse[];
  total: number;
  has_more: boolean;
}
