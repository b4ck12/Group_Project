import { http, HttpResponse } from 'msw';
import type { ChatMessageResponse, ChatMessageCreateRequest } from '../../types/chat.ts';

/**
 * MSW Mock Handlers for Room Chat APIs.
 * Endpoints follow api-design-guide.md Section 2.
 * Response format follows api-design-guide.md Section 4.
 */

const mockMessages: ChatMessageResponse[] = [
  {
    id: 'msg_001',
    event_id: 'evt_001',
    user_id: 'usr_001',
    role: 'USER',
    content: 'Chào cả nhóm, chúng mình cùng chốt lịch trình Đà Lạt nhé!',
    created_at: '2024-12-05T10:00:00Z',
  },
  {
    id: 'msg_002',
    event_id: 'evt_001',
    user_id: null,
    role: 'AI',
    content: 'TripMate AI đã phân tích sở thích và chuẩn bị xong khung lộ trình vĩ mô 3 ngày. Host có thể bấm Khóa Lộ Trình Vĩ Mô khi mọi người sẵn sàng.',
    created_at: '2024-12-05T10:01:00Z',
  },
];

export const chatHandlers = [
  // GET /api/v1/events/:eventId/chat
  http.get('/api/v1/events/:eventId/chat', ({ params }) => {
    const messages = mockMessages.filter((m) => m.event_id === params.eventId);

    return HttpResponse.json(
      {
        success: true,
        data: messages,
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/chat
  http.post('/api/v1/events/:eventId/chat', async ({ params, request }) => {
    const body = (await request.json()) as ChatMessageCreateRequest;

    const newMessage: ChatMessageResponse = {
      id: `msg_${Date.now()}`,
      event_id: params.eventId as string,
      user_id: 'usr_001',
      role: body.role ?? 'USER',
      content: body.content,
      created_at: new Date().toISOString(),
    };

    mockMessages.push(newMessage);

    return HttpResponse.json(
      {
        success: true,
        data: newMessage,
      },
      { status: 201 },
    );
  }),
];
