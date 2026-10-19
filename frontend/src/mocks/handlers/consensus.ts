import { http, HttpResponse } from 'msw';
import type {
  MacroLockResponse,
  StopVoteRequest,
  StopVoteResponse,
  StopSwapRequest,
  StopSwapResponse,
  FinalLockResponse,
  StopAdaptationRequest,
  StopAdaptationResponse,
  RoadmapTheme,
} from '../../types/consensus.ts';

/**
 * MSW Mock Handlers for Two-Stage Consensus & Living Itinerary APIs.
 * Endpoints follow api-design-guide.md Section 2 & 3.
 * Response format follows api-design-guide.md Section 4.
 */

export const consensusHandlers = [
  // POST /api/v1/events/:eventId/macro-lock (Consensus 1: Macro Lock)
  http.post('/api/v1/events/:eventId/macro-lock', ({ params }) => {
    const data: MacroLockResponse = {
      event_id: params.eventId as string,
      macro_locked: true,
      locked_at: new Date().toISOString(),
      roadmap_themes: [
        { day: 1, theme: 'Khám phá bán đảo Sơn Trà & Biển Mỹ Khê' },
        { day: 2, theme: 'Trải nghiệm Bà Nà Hills trọn ngày' },
        { day: 3, theme: 'Phố cổ Hội An & Ẩm thực đêm' },
      ],
    };

    return HttpResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/stops/:stopId/vote (Granular Stop Voting)
  http.post('/api/v1/events/:eventId/stops/:stopId/vote', async ({ params, request }) => {
    const body = (await request.json()) as StopVoteRequest;

    const isDownVote = body.vote_value === 'DOWN';

    const data: StopVoteResponse = {
      stop_id: params.stopId as string,
      up_votes: isDownVote ? 2 : 4,
      down_votes: isDownVote ? 3 : 0,
      recommend_swap: isDownVote,
      backup_options: [
        {
          place_name: 'The Espresso Station',
          place_ref_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
          category: 'CAFE',
          estimated_cost: 45000,
          distance_km: 0.4,
        },
        {
          place_name: 'Faifo Coffee Rooftop',
          place_ref_id: 'ChIJFaifoCoffeeRooftop',
          category: 'CAFE',
          estimated_cost: 55000,
          distance_km: 0.7,
        },
      ],
    };

    return HttpResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/stops/:stopId/swap (1-Click Swap)
  http.post('/api/v1/events/:eventId/stops/:stopId/swap', async ({ params, request }) => {
    const body = (await request.json().catch(() => ({}))) as StopSwapRequest;
    const placeName = body.target_backup_place_ref_id ? 'The Espresso Station' : 'Địa điểm dự phòng mới';

    const data: StopSwapResponse = {
      swapped_stop_id: params.stopId as string,
      new_place_name: placeName,
      category: 'CAFE',
      lat: 16.0682,
      lng: 108.2235,
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/final-lock (Consensus 2: Final Lock)
  http.post('/api/v1/events/:eventId/final-lock', ({ params }) => {
    const data: FinalLockResponse = {
      event_id: params.eventId as string,
      final_locked: true,
      locked_at: new Date().toISOString(),
      total_stops: 8,
      total_budget: '5000000',
    };

    return HttpResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  }),

  // PATCH /api/v1/events/:eventId/stops/:stopId (Living Itinerary Dynamic Adaptation)
  http.patch('/api/v1/events/:eventId/stops/:stopId', async ({ params, request }) => {
    const body = (await request.json()) as StopAdaptationRequest;

    const data: StopAdaptationResponse = {
      stop_id: params.stopId as string,
      place_name: body.place_name,
      place_ref_id: body.place_ref_id,
      note: body.note ?? 'Đã điều chỉnh lịch trình do điều kiện thực tế',
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/ai/macro-plan (Phase 1 AI Macro Roadmap)
  http.post('/api/v1/events/:eventId/ai/macro-plan', () => {
    const themes: RoadmapTheme[] = [
      { day: 1, theme: 'Khám phá bán đảo Sơn Trà & Biển Mỹ Khê' },
      { day: 2, theme: 'Trải nghiệm Bà Nà Hills trọn ngày' },
      { day: 3, theme: 'Phố cổ Hội An & Ẩm thực đêm' },
    ];

    return HttpResponse.json(
      {
        success: true,
        data: themes,
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/events/:eventId/ai/micro-curation (Phase 2 AI Micro Curation)
  http.post('/api/v1/events/:eventId/ai/micro-curation', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          message: 'Tuyển chọn địa điểm và gom cụm tuyến đường thành công',
          generated_stops_count: 8,
        },
      },
      { status: 200 },
    );
  }),
];
