// DTO Contract Parity Test Suite for TripMate AI Sprint 0
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
  TimeSlot,
  StopCategory,
} from '../plan.ts';
import type {
  ChatRole,
  ChatMessageCreateRequest,
  ChatMessageResponse,
} from '../chat.ts';

describe('TypeScript DTO Contract Parity Suite', () => {
  describe('Module Existence and Runtime Exports', () => {
    it('verifies consensus.ts module exists and exports constants', async () => {
      const consensusModule = await import('../consensus.ts');
      assert.ok(consensusModule);
      assert.equal(consensusModule.MAX_BACKUP_OPTIONS, 2);
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
      assert.equal(voteRes.backup_options[0].category, 'CAFE');
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
        updated_at: '2026-09-22T14:32:10Z',
      };

      assert.equal(swapReq.target_backup_place_ref_id, 'ChIJN1t_tDeuEmsRUsoyG83frY4');
      assert.equal(swapRes.new_place_name, 'The Espresso Station');
      assert.equal(swapRes.lat, 16.0682);
    });

    it('validates FinalLockResponse shape conforming to Section 2 & 3', () => {
      const finalReq: FinalLockRequest = {
        final_locked: true,
      };

      const finalLock: FinalLockResponse = {
        event_id: 'evt_001',
        final_locked: true,
        locked_at: '2026-09-22T15:00:00Z',
        total_stops: 8,
        total_budget: '5000000',
      };

      assert.equal(finalReq.final_locked, true);
      assert.equal(finalLock.final_locked, true);
      assert.equal(finalLock.total_stops, 8);
    });

    it('validates StopAdaptationRequest & StopAdaptationResponse shape conforming to Section 3.4', () => {
      const adaptReq: StopAdaptationRequest = {
        place_name: 'Artisan Indoor Boardgame Cafe',
        place_ref_id: 'ChIJsW8gV3SuEmsReD345g83frY4',
        note: 'Đổi điểm ngẫu hứng do trời mưa to',
      };

      const adaptRes: StopAdaptationResponse = {
        stop_id: 'stop_001',
        place_name: 'Artisan Indoor Boardgame Cafe',
        place_ref_id: 'ChIJsW8gV3SuEmsReD345g83frY4',
        note: 'Đổi điểm ngẫu hứng do trời mưa to',
        updated_at: '2026-09-22T16:00:00Z',
      };

      assert.equal(adaptReq.place_name, adaptRes.place_name);
      assert.equal(adaptRes.stop_id, 'stop_001');
    });
  });

  describe('Auth Contracts (api-design-guide Section 2)', () => {
    it('validates ForgotPasswordRequest & ResetPasswordRequest shapes', () => {
      const forgotReq: ForgotPasswordRequest = {
        email: 'hadanghuy@example.com',
      };

      const resetReq: ResetPasswordRequest = {
        token: 'token_reset_123',
        new_password: 'NewStrongPassword123!',
      };

      assert.equal(forgotReq.email, 'hadanghuy@example.com');
      assert.equal(resetReq.token, 'token_reset_123');
    });

    it('validates LoginRequest, GoogleLoginRequest, TokenResponse, and UserResponse shapes', () => {
      const loginReq: LoginRequest = {
        email: 'hadanghuy@example.com',
        password: 'password123',
      };

      const googleReq: GoogleLoginRequest = {
        id_token: 'google_oauth2_id_token_xyz',
      };

      const tokenRes: TokenResponse = {
        access_token: 'jwt_mock_token',
        token_type: 'bearer',
        refresh_token: 'refresh_mock_token',
      };

      const userRes: UserResponse = {
        id: 'usr_001',
        email: 'hadanghuy@example.com',
        full_name: 'Hà Đăng Huy',
        avatar_url: null,
        provider: 'LOCAL',
        role: 'USER',
        created_at: '2026-10-13T08:00:00Z',
        updated_at: '2026-10-13T08:00:00Z',
      };

      assert.equal(loginReq.email, userRes.email);
      assert.equal(googleReq.id_token, 'google_oauth2_id_token_xyz');
      assert.equal(tokenRes.token_type, 'bearer');
      assert.equal(tokenRes.refresh_token, 'refresh_mock_token');
      assert.equal(userRes.updated_at, '2026-10-13T08:00:00Z');
    });
  });

  describe('Event Contracts (database-schema Section 1 & 3)', () => {
    it('validates EventScope, BudgetTier, and EventRole union types', () => {
      const dayHangout: EventScope = 'DAY_HANGOUT';
      const vacation: EventScope = 'VACATION';
      const budget: BudgetTier = 'BUDGET';
      const hostRole: EventRole = 'HOST';

      assert.equal(dayHangout, 'DAY_HANGOUT');
      assert.equal(vacation, 'VACATION');
      assert.equal(budget, 'BUDGET');
      assert.equal(hostRole, 'HOST');
    });

    it('validates EventResponse, EventCreateRequest, and EventUpdateRequest', () => {
      const createReq: EventCreateRequest = {
        name: 'Hà Nội Một Ngày Mưa',
        scope: 'DAY_HANGOUT',
        type: 'HANGOUT',
        location: 'Hà Nội',
        destination: 'Hà Nội',
        budget_tier: 'BUDGET',
        start_date: '2026-10-15T08:00:00Z',
        end_date: '2026-10-15T18:00:00Z',
      };

      const eventRes: EventResponse = {
        id: 'evt_001',
        name: createReq.name,
        description: null,
        type: 'HANGOUT',
        scope: 'DAY_HANGOUT',
        location: 'Hà Nội',
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

  describe('Plan Contracts (database-schema Section 1 & plan_stops)', () => {
    it('validates PlanResponse and PlanStopResponse with backup_options, time_slot, and day_number', () => {
      const timeSlot: TimeSlot = 'MORNING';
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
      assert.equal(plan.stops[0].day_number, 1);
      assert.equal(plan.stops[0].time_slot, 'MORNING');
      assert.equal(plan.stops[0].up_votes, 3);
      assert.equal(plan.stops[0].backup_options?.[0].category, 'CAFE');
      assert.equal(plan.macro_roadmap?.[0].theme, 'Khám phá trung tâm');
      assert.equal(vote.stop_id, 'stop_001');
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
