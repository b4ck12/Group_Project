import { http, HttpResponse } from 'msw';
import type {
  PlanResponse,
  PlanStopResponse,
  PlanVoteResponse,
  PlanCreateRequest,
  PlanUpdateRequest,
  PlanStopCreateRequest,
  PlanVoteCreateRequest,
  PlanStatus,
} from '../../types/plan.ts';

/**
 * MSW Mock Handlers for Plan, PlanStop & Vote APIs.
 * Endpoints follow api-design-guide.md Section 2 & 3.
 * Response format follows api-design-guide.md Section 4.
 */

const mockStops: PlanStopResponse[] = [
  {
    id: 'stop_001',
    plan_id: 'plan_001',
    order: 1,
    order_index: 1,
    day_number: 1,
    time_slot: 'MORNING',
    place_name: 'Hồ Xuân Hương',
    place_ref_id: 'ChIJxyz123',
    lat: 11.9465,
    lng: 108.4419,
    note: 'Đến sáng sớm để chụp hình đẹp và đi dạo',
    estimated_cost: '0',
    category: 'ATTRACTION',
    start_time: '2024-12-20T07:00:00Z',
    duration_minutes: 60,
    metadata: null,
    up_votes: 3,
    down_votes: 0,
    backup_options: [
      {
        place_name: 'Vườn Hoa Thành Phố Đà Lạt',
        place_ref_id: 'ChIJvh123',
        category: 'ATTRACTION',
        estimated_cost: 50000,
        distance_km: 0.8,
      },
    ],
  },
  {
    id: 'stop_002',
    plan_id: 'plan_001',
    order: 2,
    order_index: 2,
    day_number: 1,
    time_slot: 'MORNING',
    place_name: 'Quán Bún Bò Huế Bà Hồng',
    place_ref_id: 'ChIJabc456',
    lat: 11.9404,
    lng: 108.4383,
    note: 'Ăn sáng đặc sản nổi tiếng',
    estimated_cost: '50000',
    category: 'RESTAURANT',
    start_time: '2024-12-20T08:30:00Z',
    duration_minutes: 45,
    metadata: null,
    up_votes: 2,
    down_votes: 1,
    backup_options: [
      {
        place_name: 'Bánh Mì Xíu Mại Hoàng Diệu',
        place_ref_id: 'ChIJbmx123',
        category: 'RESTAURANT',
        estimated_cost: 35000,
        distance_km: 0.5,
      },
    ],
  },
  {
    id: 'stop_003',
    plan_id: 'plan_001',
    order: 3,
    order_index: 3,
    day_number: 1,
    time_slot: 'AFTERNOON',
    place_name: 'Dinh Bảo Đại (Dinh III)',
    place_ref_id: 'ChIJdef789',
    lat: 11.9335,
    lng: 108.4267,
    note: 'Tham quan dinh thự kiến trúc cổ điển',
    estimated_cost: '100000',
    category: 'ATTRACTION',
    start_time: '2024-12-20T14:00:00Z',
    duration_minutes: 90,
    metadata: null,
    up_votes: 2,
    down_votes: 0,
    backup_options: [
      {
        place_name: 'Biệt Điện Trần Lệ Xuân',
        place_ref_id: 'ChIJbdt123',
        category: 'ATTRACTION',
        estimated_cost: 80000,
        distance_km: 1.2,
      },
    ],
  },
];

let mockPlans: PlanResponse[] = [
  {
    id: 'plan_001',
    event_id: 'evt_001',
    title: 'Lịch trình Đà Lạt 3 ngày 2 đêm',
    total_budget: '3000000',
    status: 'DRAFT',
    is_ai_generated: false,
    created_by_id: 'usr_001',
    created_at: '2024-12-05T10:00:00Z',
    macro_roadmap: [
      { day: 1, theme: 'Khám phá trung tâm thành phố & Ẩm thực phố hoa' },
      { day: 2, theme: 'Săn mây Cầu Đất & Vườn dâu tây công nghệ cao' },
      { day: 3, theme: 'Thung lũng Vàng & Mua đặc sản chợ Đà Lạt' },
    ],
    macro_locked: false,
    final_locked: false,
    stops: mockStops,
  },
  {
    id: 'plan_002',
    event_id: 'evt_001',
    title: 'AI gợi ý: Tour Đà Lạt ngắm cảnh tiết kiệm',
    total_budget: '2000000',
    status: 'VOTING',
    is_ai_generated: true,
    created_by_id: null,
    created_at: '2024-12-06T14:00:00Z',
    macro_roadmap: [
      { day: 1, theme: 'Cung đường hoa & Check-in quán cafe view đồi' },
      { day: 2, theme: 'Hồ Tuyền Lâm & Chèo SUP sáng sớm' },
    ],
    macro_locked: true,
    final_locked: false,
    stops: [],
  },
];

let mockVotes: PlanVoteResponse[] = [
  {
    id: 'vote_001',
    stop_id: 'stop_001',
    plan_id: 'plan_001',
    user_id: 'usr_001',
    value: 'UP',
    comment: 'Địa điểm lý tưởng, không gian thoáng đãng!',
    created_at: '2024-12-07T09:00:00Z',
  },
  {
    id: 'vote_002',
    stop_id: 'stop_002',
    plan_id: 'plan_001',
    user_id: 'usr_002',
    value: 'DOWN',
    comment: 'Quán hơi đông vào giờ cao điểm',
    created_at: '2024-12-07T10:30:00Z',
  },
];

export const planHandlers = [
  // GET /api/v1/events/:eventId/plans
  http.get('/api/v1/events/:eventId/plans', ({ params }) => {
    const plans = mockPlans.filter((p) => p.event_id === params.eventId);

    return HttpResponse.json(
      { success: true, data: plans },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/plans
  http.post('/api/v1/events/:eventId/plans', async ({ params, request }) => {
    const body = (await request.json()) as PlanCreateRequest;

    const newPlan: PlanResponse = {
      id: `plan_${Date.now()}`,
      event_id: params.eventId as string,
      title: body.title,
      total_budget: body.total_budget ?? null,
      status: 'DRAFT',
      is_ai_generated: body.is_ai_generated ?? false,
      macro_roadmap: body.macro_roadmap ?? null,
      created_by_id: 'usr_001',
      created_at: new Date().toISOString(),
      macro_locked: false,
      final_locked: false,
      stops: [],
    };

    mockPlans.push(newPlan);

    return HttpResponse.json(
      { success: true, data: newPlan },
      { status: 201 },
    );
  }),

  // GET /api/v1/events/:eventId/plans/:planId
  http.get('/api/v1/events/:eventId/plans/:planId', ({ params }) => {
    const plan = mockPlans.find((p) => p.id === params.planId);

    if (!plan) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null },
        },
        { status: 404 },
      );
    }

    return HttpResponse.json(
      { success: true, data: plan },
      { status: 200 },
    );
  }),

  // PATCH /api/v1/events/:eventId/plans/:planId
  http.patch('/api/v1/events/:eventId/plans/:planId', async ({ params, request }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);

    if (idx === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null },
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as PlanUpdateRequest;
    mockPlans[idx] = {
      ...mockPlans[idx],
      ...(body.title !== undefined && { title: body.title }),
      ...(body.total_budget !== undefined && { total_budget: body.total_budget }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.macro_roadmap !== undefined && { macro_roadmap: body.macro_roadmap }),
    };

    return HttpResponse.json(
      { success: true, data: mockPlans[idx] },
      { status: 200 },
    );
  }),

  // PATCH /api/v1/events/:eventId/plans/:planId/status
  http.patch('/api/v1/events/:eventId/plans/:planId/status', async ({ params, request }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);

    if (idx === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null },
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as { status: PlanStatus };
    mockPlans[idx] = { ...mockPlans[idx], status: body.status };

    return HttpResponse.json(
      { success: true, data: mockPlans[idx] },
      { status: 200 },
    );
  }),

  // DELETE /api/v1/events/:eventId/plans/:planId
  http.delete('/api/v1/events/:eventId/plans/:planId', ({ params }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);

    if (idx === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null },
        },
        { status: 404 },
      );
    }

    mockPlans = mockPlans.filter((p) => p.id !== params.planId);

    return HttpResponse.json(
      { success: true, data: null },
      { status: 200 },
    );
  }),

  // PATCH /api/v1/events/:eventId/plans/:planId/stops (Reorder & batch replace stops)
  http.patch('/api/v1/events/:eventId/plans/:planId/stops', async ({ params, request }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);

    if (idx === -1) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null },
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as { stops: PlanStopResponse[] };
    mockPlans[idx] = { ...mockPlans[idx], stops: body.stops };

    return HttpResponse.json(
      { success: true, data: mockPlans[idx] },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/plans/:planId/stops (Add a single stop)
  http.post('/api/v1/events/:eventId/plans/:planId/stops', async ({ params, request }) => {
    const plan = mockPlans.find((p) => p.id === params.planId);

    if (!plan) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null },
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as PlanStopCreateRequest;
    const newStop: PlanStopResponse = {
      id: `stop_${Date.now()}`,
      plan_id: params.planId as string,
      order: body.order,
      order_index: body.order,
      day_number: body.day_number ?? 1,
      time_slot: body.time_slot ?? 'MORNING',
      place_name: body.place_name,
      place_ref_id: body.place_ref_id ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      note: body.note ?? null,
      estimated_cost: body.estimated_cost ?? '0',
      category: body.category ?? 'ATTRACTION',
      start_time: body.start_time ?? null,
      duration_minutes: body.duration_minutes ?? 60,
      metadata: body.metadata ?? null,
      up_votes: 0,
      down_votes: 0,
      backup_options: body.backup_options ?? [],
    };

    plan.stops.push(newStop);

    return HttpResponse.json(
      { success: true, data: newStop },
      { status: 201 },
    );
  }),

  // POST /api/v1/events/:eventId/plans/:planId/votes
  http.post('/api/v1/events/:eventId/plans/:planId/votes', async ({ params, request }) => {
    const body = (await request.json()) as PlanVoteCreateRequest;

    const newVote: PlanVoteResponse = {
      id: `vote_${Date.now()}`,
      stop_id: body.stop_id ?? 'stop_001',
      plan_id: params.planId as string,
      user_id: 'usr_001',
      value: body.value,
      comment: body.comment ?? null,
      created_at: new Date().toISOString(),
    };

    mockVotes.push(newVote);

    return HttpResponse.json(
      { success: true, data: newVote },
      { status: 201 },
    );
  }),

  // GET /api/v1/events/:eventId/plans/:planId/votes
  http.get('/api/v1/events/:eventId/plans/:planId/votes', ({ params }) => {
    const votes = mockVotes.filter((v) => v.plan_id === params.planId);

    return HttpResponse.json(
      { success: true, data: votes },
      { status: 200 },
    );
  }),
];
