/* ==========================================================================
   TripMate AI — Comprehensive Mock Data (design/fe_demo)
   Bespoke Editorial Travel Journal System (Kinfolk & Airbnb Luxe)
   ========================================================================== */

const MOCK_EVENT = {
  id: "evt_danang_hoian_2026",
  title: "Đà Nẵng & Hội An (3N2Đ)",
  subtitle: "Chuyến du hành mùa hè cùng nhóm bạn thân",
  scope: "VACATION",
  status: "CURATED_MICRO",
  members_count: 5,
  quorum_target: 4,
  current_agreed: 4,
  members: [
    { id: "u1", name: "Tạ Quang Huy (Host)", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&h=120&fit=crop", role: "HOST" },
    { id: "u2", name: "Nguyễn Minh Đức", avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&h=120&fit=crop", role: "MEMBER" },
    { id: "u3", name: "Hà Đăng Huy", avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop", role: "MEMBER" },
    { id: "u4", name: "Phạm Đình Ánh Dương", avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&h=120&fit=crop", role: "MEMBER" },
    { id: "u5", name: "Đinh Tiến Luân", avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop", role: "MEMBER" },
  ]
};

const MOCK_STOPS_DAY_1 = [
  {
    id: "stop_1",
    day_number: 1,
    time_slot: "MORNING",
    time_display: "08:30 - 09:45",
    duration_mins: 75,
    place_name: "Bánh Mì Phượng Hội An",
    category: "Ẩm Thực Phố Cổ",
    is_hero: false, // Compact Stop
    address: "2B Phan Chu Trinh, Cẩm Châu, Hội An",
    lat: 15.8794,
    lng: 108.3325,
    rating: 4.6,
    cost_estimated: "35.000đ",
    description: "Tiệm bánh mì trứ danh với ổ bánh giòn tan, pate béo ngậy và sốt bơ trứng đặc trưng Hội An.",
    image: "https://thumb.wikimedia.org/wikipedia/commons/thumb/f/fb/B%C3%A1nh_M%C3%AC_Ph%C6%B0%E1%BB%A3ng_%282024%29_-_img_01.jpg/1280px-B%C3%A1nh_M%C3%AC_Ph%C6%B0%E1%BB%A3ng_%282024%29_-_img_01.jpg",
    verified_provider: "Michelin Guide Selected",
    hearts_count: 4,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    ],
    sticky_note: "Huy: Quán đông vào tầm 8h30, nhóm mình nên ghé sớm để có bàn ngồi ăn thong thả nhé!",
    backup_options: [
      {
        place_name: "Bánh Mì Madam Khánh (The Banh Mi Queen)",
        address: "115 Trần Cao Vân, Sơn Phong, Hội An",
        lat: 15.8812,
        lng: 108.3308,
        cost_estimated: "35.000đ",
        rating: 4.7,
        distance_meters: 420,
        image: "https://images.unsplash.com/photo-1626804475297-41608ea09aeb?w=1000&auto=format&fit=crop"
      }
    ],
    transit_to_next: {
      mode: "WALKING",
      duration_mins: 8,
      distance_km: 0.45,
      instructions: "Dạo bộ thong thả qua những ngôi nhà hoa giấy vào trung tâm phố cổ"
    }
  },
  {
    id: "stop_2",
    day_number: 1,
    time_slot: "MORNING",
    time_display: "10:00 - 12:00",
    duration_mins: 120,
    place_name: "Faifo Coffee Rooftop Phố Cổ",
    category: "Cà Phê & Ngắm Cảnh",
    is_hero: true, // Hero Stop (Featured)
    address: "130 Trần Phú, Minh An, Hội An",
    lat: 15.8778,
    lng: 108.3291,
    rating: 4.7,
    cost_estimated: "55.000đ",
    description: "Góc ban công tầng thượng kinh điển ôm trọn vẻ đẹp những mái ngói rêu phong và giàn hoa giấy rực rỡ dưới nắng sớm.",
    image: "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=1000&auto=format&fit=crop",
    verified_provider: "TripAdvisor Top Choice",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    ],
    sticky_note: "Dương: Nhớ lên tầng 3 ngắm phố và chụp ảnh nhé, góc ban công ngoài trời ánh sáng siêu đẹp!",
    backup_options: [
      {
        place_name: "The Hill Station Heritage Cafe",
        address: "321 Nguyễn Thị Minh Khai, Hội An",
        lat: 15.8765,
        lng: 108.3262,
        cost_estimated: "60.000đ",
        rating: 4.6,
        distance_meters: 350,
        image: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1000&auto=format&fit=crop"
      }
    ],
    transit_to_next: {
      mode: "CAR",
      duration_mins: 15,
      distance_km: 2.1,
      instructions: "Đi taxi hoặc Grab về phía bờ biển An Bàng nghỉ trưa"
    }
  },
  {
    id: "stop_3",
    day_number: 1,
    time_slot: "AFTERNOON",
    time_display: "14:30 - 17:30",
    duration_mins: 180,
    place_name: "Bãi Biển An Bàng & The DeckHouse",
    category: "Thư Giãn & Biển",
    is_hero: true, // Hero Stop (Featured)
    address: "Biển An Bàng, Cẩm An, Hội An",
    lat: 15.9126,
    lng: 108.3421,
    rating: 4.8,
    cost_estimated: "120.000đ",
    description: "Bãi biển hoang sơ nằm trong top đẹp nhất châu Á. Nằm dài bên ghế mây, thưởng thức nước dừa mát lành và lắng nghe tiếng sóng vỗ.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop",
    verified_provider: "Top 50 Asia Beaches",
    hearts_count: 4,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    ],
    sticky_note: "Huy: Nước dừa xiêm ở DeckHouse rất tươi, nhóm mình nhớ mang đồ bơi để tắm biển nhé!",
    backup_options: [
      {
        place_name: "Shore Club An Bang Beach",
        address: "Đường Trương Minh Hùng, Hội An",
        lat: 15.9140,
        lng: 108.3440,
        cost_estimated: "150.000đ",
        rating: 4.7,
        distance_meters: 280,
        image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1000&auto=format&fit=crop"
      }
    ],
    transit_to_next: {
      mode: "CAR",
      duration_mins: 12,
      distance_km: 2.3,
      instructions: "Di chuyển về bến sông Hoài ngắm hoàng hôn và ăn tối"
    }
  },
  {
    id: "stop_4",
    day_number: 1,
    time_slot: "EVENING",
    time_display: "18:30 - 21:30",
    duration_mins: 180,
    place_name: "Thả Hoa Đăng Sông Hoài & Chợ Đêm",
    category: "Văn Hóa & Trải Nghiệm Đêm",
    is_hero: true, // Hero Stop (Featured)
    address: "Bến Bạch Đằng, An Hội, Hội An",
    lat: 15.8761,
    lng: 108.3268,
    rating: 4.9,
    cost_estimated: "100.000đ",
    description: "Lên thuyền gỗ mộc mạc, nhẹ nhàng thả những ngọn đèn hoa đăng lung linh cầu chúc an lành giữa dòng sông Hoài thơ mộng.",
    image: "https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=1000&auto=format&fit=crop",
    verified_provider: "Trải Nghiệm Văn Hóa",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    ],
    sticky_note: "Luân: Thuê thuyền gỗ tầm 150k cho cả nhóm 4-5 người chèo 20 phút là đẹp nhất!",
    backup_options: [],
    transit_to_next: null
  }
];

const MOCK_STOPS_DAY_2 = [
  {
    id: "stop_d2_1",
    day_number: 2,
    time_slot: "MORNING",
    time_display: "08:00 - 09:30",
    duration_mins: 90,
    place_name: "Bún Chả Cá 109 Nguyễn Chí Thanh",
    category: "Ẩm Thực Đặc Sản",
    is_hero: false,
    address: "109 Nguyễn Chí Thanh, Hải Châu, Đà Nẵng",
    lat: 16.0712,
    lng: 108.2195,
    rating: 4.6,
    cost_estimated: "40.000đ",
    description: "Tô bún chả cá thu gia truyền thơm ngọt từ bí đỏ, bắp cải và nước dùng thanh mát.",
    image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=1000&auto=format&fit=crop",
    verified_provider: "Ẩm Thực Địa Phương",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
    ],
    sticky_note: null,
    backup_options: [],
    transit_to_next: {
      mode: "CAR",
      duration_mins: 20,
      distance_km: 9.5,
      instructions: "Đi taxi dọc đường ven biển Hoàng Sa lên bán đảo Sơn Trà"
    }
  },
  {
    id: "stop_d2_2",
    day_number: 2,
    time_slot: "MORNING",
    time_display: "10:00 - 12:00",
    duration_mins: 120,
    place_name: "Bán Đảo Sơn Trà & Chùa Linh Ứng",
    category: "Thắng Cảnh Biển & Rừng",
    is_hero: true,
    address: "Bãi Bụt, Bán đảo Sơn Trà, Đà Nẵng",
    lat: 16.1003,
    lng: 108.2764,
    rating: 4.8,
    cost_estimated: "Miễn phí",
    description: "Tượng Phật Bà Quan Âm cao 67m hướng mắt ra vịnh Đà Nẵng trong xanh, bao quanh là rừng nguyên sinh ngút ngàn.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&auto=format&fit=crop",
    verified_provider: "Di Tích Thắng Cảnh",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop"
    ],
    sticky_note: "Đức: Trên đường lên chùa nhớ để ý ngắm những đàn voọc chà vá chân nâu quý hiếm nhé!",
    backup_options: [],
    transit_to_next: {
      mode: "CAR",
      duration_mins: 15,
      distance_km: 7.2,
      instructions: "Trở về khu vực bãi tắm Mỹ Khê nghỉ ngơi và tắm biển"
    }
  },
  {
    id: "stop_d2_3",
    day_number: 2,
    time_slot: "AFTERNOON",
    time_display: "15:00 - 17:30",
    duration_mins: 150,
    place_name: "Biển Mỹ Khê & Trải Nghiệm Chèo SUP",
    category: "Hoạt Động Biển Chiều",
    is_hero: true,
    address: "Võ Nguyên Giáp, Phước Mỹ, Sơn Trà, Đà Nẵng",
    lat: 16.0601,
    lng: 108.2461,
    rating: 4.7,
    cost_estimated: "150.000đ",
    description: "Dạo bước trên bờ cát mịn màng, chèo ván đứng SUP ra ngoài khơi ngắm mặt trời buông xuống sau thành phố.",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop",
    verified_provider: "Bãi Biển Đẹp Nhất Hành Tinh",
    hearts_count: 4,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
    ],
    sticky_note: null,
    backup_options: [],
    transit_to_next: {
      mode: "CAR",
      duration_mins: 10,
      distance_km: 4.1,
      instructions: "Di chuyển đến Chợ Đêm Helio ăn tối và nghe nhạc sống"
    }
  },
  {
    id: "stop_d2_4",
    day_number: 2,
    time_slot: "EVENING",
    time_display: "18:30 - 21:30",
    duration_mins: 180,
    place_name: "Chợ Đêm Helio & Ẩm Thực Đà Nẵng",
    category: "Chợ Đêm & Âm Nhạc",
    is_hero: false,
    address: "Đường 2 Tháng 9, Hải Châu, Đà Nẵng",
    lat: 16.0353,
    lng: 108.2238,
    rating: 4.6,
    cost_estimated: "120.000đ",
    description: "Không gian ẩm thực đường phố sôi động với hải sản nướng mỡ hành, bánh tráng nướng và sân khấu nhạc acoustic ngoài trời.",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1000&auto=format&fit=crop",
    verified_provider: "Điểm Đến Vui Chơi",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
    ],
    sticky_note: null,
    backup_options: [],
    transit_to_next: null
  }
];

const MOCK_STOPS_DAY_3 = [
  {
    id: "stop_d3_1",
    day_number: 3,
    time_slot: "MORNING",
    time_display: "08:30 - 09:45",
    duration_mins: 75,
    place_name: "Mì Quảng Bà Mua (Trần Bình Trọng)",
    category: "Ẩm Thực Đặc Sản",
    is_hero: false,
    address: "19 Trần Bình Trọng, Hải Châu, Đà Nẵng",
    lat: 16.0645,
    lng: 108.2180,
    rating: 4.5,
    cost_estimated: "45.000đ",
    description: "Tô mì quảng tôm thịt gia truyền đậm đà, ăn kèm bánh tráng mè nướng giòn và rổ rau búp tươi non.",
    image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1000&auto=format&fit=crop",
    verified_provider: "Đặc Sản Đà Nẵng",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
    ],
    sticky_note: null,
    backup_options: [],
    transit_to_next: {
      mode: "WALKING",
      duration_mins: 10,
      distance_km: 0.7,
      instructions: "Đi bộ dạo qua bờ sông Hàn ngắm Cầu Rồng"
    }
  },
  {
    id: "stop_d3_2",
    day_number: 3,
    time_slot: "MORNING",
    time_display: "10:00 - 11:30",
    duration_mins: 90,
    place_name: "Cầu Rồng & Cầu Tình Yêu Sông Hàn",
    category: "Biểu Tượng Thành Phố",
    is_hero: true,
    address: "Trần Hưng Đạo, Sơn Trà, Đà Nẵng",
    lat: 16.0610,
    lng: 108.2325,
    rating: 4.8,
    cost_estimated: "Miễn phí",
    description: "Dạo bước trên bến cầu ổ khóa tình yêu lãng mạn bên bờ sông Hàn, chụp hình với biểu tượng rồng vàng vươn biển lớn.",
    image: "https://images.unsplash.com/photo-1528127269322-539801943592?w=1000&auto=format&fit=crop",
    verified_provider: "Thắng Cảnh Sông Hàn",
    hearts_count: 5,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop"
    ],
    sticky_note: "Huy: Gió sông Hàn buổi sáng rất mát, đi bộ chụp ảnh qua tượng Cá Chép Hóa Rồng là đẹp nhất!",
    backup_options: [],
    transit_to_next: {
      mode: "CAR",
      duration_mins: 10,
      distance_km: 1.8,
      instructions: "Di chuyển đến Chợ Hàn mua quà đặc sản và check-out"
    }
  },
  {
    id: "stop_d3_3",
    day_number: 3,
    time_slot: "AFTERNOON",
    time_display: "13:30 - 15:30",
    duration_mins: 120,
    place_name: "Chợ Hàn Mua Quà Đặc Sản & Tạm Biệt",
    category: "Mua Sắm & Kỷ Niệm",
    is_hero: false,
    address: "119 Trần Phú, Hải Châu 1, Đà Nẵng",
    lat: 16.0683,
    lng: 108.2241,
    rating: 4.6,
    cost_estimated: "200.000đ",
    description: "Khu chợ sầm uất với chả bò Đà Nẵng thơm nức, bánh khô mè Cẩm Lệ, mực một nắng và tré Bà Đệ làm quà cho người thân.",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1000&auto=format&fit=crop",
    verified_provider: "Đặc Sản Truyền Thống",
    hearts_count: 4,
    is_hearted: true,
    voters: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&h=80&fit=crop"
    ],
    sticky_note: null,
    backup_options: [],
    transit_to_next: null
  }
];

const INITIAL_CHAT_MESSAGES = [
  {
    id: "m1",
    sender: "Tạ Quang Huy (Host)",
    is_me: false,
    text: "Chào cả nhóm! Mình vừa phác thảo khung hành trình Hội An - Đà Nẵng 3 ngày 2 đêm. Mọi người xem qua ngày 1, thả tim điểm thích hoặc bấm Swap nếu muốn đổi điểm nhé!",
    time: "08:15 AM",
    is_ai: false
  },
  {
    id: "m2",
    sender: "Nguyễn Minh Đức",
    is_me: true,
    text: "Lịch trình sáng Ngày 1 mê ly quá! Bánh mì Phượng xong đi bộ sang Faifo Coffee tầng thượng ngắm mái ngói rêu phong là hết ý.",
    time: "08:17 AM",
    is_ai: false
  },
  {
    id: "m3",
    sender: "TripMate Concierge",
    is_me: false,
    text: "Chào mọi người! Khoảng cách giữa các điểm sáng nay chỉ 450m nên nhóm có thể thong dong tản bộ ngắm hoa giấy phố cổ. Nếu trưa nay nắng gắt, mình đã chuẩn bị sẵn phương án vào quán cafe máy lạnh trong nhà cho cả nhóm rồi nhé! ☀️",
    time: "08:18 AM",
    is_ai: true
  }
];
