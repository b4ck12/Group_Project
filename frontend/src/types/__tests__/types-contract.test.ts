// DTO Contract Parity Test Suite for TripMate AI Sprint 0
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import type {
  MacroLockResponse,
  StopVoteRequest,
  StopVoteResponse,
  StopSwapRequest,
  StopSwapResponse,
  FinalLockResponse,
  StopAdaptationRequest,
  StopAdaptationResponse,
  BackupOption,
} from '../consensus.ts';
import type {
  EventScope,
  EventResponse,
  EventCreateRequest,
} from '../event.ts';
import type {
  LoginRequest,
  RegisterRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  TokenResponse,
  UserResponse,
} from '../auth.ts';
import type {
  PlanResponse,
  PlanStopResponse,
  PlanVoteResponse,
} from '../plan.ts';

describe('TypeScript DTO Contract Parity Suite', () => {
  describe('Module Existence and Runtime Exports', () => {
    it('verifies consensus.ts module exists and exports constants', async () => {
      const consensusModule = await import('../consensus.ts');
      assert.ok(consensusModule);
      assert.equal(consensusModule.MAX_BACKUP_OPTIONS, 2);
    });
  });

  describe('Consensus Contracts (api-design-guide Section 3)', () => {
    it('validates MacroLockResponse shape conforming to Section 3.1', () => {
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
      const finalLock: FinalLockResponse = {
        event_id: 'evt_001',
        final_locked: true,
        locked_at: '2026-09-22T15:00:00Z',
        total_stops: 8,
        total_budget: '5000000',
      };

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

    it('validates LoginRequest, TokenResponse, and UserResponse shapes', () => {
      const loginReq: LoginRequest = {
        email: 'hadanghuy@example.com',
        password: 'password123',
      };

      const tokenRes: TokenResponse = {
        access_token: 'jwt_mock_token',
        token_type: 'bearer',
      };

      const userRes: UserResponse = {
        id: 'usr_001',
        email: 'hadanghuy@example.com',
        full_name: 'Hà Đăng Huy',
        avatar_url: null,
        provider: 'LOCAL',
        role: 'USER',
        created_at: '2026-10-13T08:00:00Z',
      };

      assert.equal(loginReq.email, userRes.email);
      assert.equal(tokenRes.token_type, 'bearer');
    });
  });

  describe('Event Contracts (database-schema Section 1 & 3)', () => {
    it('validates EventScope union type supports DAY_HANGOUT and VACATION', () => {
      const dayHangout: EventScope = 'DAY_HANGOUT';
      const vacation: EventScope = 'VACATION';

      assert.equal(dayHangout, 'DAY_HANGOUT');
      assert.equal(vacation, 'VACATION');
    });

    it('validates EventResponse & EventCreateRequest with scope and lock flags', () => {
      const createReq: EventCreateRequest = {
        name: 'Hà Nội Một Ngày Mưa',
        scope: 'DAY_HANGOUT',
        type: 'HANGOUT',
        location: 'Hà Nội',
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
        start_date: createReq.start_date,
        end_date: createReq.end_date,
        macro_locked: false,
        final_locked: false,
        created_at: '2026-10-13T09:00:00Z',
      };

      assert.equal(eventRes.scope, 'DAY_HANGOUT');
      assert.equal(eventRes.macro_locked, false);
      assert.equal(eventRes.final_locked, false);
    });
  });

  describe('Plan Contracts (database-schema Section 1 & plan_stops)', () => {
    it('validates PlanResponse and PlanStopResponse with backup_options', () => {
      const stop: PlanStopResponse = {
        id: 'stop_001',
        plan_id: 'plan_001',
        order: 1,
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
        stops: [stop],
        macro_locked: false,
        final_locked: false,
      };

      assert.equal(plan.stops.length, 1);
      assert.equal(plan.stops[0].backup_options?.[0].category, 'CAFE');
      assert.equal(plan.macro_locked, false);
    });
  });
});
