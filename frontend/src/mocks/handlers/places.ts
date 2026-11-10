import { http, HttpResponse } from 'msw';
import type {
  POIItem,
  PlaceSearchResponse,
  PlaceDetailResponse,
} from '../../types/place.ts';

/**
 * MSW Mock Handlers for Google Places & POI APIs (TASK-108 & TASK-004).
 * Endpoints follow api-design-guide.md Section 2:
 * - GET /api/v1/places/search
 * - GET /api/v1/places/:placeId/details
 * - GET /api/v1/places/hotels/compare
 */

export const mockPlaces: POIItem[] = [
  {
    place_id: 'ChIJxyz123_ho_xuan_huong',
    name: 'Hồ Xuân Hương',
    address: 'Phường 1, Thành phố Đà Lạt, Lâm Đồng',
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
    metadata: {
      tags: ['lake', 'walking', 'scenic', 'romantic'],
      vicinity: 'Trung tâm Đà Lạt',
    },
  },
  {
    place_id: 'ChIJabc456_bun_bo_ba_hong',
    name: 'Quán Bún Bò Huế Bà Hồng',
    address: 'Hẻm 30 Nhà Chung, Phường 3, Thành phố Đà Lạt, Lâm Đồng',
    lat: 11.9404,
    lng: 108.4383,
    category: 'RESTAURANT',
    rating: 4.4,
    user_ratings_total: 480,
    price_level: 1,
    open_now: true,
    photo_url: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43',
    website_uri: null,
    phone_number: '+84 908 123 456',
    metadata: {
      tags: ['breakfast', 'local_food', 'noodles'],
      specialty: 'Bún bò giò heo',
    },
  },
  {
    place_id: 'ChIJdef789_dinh_bao_dai',
    name: 'Dinh Bảo Đại (Dinh III)',
    address: '1 Triệu Việt Vương, Phường 4, Thành phố Đà Lạt, Lâm Đồng',
    lat: 11.9335,
    lng: 108.4267,
    category: 'ATTRACTION',
    rating: 4.3,
    user_ratings_total: 890,
    price_level: 1,
    open_now: true,
    photo_url: 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62',
    website_uri: 'https://dinhbaodai.vn',
    phone_number: '+84 263 3822 493',
    metadata: {
      tags: ['historical', 'palace', 'museum', 'architecture'],
      ticket_price_vnd: 50000,
    },
  },
  {
    place_id: 'ChIJghi012_monarque_hotel',
    name: 'Monarque Hotel Da Nang',
    address: '238 Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng',
    lat: 16.0658,
    lng: 108.2432,
    category: 'HOTEL',
    rating: 4.8,
    user_ratings_total: 2150,
    price_level: 2,
    open_now: true,
    photo_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945',
    website_uri: 'https://monarquehotel.com.vn',
    phone_number: '+84 236 3584 888',
    metadata: {
      tags: ['sea_view', 'rooftop_pool', 'afternoon_tea'],
      star_rating: 4,
    },
  },
];

export const placeHandlers = [
  // GET /api/v1/places/search
  http.get('/api/v1/places/search', ({ request }) => {
    const url = new URL(request.url);
    const keyword = url.searchParams.get('keyword')?.toLowerCase();
    const category = url.searchParams.get('category')?.toUpperCase();

    let filtered = [...mockPlaces];

    if (keyword) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(keyword) ||
          p.address?.toLowerCase().includes(keyword)
      );
    }

    if (category) {
      filtered = filtered.filter((p) => p.category?.toUpperCase() === category);
    }

    const responseData: PlaceSearchResponse = {
      results: filtered,
      total: filtered.length,
      provider: 'google_places',
    };

    return HttpResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  }),

  // GET /api/v1/places/:placeId/details
  http.get('/api/v1/places/:placeId/details', ({ params }) => {
    const placeId = params.placeId as string;
    const found = mockPlaces.find((p) => p.place_id === placeId);

    if (!found) {
      return HttpResponse.json(
        {
          success: false,
          error: {
            code: 'PLACE_NOT_FOUND',
            message: `Không tìm thấy thông tin cho địa điểm với ID: ${placeId}`,
            details: null,
          },
        },
        { status: 404 }
      );
    }

    const responseData: PlaceDetailResponse = {
      place: found,
      provider: 'google_places',
    };

    return HttpResponse.json(
      {
        success: true,
        data: responseData,
      },
      { status: 200 }
    );
  }),

  // GET /api/v1/places/hotels/compare (Stub for Sprint 2)
  http.get('/api/v1/places/hotels/compare', () => {
    return HttpResponse.json(
      {
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Endpoint compare_hotels is not implemented yet.',
          details: null,
        },
      },
      { status: 501 }
    );
  }),
];
