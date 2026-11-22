import { http, HttpResponse } from 'msw';
import type {
  CandidateVoteSummary,
  FetchMoreBackupsRequest,
  FetchMoreBackupsResponse,
  MacroLockResponse,
  StopAdaptationRequest,
  StopAdaptationResponse,
  StopSwapRequest,
  StopSwapResponse,
  StopVoteRequest,
  StopVoteResponse,
} from '../../types/consensus.ts';
import type { PlanResponse } from '../../types/plan.ts';

/**
 * MSW Mock Handlers for Two-Stage Consensus, PR #35 Candidate Voting,
 * Multi-Option Swap, Fetch-More Clarification & Rain Adaptation APIs.
 * Unified URL prefix: /api/v1/events/:eventId/plans/:planId/...
 */

const CANDIDATE_SEED: Array<{ candidate_id: string; place_name: string }> = [
  { candidate_id: 'cand_hotel_001', place_name: 'Anio Boutique Hotel Hội An' },
  { candidate_id: 'cand_hotel_002', place_name: 'La Siesta Hoi An Resort & Spa' },
  { candidate_id: 'cand_hotel_003', place_name: 'Allegro Hoi An Little Luxury Hotel' },
];

// In-memory vote map per stopId -> Map<userName, candidateId>
const stopVoteState = new Map<string, Map<string, string>>([
  [
    'stop_001',
    new Map<string, string>([
      ['Lan Vy', 'cand_hotel_001'],
      ['Hoàng Anh', 'cand_hotel_002'],
    ]),
  ],
]);

const GROUP_TOTAL_MEMBERS = 3;
const QUORUM_RATIO = 0.6;

export const consensusHandlers = [
  // POST /api/v1/events/:eventId/plans/:planId/macro-lock (Consensus 1: Macro Lock)
  http.post('/api/v1/events/:eventId/plans/:planId/macro-lock', ({ params }) => {
    const data: MacroLockResponse = {
      event_id: params.eventId as string,
      macro_locked: true,
      locked_at: new Date().toISOString(),
      roadmap_themes: [
        { day: 1, theme: 'Khám phá Hội An & Ẩm thực đặc sản' },
        { day: 2, theme: 'Bán đảo Sơn Trà & Biển Mỹ Khê' },
        { day: 3, theme: 'Phố cổ & Mua đặc sản địa phương' },
      ],
    };

    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),

  // POST /api/v1/events/:eventId/plans/:planId/final-lock (Consensus 2: Auto-clone Plan v2 FINALIZED)
  http.post('/api/v1/events/:eventId/plans/:planId/final-lock', ({ params }) => {
    const now = new Date().toISOString();
    const data: PlanResponse = {
      id: `plan_v2_${Date.now()}`,
      event_id: params.eventId as string,
      title: 'Lịch trình Đà Nẵng — Hội An 3N2Đ (Đã chốt v2)',
      version_number: 2,
      parent_plan_id: params.planId as string,
      is_active: true,
      change_summary: 'Chốt kế hoạch chính thức sau khi nhóm đạt đồng thuận',
      locked_at: now,
      total_budget: '5000000',
      status: 'FINALIZED',
      is_ai_generated: true,
      created_by_id: 'usr_001',
      created_at: now,
      macro_locked: true,
      final_locked: true,
      stops: [],
    };

    return HttpResponse.json({ success: true, data }, { status: 200 });
  }),

  // POST /api/v1/events/:eventId/plans/:planId/stops/:stopId/vote (PR #35 Candidate Poll + Quorum)
  http.post(
    '/api/v1/events/:eventId/plans/:planId/stops/:stopId/vote',
    async ({ params, request }) => {
      const stopId = params.stopId as string;
      const body = (await request.json()) as StopVoteRequest;

      if (!stopVoteState.has(stopId)) {
        stopVoteState.set(stopId, new Map<string, string>());
      }
      const userVotes = stopVoteState.get(stopId)!;
      // Current demo user casts or switches their vote
      userVotes.set('Minh Đức', body.candidate_id);

      const candidates: CandidateVoteSummary[] = CANDIDATE_SEED.map((cand) => {
        const voters: string[] = [];
        userVotes.forEach((selectedId, voterName) => {
          if (selectedId === cand.candidate_id) {
            voters.push(voterName);
          }
        });
        return {
          candidate_id: cand.candidate_id,
          place_name: cand.place_name,
          votes_count: voters.length,
          voters,
        };
      });

      const leader = [...candidates].sort((a, b) => b.votes_count - a.votes_count)[0];
      const quorumReached =
        Boolean(leader) && leader.votes_count / GROUP_TOTAL_MEMBERS >= QUORUM_RATIO;

      const data: StopVoteResponse = {
        stop_id: stopId,
        selected_candidate_id: leader?.candidate_id ?? null,
        quorum_reached: quorumReached,
        stop_status: quorumReached ? 'SELECTED_AFTER_VOTE' : 'VOTING_OPEN',
        next_unlocked_stop_id: quorumReached ? 'stop_002' : null,
        candidates,
      };

      return HttpResponse.json({ success: true, data }, { status: 200 });
    },
  ),

  // POST /api/v1/events/:eventId/plans/:planId/stops/:stopId/swap (Multi-Option Swap)
  http.post(
    '/api/v1/events/:eventId/plans/:planId/stops/:stopId/swap',
    async ({ params, request }) => {
      const stopId = params.stopId as string;
      const body = (await request.json().catch(() => ({}))) as StopSwapRequest;
      const isOption3 = body.target_backup_place_ref_id === 'ChIJb7c_tDeuEmsRUk98G83frY5';
      const newStopId = `stop_swap_${Date.now()}`;

      const data: StopSwapResponse = {
        previous_stop_id: stopId,
        new_stop_id: newStopId,
        new_place_name: isOption3 ? 'Artisan Roastery & Bakery' : 'The Espresso Station',
        selected_option_index: isOption3 ? 3 : 2,
        category: 'CAFE',
        lat: 16.0682,
        lng: 108.2235,
        stop_status: 'SELECTED_AFTER_VOTE',
        replaced_by_stop_id: newStopId,
        updated_at: new Date().toISOString(),
      };

      return HttpResponse.json({ success: true, data }, { status: 200 });
    },
  ),

  // POST /api/v1/events/:eventId/plans/:planId/stops/:stopId/backup-options/fetch-more
  http.post(
    '/api/v1/events/:eventId/plans/:planId/stops/:stopId/backup-options/fetch-more',
    async ({ params, request }) => {
      const stopId = params.stopId as string;
      const body = (await request.json().catch(() => ({}))) as FetchMoreBackupsRequest;

      if (!body.clarification_notes && !body.dietary_filter) {
        const clarificationPayload: FetchMoreBackupsResponse = {
          stop_id: stopId,
          backup_options: [],
          needs_clarification: true,
          clarification_question:
            'Nhóm mình chưa ưng các phương án vừa rồi. Các bạn muốn đổi sang loại món ăn nào hoặc mức giá ra sao để TripMate tìm chính xác hơn?',
        };
        return HttpResponse.json({ success: true, data: clarificationPayload }, { status: 200 });
      }

      const data: FetchMoreBackupsResponse = {
        stop_id: stopId,
        backup_options: [
          {
            option_index: 4,
            place_name: 'Lẩu Nướng Phố Cổ Yên Tĩnh',
            place_ref_id: 'ChIJ_pa4_bbq',
            category: 'RESTAURANT',
            estimated_cost: 180000,
            distance_km: 0.9,
          },
          {
            option_index: 5,
            place_name: 'Bếp Chay An Lạc',
            place_ref_id: 'ChIJ_pa5_veg',
            category: 'RESTAURANT',
            estimated_cost: 120000,
            distance_km: 1.1,
          },
        ],
        needs_clarification: false,
        clarification_question: null,
      };

      return HttpResponse.json({ success: true, data }, { status: 200 });
    },
  ),

  // POST /api/v1/events/:eventId/plans/:planId/stops/:stopId/adapt (Non-destructive Rain Adaptation)
  http.post(
    '/api/v1/events/:eventId/plans/:planId/stops/:stopId/adapt',
    async ({ params, request }) => {
      const stopId = params.stopId as string;
      const body = (await request.json()) as StopAdaptationRequest;
      const newStopId = `stop_adapted_${Date.now()}`;

      const data: StopAdaptationResponse = {
        previous_stop_id: stopId,
        new_stop_id: newStopId,
        new_place_name: body.new_place_name,
        new_place_ref_id: body.new_place_ref_id,
        stop_status: 'ADAPTED_ON_TRIP',
        replaced_by_stop_id: newStopId,
        change_reason: body.change_reason,
        cloned_plan_id: `plan_v3_${Date.now()}`,
        updated_at: new Date().toISOString(),
      };

      return HttpResponse.json({ success: true, data }, { status: 200 });
    },
  ),
];
