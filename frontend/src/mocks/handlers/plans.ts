import { http, HttpResponse } from 'msw';
import type {
  PlanCloneRequest,
  PlanCreateRequest,
  PlanGenerateRequest,
  PlanResponse,
  PlanStageHistoryResponse,
  PlanStatus,
  PlanStopCreateRequest,
  PlanStopResponse,
  PlanUpdateRequest,
  PlanVersionSummary,
  PlanVoteResponse,
  StopDishesResponse,
  StopStatus,
  TransportMode,
} from '../../types/plan.ts';

/**
 * MSW Mock Handlers for Plan, PlanStop, Versioning, Dishes & Vote Queries.
 * Aligned with PR #28-PR #35:
 * - Plan Versioning (1 Event - N Plans via /clone-version & /generate)
 * - Candidate Stop Voting (candidate_options, selected_candidate_id)
 * - In-venue Dish Recommendations (/dishes)
 * - Multi-option Backup Pool (option_index: 2, 3...)
 */

const mockStops: PlanStopResponse[] = [
  {
    id: 'stop_001',
    plan_id: 'plan_001',
    order: 1,
    order_index: 1,
    day_number: 1,
    stop_date: '2026-12-20',
    time_slot: 'MORNING',
    place_name: 'Anio Boutique Hotel Hội An',
    place_ref_id: 'ChIJ_anio_001',
    address: '03 Lê Đình Thám, Cẩm Châu, Hội An',
    lat: 15.8825,
    lng: 108.338,
    note: 'Nhận phòng sớm & gửi hành lý',
    estimated_cost: '1200000',
    category: 'HOTEL',
    start_time: '2026-12-20T08:00:00Z',
    end_time: '2026-12-20T09:00:00Z',
    duration_minutes: 60,
    transport_mode: 'TAXI_GRAB' as TransportMode,
    transit_duration_minutes: 15,
    transit_distance_km: 2.1,
    transit_cost: '45000',
    stop_status: 'VOTING_OPEN' as StopStatus,
    is_initial_stop: true,
    is_finalized_stop: false,
    replaced_by_stop_id: null,
    change_reason: null,
    locked_at: null,
    metadata: null,
    up_votes: 2,
    down_votes: 0,
    recommended_dishes: [],
    selected_candidate_id: 'cand_hotel_001',
    candidate_options: [
      {
        candidate_id: 'cand_hotel_001',
        place_name: 'Anio Boutique Hotel Hội An',
        place_ref_id: 'ChIJ_anio_001',
        category: 'HOTEL',
        address: '03 Lê Đình Thám, Hội An',
        lat: 15.8825,
        lng: 108.338,
        estimated_cost: 1200000,
        distance_km: 1.2,
        description: 'Phong cách Indochine cổ điển, hồ bơi sân vườn',
        matched_desire: { member: 'Lan Vy', desire: 'Phong cách Indochine' },
        is_indoor_backup: false,
      },
      {
        candidate_id: 'cand_hotel_002',
        place_name: 'La Siesta Hoi An Resort & Spa',
        place_ref_id: 'ChIJ_lasiesta_002',
        category: 'HOTEL',
        address: '132 Hùng Vương, Hội An',
        lat: 15.8801,
        lng: 108.3175,
        estimated_cost: 1450000,
        distance_km: 1.8,
        description: 'Khu nghỉ dưỡng yên tĩnh, có spa và xe đạp miễn phí',
        matched_desire: { member: 'Hoàng Anh', desire: 'Có spa thư giãn' },
        is_indoor_backup: false,
      },
      {
        candidate_id: 'cand_hotel_003',
        place_name: 'Allegro Hoi An Little Luxury Hotel',
        place_ref_id: 'ChIJ_allegro_003',
        category: 'HOTEL',
        address: '86 Trần Hưng Đạo, Hội An',
        lat: 15.8794,
        lng: 108.3268,
        estimated_cost: 1350000,
        distance_km: 0.9,
        description: 'Ngay sát phố cổ, đi bộ 5 phút ra Chùa Cầu',
        is_indoor_backup: false,
      },
    ],
    backup_options: [
      {
        option_index: 2,
        place_name: 'Little Oasis Hoi An Hotel',
        place_ref_id: 'ChIJ_oasis_002',
        category: 'HOTEL',
        estimated_cost: 1150000,
        distance_km: 0.7,
      },
      {
        option_index: 3,
        place_name: 'Mulberry Collection Silk Village',
        place_ref_id: 'ChIJ_mulberry_003',
        category: 'HOTEL',
        estimated_cost: 1250000,
        distance_km: 1.4,
      },
    ],
  },
  {
    id: 'stop_002',
    plan_id: 'plan_001',
    order: 2,
    order_index: 2,
    day_number: 1,
    stop_date: '2026-12-20',
    time_slot: 'AFTERNOON',
    place_name: 'Bếp Cuốn Đà Nẵng',
    place_ref_id: 'ChIJabc456',
    address: '31-33 Trần Bạch Đằng, Sơn Trà, Đà Nẵng',
    lat: 16.0544,
    lng: 108.2478,
    note: 'Ăn trưa đặc sản miền Trung, có menu chay riêng',
    estimated_cost: '150000',
    category: 'RESTAURANT',
    start_time: '2026-12-20T12:00:00Z',
    end_time: '2026-12-20T13:30:00Z',
    duration_minutes: 90,
    transport_mode: 'TAXI_GRAB' as TransportMode,
    transit_duration_minutes: 10,
    transit_distance_km: 1.9,
    transit_cost: '35000',
    stop_status: 'INITIAL_PROPOSED' as StopStatus,
    is_initial_stop: true,
    is_finalized_stop: false,
    replaced_by_stop_id: null,
    change_reason: null,
    locked_at: null,
    metadata: null,
    up_votes: 0,
    down_votes: 0,
    recommended_dishes: [
      {
        dish_name: 'Gỏi cuốn rau củ nấm (Chay)',
        estimated_price: '55000',
        tags: ['Ăn chay được', 'Không cay'],
        dietary_match: true,
      },
      {
        dish_name: 'Bánh tráng cuốn thịt heo hai đầu da',
        estimated_price: '85000',
        tags: ['Đặc sản', 'Must-try'],
        dietary_match: true,
      },
    ],
    candidate_options: null,
    selected_candidate_id: null,
    backup_options: [
      {
        option_index: 2,
        place_name: 'The Espresso Station',
        place_ref_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        category: 'CAFE',
        estimated_cost: 45000,
        distance_km: 0.4,
      },
      {
        option_index: 3,
        place_name: 'Artisan Roastery & Bakery',
        place_ref_id: 'ChIJb7c_tDeuEmsRUk98G83frY5',
        category: 'CAFE',
        estimated_cost: 50000,
        distance_km: 0.7,
      },
    ],
  },
];

let mockPlans: PlanResponse[] = [
  {
    id: 'plan_001',
    event_id: 'evt_001',
    title: 'Lịch trình Đà Nẵng — Hội An 3N2Đ (v1)',
    version_number: 1,
    parent_plan_id: null,
    is_active: true,
    change_summary: 'Phiên bản khởi tạo từ AI',
    locked_at: null,
    total_budget: '5000000',
    status: 'VOTING',
    is_ai_generated: true,
    created_by_id: 'usr_001',
    created_at: '2026-11-20T10:00:00Z',
    macro_roadmap: [
      { day: 1, theme: 'Khám phá Hội An & Ẩm thực đặc sản' },
      { day: 2, theme: 'Bán đảo Sơn Trà & Biển Mỹ Khê' },
    ],
    macro_locked: true,
    final_locked: false,
    stops: mockStops,
  },
];

const mockVotes: PlanVoteResponse[] = [
  {
    id: 'vote_001',
    stop_id: 'stop_001',
    plan_id: 'plan_001',
    user_id: 'usr_001',
    candidate_id: 'cand_hotel_001',
    candidate_name: 'Anio Boutique Hotel Hội An',
    value: null,
    comment: 'Khách sạn phong cách Indochine đẹp và tiện đi lại',
    created_at: '2026-11-20T10:05:00Z',
  },
  {
    id: 'vote_002',
    stop_id: 'stop_001',
    plan_id: 'plan_001',
    user_id: 'usr_002',
    candidate_id: 'cand_hotel_002',
    candidate_name: 'La Siesta Hoi An Resort & Spa',
    value: null,
    comment: 'Có spa thư giãn rất ổn',
    created_at: '2026-11-20T10:07:00Z',
  },
];

export const planHandlers = [
  // GET /api/v1/events/:eventId/plans
  http.get('/api/v1/events/:eventId/plans', ({ params }) => {
    const plans = mockPlans.filter((p) => p.event_id === params.eventId);
    return HttpResponse.json({ success: true, data: plans }, { status: 200 });
  }),

  // POST /api/v1/events/:eventId/plans
  http.post('/api/v1/events/:eventId/plans', async ({ params, request }) => {
    const body = (await request.json()) as PlanCreateRequest;
    const newPlan: PlanResponse = {
      id: `plan_${Date.now()}`,
      event_id: params.eventId as string,
      title: body.title,
      version_number: body.version_number ?? mockPlans.length + 1,
      parent_plan_id: body.parent_plan_id ?? null,
      is_active: body.is_active ?? true,
      change_summary: body.change_summary ?? null,
      locked_at: null,
      total_budget: body.total_budget ?? null,
      status: 'INITIAL',
      is_ai_generated: body.is_ai_generated ?? false,
      macro_roadmap: body.macro_roadmap ?? null,
      created_by_id: 'usr_001',
      created_at: new Date().toISOString(),
      macro_locked: false,
      final_locked: false,
      stops: [],
    };
    mockPlans.push(newPlan);
    return HttpResponse.json({ success: true, data: newPlan }, { status: 201 });
  }),

  // POST /api/v1/events/:eventId/plans/generate (Input Filter Gate: Location & Date required)
  http.post('/api/v1/events/:eventId/plans/generate', async ({ params, request }) => {
    const body = (await request.json()) as Partial<PlanGenerateRequest>;
    if (!body.destination || !body.start_date || !body.end_date) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CORE_PARAMETERS',
            message: 'Bắt buộc phải nhập Điểm đến (destination) và Ngày đi/về (start_date, end_date).',
            details: null,
          },
        },
        { status: 422 },
      );
    }

    const generatedPlan: PlanResponse = {
      id: `plan_gen_${Date.now()}`,
      event_id: params.eventId as string,
      title: `Lịch trình ${body.destination} (${body.start_date} → ${body.end_date})`,
      version_number: mockPlans.filter((p) => p.event_id === params.eventId).length + 1,
      parent_plan_id: null,
      is_active: true,
      change_summary: 'Khởi tạo tự động bởi AI Agent sau khi qua Input Filter',
      locked_at: null,
      total_budget: '5000000',
      status: 'INITIAL',
      is_ai_generated: true,
      macro_roadmap: [{ day: 1, theme: `Khám phá ${body.destination}` }],
      created_by_id: 'usr_001',
      created_at: new Date().toISOString(),
      macro_locked: false,
      final_locked: false,
      stops: structuredClone(mockStops),
    };
    mockPlans.push(generatedPlan);
    return HttpResponse.json({ success: true, data: generatedPlan }, { status: 201 });
  }),

  // POST /api/v1/events/:eventId/plans/:planId/clone-version (Non-destructive Plan Snapshot)
  http.post('/api/v1/events/:eventId/plans/:planId/clone-version', async ({ params, request }) => {
    const source = mockPlans.find((p) => p.id === params.planId);
    if (!source) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }

    const body = (await request.json().catch(() => ({}))) as PlanCloneRequest;
    mockPlans.forEach((p) => {
      if (p.event_id === source.event_id) {
        p.is_active = false;
      }
    });

    const newPlanId = `plan_v${(source.version_number ?? 1) + 1}_${Date.now()}`;
    const targetStatus: PlanStatus = body.target_status ?? 'FINALIZED';
    const clonedStops: PlanStopResponse[] = source.stops
      .filter((s) => s.stop_status !== 'REJECTED_IN_VOTE')
      .map((s) => ({
        ...structuredClone(s),
        id: `${s.id}_clone_${Date.now()}`,
        plan_id: newPlanId,
        is_initial_stop: false,
        is_finalized_stop: targetStatus === 'FINALIZED',
        stop_status: targetStatus === 'FINALIZED' ? 'FINALIZED_LOCKED' : 'ONGOING_ACTIVE',
      }));

    const clonedPlan: PlanResponse = {
      ...structuredClone(source),
      id: newPlanId,
      version_number: (source.version_number ?? 1) + 1,
      parent_plan_id: source.id,
      title: body.title ?? source.title,
      status: targetStatus,
      is_active: true,
      change_summary: body.change_summary ?? `Nhân bản từ phiên bản v${source.version_number ?? 1}`,
      locked_at: targetStatus === 'FINALIZED' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      stops: clonedStops,
    };

    mockPlans.push(clonedPlan);
    return HttpResponse.json({ success: true, data: clonedPlan }, { status: 201 });
  }),

  // GET /api/v1/events/:eventId/plans/:planId
  http.get('/api/v1/events/:eventId/plans/:planId', ({ params }) => {
    const plan = mockPlans.find((p) => p.id === params.planId);
    if (!plan) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }
    return HttpResponse.json({ success: true, data: plan }, { status: 200 });
  }),

  // PATCH /api/v1/events/:eventId/plans/:planId
  http.patch('/api/v1/events/:eventId/plans/:planId', async ({ params, request }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }
    const body = (await request.json()) as PlanUpdateRequest;
    mockPlans[idx] = { ...mockPlans[idx], ...body };
    return HttpResponse.json({ success: true, data: mockPlans[idx] }, { status: 200 });
  }),

  // PATCH /api/v1/events/:eventId/plans/:planId/status
  http.patch('/api/v1/events/:eventId/plans/:planId/status', async ({ params, request }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }
    const body = (await request.json()) as { status: PlanStatus; change_summary?: string };
    mockPlans[idx] = {
      ...mockPlans[idx],
      status: body.status,
      ...(body.change_summary !== undefined && { change_summary: body.change_summary }),
    };
    return HttpResponse.json({ success: true, data: mockPlans[idx] }, { status: 200 });
  }),

  // DELETE /api/v1/events/:eventId/plans/:planId
  http.delete('/api/v1/events/:eventId/plans/:planId', ({ params }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }
    mockPlans = mockPlans.filter((p) => p.id !== params.planId);
    return HttpResponse.json({ success: true, data: null }, { status: 200 });
  }),

  // GET /api/v1/events/:eventId/plans/:planId/history
  http.get('/api/v1/events/:eventId/plans/:planId/history', ({ params }) => {
    const plan = mockPlans.find((p) => p.id === params.planId);
    if (!plan) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }

    const versionChain: PlanVersionSummary[] = mockPlans
      .filter((p) => p.event_id === plan.event_id)
      .map((p) => ({
        id: p.id,
        version_number: p.version_number ?? 1,
        parent_plan_id: p.parent_plan_id ?? null,
        status: p.status,
        is_active: p.is_active ?? true,
        total_budget: p.total_budget,
        change_summary: p.change_summary ?? null,
        locked_at: p.locked_at ?? null,
        created_at: p.created_at,
      }));

    const history: PlanStageHistoryResponse = {
      plan_id: plan.id,
      event_id: plan.event_id,
      version_number: plan.version_number ?? 1,
      current_status: plan.status,
      version_chain: versionChain,
      initial_stops: plan.stops.filter((s) => s.is_initial_stop === true),
      finalized_stops: plan.stops.filter((s) => s.is_finalized_stop === true),
      ongoing_stops: plan.stops.filter(
        (s) => s.stop_status === 'ONGOING_ACTIVE' || s.stop_status === 'ADAPTED_ON_TRIP',
      ),
      rejected_or_skipped_stops: plan.stops.filter(
        (s) => s.stop_status === 'REJECTED_IN_VOTE' || s.stop_status === 'SKIPPED_ON_TRIP',
      ),
    };

    return HttpResponse.json({ success: true, data: history }, { status: 200 });
  }),

  // PATCH /api/v1/events/:eventId/plans/:planId/stops
  http.patch('/api/v1/events/:eventId/plans/:planId/stops', async ({ params, request }) => {
    const idx = mockPlans.findIndex((p) => p.id === params.planId);
    if (idx === -1) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
        { status: 404 },
      );
    }
    const body = (await request.json()) as { stops: PlanStopResponse[] };
    mockPlans[idx] = { ...mockPlans[idx], stops: body.stops };
    return HttpResponse.json({ success: true, data: mockPlans[idx].stops }, { status: 200 });
  }),

  // POST /api/v1/events/:eventId/plans/:planId/stops
  http.post('/api/v1/events/:eventId/plans/:planId/stops', async ({ params, request }) => {
    const plan = mockPlans.find((p) => p.id === params.planId);
    if (!plan) {
      return HttpResponse.json(
        { success: false, error: { code: 'PLAN_NOT_FOUND', message: 'Không tìm thấy plan', details: null } },
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
      stop_date: body.stop_date ?? null,
      time_slot: body.time_slot ?? 'MORNING',
      place_name: body.place_name,
      place_ref_id: body.place_ref_id ?? null,
      address: body.address ?? null,
      lat: body.lat ?? null,
      lng: body.lng ?? null,
      note: body.note ?? null,
      estimated_cost: body.estimated_cost ?? '0',
      category: body.category ?? 'ATTRACTION',
      start_time: body.start_time ?? null,
      end_time: body.end_time ?? null,
      duration_minutes: body.duration_minutes ?? 60,
      transport_mode: body.transport_mode ?? ('WALKING' as TransportMode),
      transit_duration_minutes: body.transit_duration_minutes ?? 5,
      transit_distance_km: body.transit_distance_km ?? 0.4,
      transit_cost: body.transit_cost ?? '0',
      stop_status: body.stop_status ?? ('INITIAL_PROPOSED' as StopStatus),
      is_initial_stop: body.is_initial_stop ?? true,
      is_finalized_stop: body.is_finalized_stop ?? false,
      replaced_by_stop_id: body.replaced_by_stop_id ?? null,
      change_reason: body.change_reason ?? null,
      locked_at: body.locked_at ?? null,
      metadata: body.metadata ?? null,
      up_votes: 0,
      down_votes: 0,
      recommended_dishes: body.recommended_dishes ?? [],
      candidate_options: body.candidate_options ?? null,
      selected_candidate_id: body.selected_candidate_id ?? null,
      backup_options: body.backup_options ?? [],
    };
    plan.stops.push(newStop);
    return HttpResponse.json({ success: true, data: newStop }, { status: 201 });
  }),

  // GET /api/v1/events/:eventId/plans/:planId/stops/:stopId/dishes
  http.get('/api/v1/events/:eventId/plans/:planId/stops/:stopId/dishes', ({ params }) => {
    const plan = mockPlans.find((p) => p.id === params.planId);
    const stop = plan?.stops.find((s) => s.id === params.stopId);

    if (!stop) {
      return HttpResponse.json(
        { success: false, error: { code: 'STOP_NOT_FOUND', message: 'Không tìm thấy điểm dừng', details: null } },
        { status: 404 },
      );
    }

    const data: StopDishesResponse = {
      stop_id: stop.id,
      place_name: stop.place_name,
      recommended_dishes: stop.recommended_dishes ?? [
        {
          dish_name: 'Mì Quảng ếch',
          estimated_price: '60000',
          tags: ['Đặc sản', 'Không cay'],
          dietary_match: true,
        },
      ],
      dietary_notes_applied: ['Nam: Ăn chay', 'Linh: Không ăn cay'],
    };

    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),

  // GET /api/v1/events/:eventId/plans/:planId/votes
  http.get('/api/v1/events/:eventId/plans/:planId/votes', ({ params }) => {
    const votes = mockVotes.filter((v) => v.plan_id === params.planId);
    return HttpResponse.json({ success: true, data: votes }, { status: 200 });
  }),
];
