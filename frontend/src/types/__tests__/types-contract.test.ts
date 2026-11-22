// DTO Contract Parity Test Suite for TripMate AI Sprint 0 & Supervisor / PR #35 Contracts
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  BackupOption,
  CandidateOption,
  CandidateVoteSummary,
  FetchMoreBackupsRequest,
  FetchMoreBackupsResponse,
  FinalLockRequest,
  FinalLockResponse,
  MacroLockRequest,
  MacroLockResponse,
  StopAdaptationRequest,
  StopAdaptationResponse,
  StopSwapRequest,
  StopSwapResponse,
  StopVoteRequest,
  StopVoteResponse,
} from '../consensus.ts';
import type {
  BudgetTier,
  EventCreateRequest,
  EventMemberResponse,
  EventResponse,
  EventRole,
  EventScope,
  EventUpdateRequest,
} from '../event.ts';
import type {
  ForgotPasswordRequest,
  GoogleLoginRequest,
  LoginRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserProfileUpdateRequest,
  UserResponse,
} from '../auth.ts';
import type {
  PlanCloneRequest,
  PlanGenerateRequest,
  PlanResponse,
  PlanStageHistoryResponse,
  PlanStopResponse,
  PlanVersionSummary,
  PlanVoteResponse,
  RecommendedDishItem,
  StopDishesResponse,
  StopStatus,
  TimeSlot,
  TransportMode,
} from '../plan.ts';
import type {
  ChatMessageCreateRequest,
  ChatMessageListResponse,
  ChatMessageResponse,
  ChatMessageType,
  ChatRole,
} from '../chat.ts';
import type {
  POIItem,
  PlaceDetailResponse,
  PlaceSearchResponse,
} from '../place.ts';

describe('TypeScript DTO Contract Parity Suite', () => {
  describe('Module Existence and Runtime Exports', () => {
    it('verifies consensus.ts module exists and exports constants', async () => {
      const consensusModule = await import('../consensus.ts');
      assert.ok(consensusModule);
      assert.equal(consensusModule.DEFAULT_INITIAL_BACKUP_OPTIONS, 2);
      assert.equal(consensusModule.MAX_BACKUP_OPTIONS, 2);
    });

    it('verifies place.ts and plan.ts types are accessible', async () => {
      const placeModule = await import('../place.ts');
      const planModule = await import('../plan.ts');
      assert.ok(placeModule);
      assert.ok(planModule);
    });
  });

  describe('Consensus & PR #35 Candidate Voting Contracts', () => {
    it('validates MacroLockResponse and MacroLockRequest conforming to Section 3.1', () => {
      const macroReq: MacroLockRequest = { macro_locked: true };
      const macroLock: MacroLockResponse = {
        event_id: 'evt_da_nang_2026',
        macro_locked: true,
        locked_at: '2026-09-22T14:30:00Z',
        roadmap_themes: [
          { day: 1, theme: 'Khám phá bán đảo Sơn Trà & Biển Mỹ Khê' },
          { day: 2, theme: 'Trải nghiệm Bà Nà Hills trọn ngày' },
          { day: 3, theme: 'Phố cổ Hội An & Ẩm thực đêm' },
        ],
      };

      assert.equal(macroReq.macro_locked, true);
      assert.equal(macroLock.macro_locked, true);
      assert.equal(macroLock.roadmap_themes.length, 3);
    });

    it('validates PR #35 CandidateOption, StopVoteRequest & StopVoteResponse', () => {
      const candidate: CandidateOption = {
        candidate_id: 'cand_hotel_001',
        place_name: 'Anio Boutique Hotel Hội An',
        place_ref_id: 'ChIJ_anio_001',
        category: 'HOTEL',
        estimated_cost: 1200000,
        distance_km: 1.2,
        matched_desire: { member: 'Lan Vy', desire: 'Phong cách Indochine' },
      };

      const voteReq: StopVoteRequest = {
        candidate_id: candidate.candidate_id,
        comment: 'Khách sạn phong cách Indochine đẹp và tiện đi lại',
      };

      const summary: CandidateVoteSummary = {
        candidate_id: 'cand_hotel_001',
        place_name: 'Anio Boutique Hotel Hội An',
        votes_count: 2,
        voters: ['Lan Vy', 'Minh Đức'],
      };

      const voteRes: StopVoteResponse = {
        stop_id: 'stop_hotel_001',
        selected_candidate_id: 'cand_hotel_001',
        quorum_reached: true,
        stop_status: 'SELECTED_AFTER_VOTE',
        next_unlocked_stop_id: 'stop_food_002',
        candidates: [summary],
      };

      assert.equal(voteReq.candidate_id, 'cand_hotel_001');
      assert.equal(voteRes.quorum_reached, true);
      assert.equal(voteRes.next_unlocked_stop_id, 'stop_food_002');
      assert.equal(voteRes.candidates[0].votes_count, 2);
    });

    it('validates Multi-Option StopSwapRequest, StopSwapResponse & FetchMoreBackups', () => {
      const swapReq: StopSwapRequest = {
        target_backup_place_ref_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        cycle_next: false,
        change_reason: 'Đổi sang quán yên tĩnh hơn',
      };

      const swapRes: StopSwapResponse = {
        previous_stop_id: 'stop_cafe_001',
        new_stop_id: 'stop_cafe_002',
        new_place_name: 'The Espresso Station',
        selected_option_index: 2,
        category: 'CAFE',
        lat: 16.0682,
        lng: 108.2235,
        stop_status: 'SELECTED_AFTER_VOTE',
        replaced_by_stop_id: 'stop_cafe_002',
        updated_at: '2026-09-22T14:45:00Z',
      };

      const backup: BackupOption = {
        option_index: 4,
        place_name: 'Lẩu Nướng Phố Cổ',
        place_ref_id: 'ChIJ_pa4',
        category: 'RESTAURANT',
        estimated_cost: 180000,
        distance_km: 0.9,
      };

      const fetchMoreReq: FetchMoreBackupsRequest = {
        clarification_notes: 'Không gian yên tĩnh',
        dietary_filter: 'NON_SPICY',
        exclude_place_ref_ids: ['ChIJ_pa1'],
      };

      const fetchMoreRes: FetchMoreBackupsResponse = {
        stop_id: 'stop_cafe_002',
        backup_options: [backup],
        needs_clarification: false,
        clarification_question: null,
      };

      assert.equal(swapReq.cycle_next, false);
      assert.equal(swapRes.selected_option_index, 2);
      assert.equal(fetchMoreReq.dietary_filter, 'NON_SPICY');
      assert.equal(fetchMoreRes.backup_options[0].option_index, 4);
    });

    it('validates FinalLockRequest & FinalLockResponse shape', () => {
      const finalReq: FinalLockRequest = { final_locked: true };
      const finalRes: FinalLockResponse = {
        event_id: 'evt_da_nang_2026',
        final_locked: true,
        locked_at: '2026-09-22T15:00:00Z',
        total_stops: 9,
        total_budget: '5500000',
      };

      assert.equal(finalReq.final_locked, true);
      assert.equal(finalRes.final_locked, true);
      assert.equal(finalRes.total_budget, '5500000');
    });

    it('validates non-destructive StopAdaptationRequest & StopAdaptationResponse', () => {
      const adaptReq: StopAdaptationRequest = {
        new_place_name: 'Bảo tàng Điêu khắc Chăm (Trong nhà)',
        new_place_ref_id: 'ChIJChamMuseum',
        change_reason: 'Trời mưa to, chuyển từ bãi biển sang bảo tàng trong nhà',
      };

      const adaptRes: StopAdaptationResponse = {
        previous_stop_id: 'stop_beach_001',
        new_stop_id: 'stop_museum_002',
        new_place_name: adaptReq.new_place_name,
        new_place_ref_id: adaptReq.new_place_ref_id,
        stop_status: 'ADAPTED_ON_TRIP',
        replaced_by_stop_id: 'stop_museum_002',
        change_reason: adaptReq.change_reason,
        cloned_plan_id: 'plan_v3_001',
        updated_at: '2026-09-22T16:00:00Z',
      };

      assert.equal(adaptRes.new_place_name, 'Bảo tàng Điêu khắc Chăm (Trong nhà)');
      assert.equal(adaptRes.cloned_plan_id, 'plan_v3_001');
    });
  });

  describe('Auth & User Profile Contracts', () => {
    it('validates ForgotPasswordRequest & ResetPasswordRequest shapes', () => {
      const forgotReq: ForgotPasswordRequest = { email: 'user@tripmate.ai' };
      const resetReq: ResetPasswordRequest = {
        token: 'valid_reset_token_123',
        new_password: 'StrongPassword123!',
      };

      assert.equal(forgotReq.email, 'user@tripmate.ai');
      assert.equal(resetReq.token, 'valid_reset_token_123');
    });

    it('validates LoginRequest, GoogleLoginRequest, TokenResponse, UserResponse & UserProfileUpdateRequest', () => {
      const loginReq: LoginRequest = {
        email: 'hadanghuy@tripmate.ai',
        password: 'SecurePassword@123',
      };
      const googleReq: GoogleLoginRequest = { id_token: 'google_oauth2_id_token_xyz' };
      const tokenRes: TokenResponse = {
        access_token: 'jwt_access_token_abc',
        token_type: 'bearer',
        refresh_token: 'jwt_refresh_token_xyz',
      };
      const userRes: UserResponse = {
        id: 'usr_001',
        email: 'hadanghuy@tripmate.ai',
        full_name: 'Hà Đăng Huy',
        avatar_url: null,
        dietary_preferences: { no_spicy: true },
        provider: 'LOCAL',
        role: 'USER',
        created_at: '2026-10-13T09:00:00Z',
      };
      const profileUpd: UserProfileUpdateRequest = {
        full_name: 'Hà Đăng Huy',
        dietary_preferences: { vegetarian: false, allergies: ['peanuts'] },
      };

      assert.equal(loginReq.email, 'hadanghuy@tripmate.ai');
      assert.equal(googleReq.id_token, 'google_oauth2_id_token_xyz');
      assert.equal(tokenRes.token_type, 'bearer');
      assert.equal(userRes.full_name, 'Hà Đăng Huy');
      assert.deepEqual(profileUpd.dietary_preferences, { vegetarian: false, allergies: ['peanuts'] });
    });
  });

  describe('Event Contracts', () => {
    it('validates EventScope, BudgetTier, EventRole, total_budget and dietary_notes', () => {
      const scope: EventScope = 'VACATION';
      const budget: BudgetTier = 'MODERATE';
      const role: EventRole = 'HOST';

      const createReq: EventCreateRequest = {
        name: 'Chuyến đi Hà Nội 1 ngày',
        scope: 'DAY_HANGOUT',
        destination: 'Hà Nội',
        budget_tier: 'BUDGET',
        total_budget: '3500000',
        start_date: '2026-10-15T08:00:00Z',
        end_date: '2026-10-15T20:00:00Z',
      };

      const eventRes: EventResponse = {
        id: 'evt_001',
        name: createReq.name,
        description: null,
        type: 'TRAVEL',
        scope: 'DAY_HANGOUT',
        location: null,
        destination: 'Hà Nội',
        budget_tier: 'BUDGET',
        total_budget: '3500000',
        start_date: createReq.start_date,
        end_date: createReq.end_date,
        macro_locked: false,
        final_locked: false,
        created_by: 'usr_001',
        created_at: '2026-10-13T09:00:00Z',
        updated_at: '2026-10-13T09:00:00Z',
      };

      const updateReq: EventUpdateRequest = {
        name: 'Hà Nội Nắng Đẹp',
        total_budget: '4000000',
        macro_locked: true,
      };

      const member: EventMemberResponse = {
        id: 'mem_001',
        event_id: 'evt_001',
        user_id: 'usr_001',
        role,
        dietary_notes: 'Không ăn cay',
      };

      assert.equal(scope, 'VACATION');
      assert.equal(budget, 'MODERATE');
      assert.equal(eventRes.total_budget, '3500000');
      assert.equal(updateReq.macro_locked, true);
      assert.equal(member.dietary_notes, 'Không ăn cay');
    });
  });

  describe('Plan, Dish Recommendations & Versioning Contracts', () => {
    it('validates PlanResponse, PlanStopResponse, RecommendedDishItem, and PlanVoteResponse', () => {
      const timeSlot: TimeSlot = 'MORNING';
      const transportMode: TransportMode = 'WALKING';
      const stopStatus: StopStatus = 'INITIAL_PROPOSED';

      const dish: RecommendedDishItem = {
        dish_name: 'Mì Quảng ếch',
        estimated_price: '60000',
        tags: ['Đặc sản', 'Không cay'],
        dietary_match: true,
      };

      const stop: PlanStopResponse = {
        id: 'stop_001',
        plan_id: 'plan_001',
        order: 1,
        order_index: 1,
        day_number: 1,
        time_slot: timeSlot,
        place_name: 'Bếp Cuốn',
        place_ref_id: 'ChIJxyz123',
        lat: 16.0544,
        lng: 108.2478,
        note: 'Ăn trưa đặc sản',
        estimated_cost: '150000',
        category: 'RESTAURANT',
        start_time: '2026-12-20T12:00:00Z',
        duration_minutes: 60,
        transport_mode: transportMode,
        transit_duration_minutes: 10,
        transit_distance_km: 0.75,
        transit_cost: '0',
        stop_status: stopStatus,
        is_initial_stop: true,
        is_finalized_stop: false,
        replaced_by_stop_id: null,
        change_reason: null,
        locked_at: null,
        metadata: null,
        up_votes: 3,
        down_votes: 0,
        recommended_dishes: [dish],
        candidate_options: null,
        selected_candidate_id: 'cand_001',
        backup_options: [
          {
            option_index: 2,
            place_name: 'Quán Cafe View Hồ',
            place_ref_id: 'ChIJcafe123',
            category: 'CAFE',
            estimated_cost: 40000,
            distance_km: 0.3,
          },
        ],
      };

      const plan: PlanResponse = {
        id: 'plan_001',
        event_id: 'evt_001',
        title: 'Lịch trình Đà Nẵng',
        version_number: 1,
        parent_plan_id: null,
        is_active: true,
        change_summary: null,
        locked_at: null,
        total_budget: '3000000',
        status: 'VOTING',
        is_ai_generated: true,
        created_by_id: 'usr_001',
        created_at: '2026-10-13T09:00:00Z',
        macro_roadmap: [{ day: 1, theme: 'Khám phá trung tâm' }],
        stops: [stop],
        macro_locked: true,
        final_locked: false,
      };

      const vote: PlanVoteResponse = {
        id: 'vote_001',
        stop_id: 'stop_001',
        user_id: 'usr_001',
        candidate_id: 'cand_001',
        candidate_name: 'Bếp Cuốn',
        value: null,
        comment: 'Đồng ý',
        created_at: '2026-10-13T09:00:00Z',
      };

      assert.equal(plan.stops[0].recommended_dishes?.[0].dish_name, 'Mì Quảng ếch');
      assert.equal(vote.candidate_id, 'cand_001');
    });

    it('validates PlanCloneRequest, PlanGenerateRequest, StopDishesResponse & PlanStageHistoryResponse', () => {
      const cloneReq: PlanCloneRequest = {
        target_status: 'FINALIZED',
        change_summary: 'Chốt v2',
      };
      const genReq: PlanGenerateRequest = {
        destination: 'Đà Nẵng',
        start_date: '2026-12-20',
        end_date: '2026-12-22',
        budget_tier: 'MODERATE',
      };
      const dishesRes: StopDishesResponse = {
        stop_id: 'stop_001',
        place_name: 'Bếp Cuốn',
        recommended_dishes: [],
        dietary_notes_applied: ['Nam: Ăn chay'],
      };
      const versionSummary: PlanVersionSummary = {
        id: 'plan_002',
        version_number: 2,
        parent_plan_id: 'plan_001',
        status: 'FINALIZED',
        is_active: true,
        total_budget: '5000000',
        change_summary: 'Chốt v2',
        locked_at: '2026-10-13T10:00:00Z',
        created_at: '2026-10-13T10:00:00Z',
      };
      const history: PlanStageHistoryResponse = {
        plan_id: 'plan_002',
        event_id: 'evt_001',
        version_number: 2,
        current_status: 'FINALIZED',
        version_chain: [versionSummary],
        initial_stops: [],
        finalized_stops: [],
        ongoing_stops: [],
        rejected_or_skipped_stops: [],
      };

      assert.equal(cloneReq.target_status, 'FINALIZED');
      assert.equal(genReq.destination, 'Đà Nẵng');
      assert.equal(dishesRes.dietary_notes_applied.length, 1);
      assert.equal(history.version_chain?.[0].version_number, 2);
    });
  });

  describe('Places & POI Contracts', () => {
    it('validates POIItem, PlaceSearchResponse & PlaceDetailResponse', () => {
      const poi: POIItem = {
        place_id: 'ChIJxyz123_ho_xuan_huong',
        name: 'Hồ Xuân Hương',
        address: 'Phường 1, Đà Lạt',
        lat: 11.9465,
        lng: 108.4419,
        category: 'ATTRACTION',
        rating: 4.6,
        user_ratings_total: 1250,
        price_level: 0,
        open_now: true,
      };
      const searchRes: PlaceSearchResponse = { results: [poi], total: 1, provider: 'google_places' };
      const detailRes: PlaceDetailResponse = { place: poi, provider: 'google_places' };

      assert.equal(searchRes.total, 1);
      assert.equal(detailRes.place.place_id, poi.place_id);
    });
  });

  describe('Chat Contracts', () => {
    it('validates ChatMessageType, ChatMessageCreateRequest, Response & ListResponse', () => {
      const chatRole: ChatRole = 'USER';
      const msgType: ChatMessageType = 'AGENT_QA';
      const createMsg: ChatMessageCreateRequest = {
        content: 'Quán này có món chay không?',
        role: chatRole,
        message_type: msgType,
        metadata: { target_stop_id: 'stop_001' },
      };

      const msgRes: ChatMessageResponse = {
        id: 'msg_001',
        event_id: 'evt_001',
        user_id: 'usr_001',
        role: 'USER',
        message_type: msgType,
        content: createMsg.content,
        metadata: createMsg.metadata,
        created_at: '2026-10-13T09:00:00Z',
      };

      const listRes: ChatMessageListResponse = {
        messages: [msgRes],
        total: 1,
        has_more: false,
      };

      assert.equal(msgRes.message_type, 'AGENT_QA');
      assert.equal(listRes.total, 1);
    });
  });
});
