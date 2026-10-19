import { http, HttpResponse } from 'msw';
import type {
  UserResponse,
  LoginRequest,
  RegisterRequest,
  UserUpdateRequest,
} from '../../types/auth.ts';

/**
 * MSW Mock Handlers for Auth & User APIs.
 * Endpoints follow api-design-guide.md Section 2 & 3.
 * Response format follows api-design-guide.md Section 4.
 */

let mockUser: UserResponse = {
  id: 'usr_001',
  email: 'hadanghuy@example.com',
  full_name: 'Hà Đăng Huy',
  avatar_url: null,
  provider: 'LOCAL',
  role: 'USER',
  created_at: '2024-12-01T08:00:00Z',
  updated_at: '2024-12-01T08:00:00Z',
};

export const authHandlers = [
  // POST /api/v1/auth/login
  http.post('/api/v1/auth/login', async ({ request }) => {
    const body = (await request.json()) as LoginRequest;

    if (!body.email || !body.password) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Email hoặc mật khẩu không hợp lệ',
            details: null,
          },
        },
        { status: 400 },
      );
    }

    return HttpResponse.json(
      {
        success: true,
        data: {
          access_token: `mock-jwt-token-for-${encodeURIComponent(body.email)}`,
          token_type: 'bearer',
          refresh_token: 'mock-refresh-token-12345',
        },
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/auth/login/google
  http.post('/api/v1/auth/login/google', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          access_token: 'mock-google-jwt-token',
          token_type: 'bearer',
          refresh_token: 'mock-google-refresh-token',
        },
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/auth/login/facebook
  http.post('/api/v1/auth/login/facebook', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          access_token: 'mock-facebook-jwt-token',
          token_type: 'bearer',
          refresh_token: 'mock-facebook-refresh-token',
        },
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/auth/register
  http.post('/api/v1/auth/register', async ({ request }) => {
    const body = (await request.json()) as RegisterRequest;

    if (!body.email || !body.password || !body.full_name) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Vui lòng cung cấp đầy đủ thông tin đăng ký',
            details: null,
          },
        },
        { status: 422 },
      );
    }

    mockUser = {
      ...mockUser,
      id: `usr_${Date.now()}`,
      email: body.email,
      full_name: body.full_name,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      {
        success: true,
        data: {
          access_token: `mock-jwt-for-${encodeURIComponent(body.email)}`,
          token_type: 'bearer',
          refresh_token: 'mock-refresh-token-registered',
        },
      },
      { status: 201 },
    );
  }),

  // POST /api/v1/auth/forgot-password
  http.post('/api/v1/auth/forgot-password', () => {
    return HttpResponse.json(
      {
        success: true,
        data: { message: 'Password reset link sent to email' },
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/auth/reset-password
  http.post('/api/v1/auth/reset-password', () => {
    return HttpResponse.json(
      {
        success: true,
        data: { message: 'Password reset successfully' },
      },
      { status: 200 },
    );
  }),

  // POST /api/v1/auth/refresh-token
  http.post('/api/v1/auth/refresh-token', () => {
    return HttpResponse.json(
      {
        success: true,
        data: {
          access_token: 'mock-jwt-refreshed-token',
          token_type: 'bearer',
          refresh_token: 'mock-refreshed-refresh-token',
        },
      },
      { status: 200 },
    );
  }),

  // GET /api/v1/users/me
  http.get('/api/v1/users/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập', details: null },
        },
        { status: 401 },
      );
    }

    return HttpResponse.json(
      { success: true, data: mockUser },
      { status: 200 },
    );
  }),

  // PATCH /api/v1/users/me
  http.patch('/api/v1/users/me', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return HttpResponse.json(
        {
          success: false,
          error: { code: 'UNAUTHORIZED', message: 'Chưa đăng nhập', details: null },
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as UserUpdateRequest;
    mockUser = {
      ...mockUser,
      ...(body.full_name !== undefined && { full_name: body.full_name ?? '' }),
      ...(body.avatar_url !== undefined && { avatar_url: body.avatar_url }),
      updated_at: new Date().toISOString(),
    };

    return HttpResponse.json(
      { success: true, data: mockUser },
      { status: 200 },
    );
  }),
];
