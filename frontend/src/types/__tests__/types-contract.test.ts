// DTO Contract Parity Test Suite for TripMate AI Sprint 0 & Supervisor Feedback
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  MacroLockRequest,
  MacroLockResponse,
  StopVoteRequest,
  StopVoteResponse,
  StopSwapRequest,
  StopSwapResponse,
  FinalLockRequest,
  FinalLockResponse,
  StopAdaptationRequest,
  StopAdaptationResponse,
  BackupOption,
  RoadmapTheme,
} from '../consensus.ts';
import type {
  EventScope,
  EventType,
  EventRole,
  BudgetTier,
  EventResponse,
  EventCreateRequest,
  EventUpdateRequest,
  EventMemberResponse,
  InvitationResponse,
} from '../event.ts';
import type {
  LoginRequest,
  RegisterRequest,
  GoogleLoginRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserResponse,
} from '../auth.ts';
import type {
  PlanResponse,
  PlanStopResponse,
  PlanVoteResponse,
  PlanStageHistoryResponse,
  TimeSlot,
  StopCategory,
  TransportMode,
  StopStatus,
} from '../plan.ts';
import type {
  ChatRole,
  ChatMessageCreateRequest,
  ChatMessageResponse,
} from '../chat.ts';
import type {
  POIItem,
  PlaceSearchResponse,
  PlaceDetailResponse,
  PlaceSearchParams,
} from '../place.ts';

describe('TypeScript DTO Contract Parity Suite', () => {
  describe('Module Existence and Runtime Exports', () => {
    it('verifies consensus.ts module exists and exports constants', async () => {
      const consensusModule = await import('../consensus.ts');
      assert.ok(consensusModule);
      assert.equal(consensusModule.MAX_BACKUP_OPTIONS, 2);
    });

    it('verifies place.ts and plan.ts types are accessible', async () => {
      const placeModule = await import('../place.ts');
      const planModule = await import('../plan.ts');
      assert.ok(placeModule);
      assert.ok(planModule);
    });
  });

  describe('Consensus Contracts (api-design-guide Section 3)', () => {
    it('validates MacroLockResponse and MacroLockRequest conforming to Section 3.1', () => {
      const macroReq: MacroLockRequest = {
        macro_locked: true,
      };

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
      assert.equal(macroLock.roadmap_themes[0].day, 1);
    });

    it('validates StopVoteRequest & StopVoteResponse shape conforming to Section 3.2', () => {
      const voteReq: StopVoteRequest = {
        vote_value: 'DOWN',
        comment: 'Quán này đông và ồn quá',
      };

      const backup: BackupOption = {
        place_name: 'The Espresso Station',
        place_ref_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
        category: 'CAFE',
        estimated_cost: 45000,
        distance_km: 0.4,
      };

      const voteRes: StopVoteResponse = {
        stop_id: 'stop_cafe_001',
        up_votes: 2,
        down_votes: 3,
        recommend_swap: true,
        backup_options: [backup],
      };

      assert.equal(voteReq.vote_value, 'DOWN');
      assert.equal(voteRes.recommend_swap, true);
      assert.equal(voteRes.backup_options.length, 1);
      assert.equal(voteRes.backup_options[0].place_name, 'The Espresso Station');
    });

    it('validates StopSwapRequest & StopSwapResponse shape conforming to Section 3.3', () => {
      const swapReq: StopSwapRequest = {
        target_backup_place_ref_id: 'ChIJN1t_tDeuEmsRUsoyG83frY4',
      };

      const swapRes: StopSwapResponse = {
        swapped_stop_id: 'stop_cafe_001',
        new_place_name: 'The Espresso Station',
        category: 'CAFE',
        lat: 16.0682,
        lng: 108.2235,
        updated_at: '2026-09-22T14:45:00Z',
      };

      assert.equal(swapReq.target_backup_place_ref_id, 'ChIJN1t_tDeuEmsRUsoyG83frY4');
      assert.equal(swapRes.new_place_name, 'The Espresso Station');
      assert.equal(swapRes.category, 'CAFE');
    });

    it('validates FinalLockResponse shape conforming to Section 2 & 3', () => {
      const finalRes: FinalLockResponse = {
        event_id: 'evt_da_nang_2026',
        final_locked: true,
        locked_at: '2026-09-22T15:00:00Z',
        total_stops: 9,
        total_budget: '5500000',
      };

      assert.equal(finalRes.final_locked, true);
      assert.equal(finalRes.total_stops, 9);
      assert.equal(finalRes.total_budget, '5500000');
    });

    it('validates StopAdaptationRequest & StopAdaptationResponse shape conforming to Section 3.4', () => {
      const adaptReq: StopAdaptationRequest = {
        place_name: 'Bảo tàng Điêu khắc Chăm (Tránh mưa)',
        place_ref_id: 'ChIJChamMuseum',
        note: 'Trời mưa to, chuyển từ bãi biển sang bảo tàng trong nhà',
      };

      const adaptRes: StopAdaptationResponse = {
        stop_id: 'stop_beach_001',
        place_name: adaptReq.place_name,
        place_ref_id: adaptReq.place_ref_id,
        note: adaptReq.note,
        updated_at: '2026-09-22T16:00:00Z',
      };

      assert.equal(adaptRes.place_name, 'Bảo tàng Điêu khắc Chăm (Tránh mưa)');
      assert.equal(adaptRes.place_ref_id, 'ChIJChamMuseum');
    });
  });

  describe('Auth Contracts (api-design-guide Section 2)', () => {
    it('validates ForgotPasswordRequest & ResetPasswordRequest shapes', () => {
      const forgotReq: ForgotPasswordRequest = {
        email: 'user@tripmate.ai',
      };

      const resetReq: ResetPasswordRequest = {
        token: 'valid_reset_token_123',
        new_password: 'StrongPassword123!',
      };

      assert.equal(forgotReq.email, 'user@tripmate.ai');
      assert.equal(resetReq.token, 'valid_reset_token_123');
    });

    it('validates LoginRequest, GoogleLoginRequest, TokenResponse, and UserResponse shapes', () => {
      const loginReq: LoginRequest = {
        email: 'hadanghuy@tripmate.ai',
        password: 'SecurePassword@123',
      };

      const googleReq: GoogleLoginRequest = {
        id_token: 'google_oauth2_id_token_xyz',
      };

      const tokenRes: TokenResponse = {
        access_token: 'jwt_access_token_abc',
        token_type: 'bearer',
        expires_in: 900,
        refresh_token: 'jwt_refresh_token_xyz',
      };

      const userRes: UserResponse = {
        id: 'usr_001',
        email: 'hadanghuy@tripmate.ai',
        full_name: 'Hà Đăng Huy',
        avatar_url: null,
        phone_number: null,
        status: 'ACTIVE',
        created_at: '2026-10-13T09:00:00Z',
      };

      assert.equal(loginReq.email, 'hadanghuy@tripmate.ai');
      assert.equal(googleReq.id_token, 'google_oauth2_id_token_xyz');
      assert.equal(tokenRes.token_type, 'bearer');
      assert.equal(tokenRes.expires_in, 900);
      assert.equal(userRes.full_name, 'Hà Đăng Huy');
    });
  });

  describe('Event Contracts (database-schema Section 1 & 3)', () => {
    it('validates EventScope, BudgetTier, and EventRole union types', () => {
      const scope: EventScope = 'VACATION';
      const budget: BudgetTier = 'MODERATE';
      const role: EventRole = 'HOST';

      assert.equal(scope, 'VACATION');
      assert.equal(budget, 'MODERATE');
      assert.equal(role, 'HOST');
    });

    it('validates EventResponse, EventCreateRequest, and EventUpdateRequest', () => {
      const createReq: EventCreateRequest = {
        name: 'Chuyến đi Hà Nội 1 ngày',
        scope: 'DAY_HANGOUT',
        destination: 'Hà Nội',
        budget_tier: 'BUDGET',
        start_date: '2026-10-15',
        end_date: '2026-10-15',
      };

      const eventRes: EventResponse = {
        id: 'evt_001',
        name: createReq.name,
        scope: createReq.scope,
        destination: 'Hà Nội',
        budget_tier: 'BUDGET',
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
        macro_locked: true,
      };

      assert.equal(eventRes.scope, 'DAY_HANGOUT');
      assert.equal(eventRes.destination, 'Hà Nội');
      assert.equal(eventRes.budget_tier, 'BUDGET');
      assert.equal(eventRes.created_by, 'usr_001');
      assert.equal(updateReq.macro_locked, true);
    });
  });

  describe('Plan Contracts (Supervisor Feedback Items 2.1 - 2.5)', () => {
    it('validates PlanResponse and PlanStopResponse with transit attributes and non-destructive lifecycle', () => {
      const timeSlot: TimeSlot = 'MORNING';
      const transportMode: TransportMode = 'WALKING';
      const stopStatus: StopStatus = 'INITIAL_PROPOSED';

      const stop: PlanStopResponse = {
        id: 'stop_001',
        plan_id: 'plan_001',
        order: 1,
        order_index: 1,
        day_number: 1,
        time_slot: timeSlot,
        place_name: 'Hồ Xuân Hương',
        place_ref_id: 'ChIJxyz123',
        lat: 11.9465,
        lng: 108.4419,
        note: 'Chụp hình bình minh',
        estimated_cost: '0',
        category: 'ATTRACTION',
        start_time: '2026-12-20T07:00:00Z',
        duration_minutes: 60,
        // Item 2.4 transit attributes
        transport_mode: transportMode,
        transit_duration_minutes: 10,
        transit_distance_km: 0.75,
        transit_cost: '0',
        // Item 2.5 lifecycle tracking
        stop_status: stopStatus,
        is_initial_stop: true,
        is_finalized_stop: true,
        replaced_by_stop_id: null,
        change_reason: null,
        locked_at: '2026-10-13T10:00:00Z',
        metadata: null,
        up_votes: 3,
        down_votes: 0,
        backup_options: [
          {
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
        title: 'Lịch trình Đà Lạt',
        version_number: 1,
        parent_plan_id: null,
        is_active: true,
        change_summary: null,
        locked_at: null,
        total_budget: '3000000',
        status: 'DRAFT',
        is_ai_generated: false,
        created_by_id: 'usr_001',
        created_at: '2026-10-13T09:00:00Z',
        macro_roadmap: [
          { day: 1, theme: 'Khám phá trung tâm' },
        ],
        stops: [stop],
        macro_locked: false,
        final_locked: false,
      };

      const vote: PlanVoteResponse = {
        id: 'vote_001',
        stop_id: 'stop_001',
        user_id: 'usr_001',
        value: 'UP',
        comment: 'Đồng ý',
        created_at: '2026-10-13T09:00:00Z',
      };

      assert.equal(plan.stops.length, 1);
      assert.equal(plan.version_number, 1);
      assert.equal(plan.stops[0].transport_mode, 'WALKING');
      assert.equal(plan.stops[0].transit_duration_minutes, 10);
      assert.equal(plan.stops[0].transit_distance_km, 0.75);
      assert.equal(plan.stops[0].transit_cost, '0');
      assert.equal(plan.stops[0].is_initial_stop, true);
      assert.equal(plan.stops[0].is_finalized_stop, true);
      assert.equal(plan.stops[0].stop_status, 'INITIAL_PROPOSED');
      assert.equal(vote.stop_id, 'stop_001');
    });

    it('validates PlanStageHistoryResponse contract for 4 stages', () => {
      const history: PlanStageHistoryResponse = {
        plan_id: 'plan_001',
        event_id: 'evt_001',
        version_number: 1,
        current_status: 'ONGOING',
        initial_stops: [],
        finalized_stops: [],
        ongoing_stops: [],
        rejected_or_skipped_stops: [],
      };

      assert.equal(history.plan_id, 'plan_001');
      assert.equal(history.version_number, 1);
      assert.equal(history.current_status, 'ONGOING');
      assert.ok(Array.isArray(history.initial_stops));
      assert.ok(Array.isArray(history.finalized_stops));
      assert.ok(Array.isArray(history.ongoing_stops));
      assert.ok(Array.isArray(history.rejected_or_skipped_stops));
    });
  });

  describe('Places & POI Contracts (api-design-guide Section 2 & TASK-108)', () => {
    it('validates POIItem shape with Google Places v1 core fields', () => {
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
        photo_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
        website_uri: 'https://dalat.gov.vn',
        phone_number: '+84 263 3822 000',
        metadata: { tags: ['scenic', 'romantic'] },
      };

      assert.equal(poi.place_id, 'ChIJxyz123_ho_xuan_huong');
      assert.equal(poi.name, 'Hồ Xuân Hương');
      assert.equal(poi.price_level, 0);
      assert.equal(poi.open_now, true);
      assert.equal(poi.rating, 4.6);
    });

    it('validates PlaceSearchResponse and PlaceDetailResponse shapes', () => {
      const searchRes: PlaceSearchResponse = {
        results: [
          {
            place_id: 'ChIJ_abc',
            name: 'Quán Bún Bò Bà Hồng',
            category: 'RESTAURANT',
            rating: 4.4,
            price_level: 1,
          },
        ],
        total: 1,
        provider: 'google_places',
      };

      const detailRes: PlaceDetailResponse = {
        place: {
          place_id: 'ChIJ_abc',
          name: 'Quán Bún Bò Bà Hồng',
          category: 'RESTAURANT',
          rating: 4.4,
          price_level: 1,
        },
        provider: 'google_places',
      };

      assert.equal(searchRes.total, 1);
      assert.equal(searchRes.provider, 'google_places');
      assert.equal(searchRes.results[0].name, 'Quán Bún Bò Bà Hồng');
      assert.equal(detailRes.place.place_id, 'ChIJ_abc');
    });
  });

  describe('Chat Contracts (api-design-guide Section 2)', () => {
    it('validates ChatMessageResponse and ChatMessageCreateRequest shapes', () => {
      const chatRole: ChatRole = 'USER';
      const createMsg: ChatMessageCreateRequest = {
        content: 'Tôi muốn thêm quán cafe view đẹp',
        role: chatRole,
      };

      const msgRes: ChatMessageResponse = {
        id: 'msg_001',
        event_id: 'evt_001',
        user_id: 'usr_001',
        role: 'USER',
        content: createMsg.content,
        created_at: '2026-10-13T09:00:00Z',
      };

      assert.equal(msgRes.content, 'Tôi muốn thêm quán cafe view đẹp');
      assert.equal(msgRes.role, 'USER');
      assert.equal(msgRes.event_id, 'evt_001');
    });
  });
});
