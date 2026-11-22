import { http, HttpResponse } from 'msw';
import type {
  ChatMessageCreateRequest,
  ChatMessageListResponse,
  ChatMessageResponse,
} from '../../types/chat.ts';

/**
 * MSW Mock Handlers for Group Room Chat APIs.
 * Endpoints follow api-design-guide.md Section 2 & 3.5.2.
 * Supports CHAT, AGENT_QA, AGENT_TRIGGER, and SYSTEM message routing.
 */

const mockMessages: ChatMessageResponse[] = [
  {
    id: 'msg_001',
    event_id: 'evt_001',
    user_id: 'usr_001',
    role: 'USER',
    message_type: 'CHAT',
    content: 'Chào cả nhóm, chúng mình cùng chốt lịch trình Đà Lạt nhé!',
    metadata: null,
    created_at: '2026-11-20T10:00:00Z',
  },
  {
    id: 'msg_002',
    event_id: 'evt_001',
    user_id: null,
    role: 'AI',
    message_type: 'AGENT_QA',
    content:
      'Quán Bếp Cuốn có menu chay riêng với gỏi cuốn rau củ nấm và bánh xèo chay rất phù hợp cho nhóm nhé!',
    metadata: { intent: 'dish_qa', target_stop_id: 'stop_002' },
    created_at: '2026-11-20T10:01:00Z',
  },
];

export const chatHandlers = [
  // GET /api/v1/events/:eventId/chat
  http.get('/api/v1/events/:eventId/chat', ({ params, request }) => {
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get('limit') ?? '50');
    const limit = Number.isFinite(limitParam) && limitParam > 0 ? limitParam : 50;

    const allEventMessages = mockMessages.filter((m) => m.event_id === params.eventId);
    const sliced = allEventMessages.slice(-limit);

    const payload: ChatMessageListResponse = {
      messages: sliced,
      total: allEventMessages.length,
      has_more: allEventMessages.length > sliced.length,
    };

    return HttpResponse.json({ success: true, data: payload }, { status: 200 });
  }),

  // POST /api/v1/events/:eventId/chat
  http.post('/api/v1/events/:eventId/chat', async ({ params, request }) => {
    const body = (await request.json()) as ChatMessageCreateRequest;

    const newMessage: ChatMessageResponse = {
      id: `msg_${Date.now()}`,
      event_id: params.eventId as string,
      user_id: 'usr_001',
      role: body.role ?? 'USER',
      message_type: body.message_type ?? 'CHAT',
      content: body.content,
      metadata: body.metadata ?? null,
      created_at: new Date().toISOString(),
    };

    mockMessages.push(newMessage);

    return HttpResponse.json({ success: true, data: newMessage }, { status: 201 });
  }),
];
