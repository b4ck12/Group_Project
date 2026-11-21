import { Destination, Stop, ProposalOption, ChecklistItem, ChatMessage } from '../types';

import halongImg from '../assets/images/halong.jpg';
import hoianImg from '../assets/images/hoian.jpg';
import sapaImg from '../assets/images/sapa.jpg';
import ninhbinhImg from '../assets/images/ninhbinh.jpg';
import danangImg from '../assets/images/danang.jpg';
import hueImg from '../assets/images/hue.jpg';
import banhmiImg from '../assets/images/banhmi.jpg';
import faifoImg from '../assets/images/faifo.jpg';
import bepcuonImg from '../assets/images/bepcuon.jpg';
import hoadangImg from '../assets/images/hoadang.jpg';

export const VIETNAM_COLLAGE_DESTINATIONS: Destination[] = [
  {
    id: 'halong',
    name: 'Vịnh Hạ Long',
    province: 'Quảng Ninh',
    coords: '20.9101° N, 107.1839° E',
    tag: 'Di Sản Kỳ Quan',
    tilt: '-3.5deg',
    image: halongImg,
    postmark: 'HALONG · 2026',
    desc: 'Nét chạm khắc của rồng thiêng giữa vịnh nước xanh ngọc bích phẳng lặng.'
  },
  {
    id: 'hoian',
    name: 'Phố Cổ Hội An',
    province: 'Quảng Nam',
    coords: '15.8801° N, 108.3380° E',
    tag: 'Hoài Niệm Hoàng Yến',
    tilt: '2.8deg',
    image: hoianImg,
    postmark: 'HOI AN OLD TOWN',
    desc: 'Vàng tường cổ hoàng yến, mái ngói âm dương rêu phong soi bóng sông Hoài.'
  },
  {
    id: 'sapa',
    name: 'Mường Hoa — Sa Pa',
    province: 'Lào Cai',
    coords: '22.3364° N, 103.8438° E',
    tag: 'Bậc Thang Mây Ngàn',
    tilt: '-2deg',
    image: sapaImg,
    postmark: 'SAPA HIGHLAND',
    desc: 'Những nấc thang vươn tới mây trời, rực vàng mùa lúa chín thơm thảo.'
  },
  {
    id: 'ninhbinh',
    name: 'Tràng An — Tam Cốc',
    province: 'Ninh Bình',
    coords: '20.2506° N, 105.9744° E',
    tag: 'Non Nước Hữu Tình',
    tilt: '3.6deg',
    image: ninhbinhImg,
    postmark: 'TRANG AN POST',
    desc: 'Thuyền nan êm đềm lướt qua hang động huyền bí và vách đá vôi sừng sững.'
  },
  {
    id: 'danang',
    name: 'Cầu Rồng & Sơn Trà',
    province: 'Đà Nẵng',
    coords: '16.0678° N, 108.2208° E',
    tag: 'Biển Xanh Thành Phố Trẻ',
    tilt: '-4deg',
    image: danangImg,
    postmark: 'DA NANG CITY',
    desc: 'Giao hòa giữa biển xanh Mỹ Khê và nhịp thở hiện đại của cây cầu biểu tượng.'
  },
  {
    id: 'hue',
    name: 'Cố Đô Huế & Sông Hương',
    province: 'Thừa Thiên Huế',
    coords: '16.4637° N, 107.5909° E',
    tag: 'Trầm Mặc Hoàng Cung',
    tilt: '1.8deg',
    image: hueImg,
    postmark: 'HUE IMPERIAL',
    desc: 'Dấu xưa đài các lăng tẩm hoàng gia bên điệu hò êm đềm chiều tím.'
  }
];

// REALISTIC DETAILED TRIP ITINERARY (FROM AIRPORT TO HOTEL, RESTAURANTS & SIGHTSEEING)
// All stops are calculated and curated by the AI Agent to fulfill the members' expressed desires
// Each stop slot contains candidate venues for democratic voting!
export const INITIAL_STOPS: Stop[] = [
  {
    id: 'stop-airport',
    name: 'Đáp Sân Bay Quốc Tế Đà Nẵng (DAD)',
    time: '07:30 — 08:15',
    category: 'Di chuyển & Đến nơi',
    categoryTag: 'Cửa Ngõ Đón Đoàn',
    categoryColor: 'bg-navy/15 text-navy border-navy/30',
    address: 'Đường Duy Tân, P. Hòa Thuận Tây, Q. Hải Châu, Đà Nẵng',
    cost: '0đ (Đã bao gồm trong vé bay)',
    lat: 16.0538,
    lng: 108.2022,
    desc: 'Chuyến bay hạ cánh ga quốc nội T1, cả nhóm lấy hành lý tại băng chuyền số 3 và gặp xe trung chuyển riêng 7 chỗ.',
    transitFromPrev: null,
    votesUp: 3,
    votesDown: 0,
    hearts: 6,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Minh Đức',
      desire: 'Xe ô tô 7 chỗ đón tận ga đến T1 Sân bay Đà Nẵng (DAD)'
    },
    isHero: false,
    backupOption: {
      name: 'Xe Limousine DAD Express',
      address: 'Ga quốc nội T1, Sân bay Đà Nẵng',
      reason: 'Xe trung chuyển cao cấp dự phòng kế cận',
      lat: 16.0538,
      lng: 108.2022
    }
  },
  {
    id: 'stop-hotel',
    name: 'Anio Boutique Hotel Hội An — Check-in & Gửi Đồ',
    time: '09:00 — 09:45',
    category: 'Lưu trú & Nghỉ ngơi',
    categoryTag: 'Khách Sạn Điểm Tựa',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: '49 Lê Hồng Phong, P. Cẩm Châu, Hội An',
    cost: '1.450.000đ / phòng / đêm',
    lat: 15.8893,
    lng: 108.3375,
    desc: 'Xe đón từ sân bay đưa đoàn về khách sạn qua đại lộ biển Võ Nguyên Giáp. Làm thủ tục nhận phòng hoặc gửi hành lý, thưởng thức trà sả chanh chào đón.',
    transitFromPrev: {
      distance: '28.5km',
      duration: '42 phút',
      mode: 'Xe ô tô 7 chỗ đón sân bay theo đại lộ biển',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 8,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Minh Đức',
      desire: 'Khách sạn boutique di sản gần phố cổ & vừa vặn ngân sách'
    },
    selectedCandidateId: 'cand-hotel-1',
    candidates: [
      {
        id: 'cand-hotel-1',
        name: 'Anio Boutique Hotel Hội An',
        categoryTag: 'Khách sạn Boutique Di Sản',
        categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
        address: '49 Lê Hồng Phong, P. Cẩm Châu, Hội An',
        cost: '1.450.000đ / phòng / đêm',
        desc: 'Kiến trúc Đông Dương thanh lịch, gần sát phố cổ, có bể bơi trung tâm và đón tiễn sân bay.',
        lat: 15.8893,
        lng: 108.3375,
        matchedDesire: { member: 'Minh Đức', desire: 'Boutique gần phố cổ & ngân sách hợp lý' },
        votes: ['Minh Đức (Bạn)', 'Lan Vy'],
        hearts: 8
      },
      {
        id: 'cand-hotel-2',
        name: 'La Siesta Hoi An Resort & Spa',
        categoryTag: 'Resort Nghỉ Dưỡng Xanh',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: '132 Hùng Vương, P. Cẩm Phổ, Hội An',
        cost: '1.850.000đ / phòng / đêm',
        desc: 'Khu resort sân vườn rộng rãi, nhiều mảng xanh, hồ bơi nước mặn.',
        lat: 15.8824,
        lng: 108.3189,
        votes: ['Hoàng Anh'],
        hearts: 5
      },
      {
        id: 'cand-hotel-3',
        name: 'Allegro Hoi An Little Luxury Hotel',
        categoryTag: 'Khách Sạn Trung Tâm',
        categoryColor: 'bg-navy/15 text-navy border-navy/30',
        address: '86 Trần Hưng Đạo, P. Cẩm Phổ, Hội An',
        cost: '1.600.000đ / phòng / đêm',
        desc: 'Vị trí đắc địa ngay trung tâm, tiện đi bộ ra Chùa Cầu.',
        lat: 15.8795,
        lng: 108.3245,
        votes: [],
        hearts: 3
      }
    ],
    isHero: false,
    backupOption: {
      name: 'La Siesta Hoi An Resort & Spa',
      address: '132 Hùng Vương, P. Cẩm Phổ, Hội An',
      reason: 'Phương án nghỉ dưỡng cao cấp dự phòng kế cận',
      lat: 15.8824,
      lng: 108.3189
    }
  },
  {
    id: 'stop-1',
    name: 'Bánh Mì Phượng & Trà Thảo Mộc Mót',
    time: '10:00 — 11:00',
    category: 'Ẩm thực & Bắt đầu',
    categoryTag: 'Điểm Tâm Bản Địa',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: '2B Phan Chu Trinh, P. Cẩm Châu, Hội An',
    cost: '65.000đ / người',
    lat: 15.8778,
    lng: 108.3315,
    image: banhmiImg,
    desc: 'Thưởng thức ổ bánh mì giòn rụm pate nướng thơm nức (có tùy chọn nhân nấm chay cho Hoàng Anh) và ly trà thảo mộc hoa sen thanh mát đặc trưng.',
    transitFromPrev: {
      distance: '1.4km',
      duration: '4 phút',
      mode: 'Xe điện phố cổ hoặc Grab Car',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 7,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Điểm tâm sáng nhanh có bánh mì chay thanh đạm'
    },
    selectedCandidateId: 'cand-food-1',
    candidates: [
      {
        id: 'cand-food-1',
        name: 'Bánh Mì Phượng & Nước Mót',
        categoryTag: 'Bánh Mì Di Sản',
        categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
        address: '2B Phan Chu Trinh, Hội An',
        cost: '35.000đ — 65.000đ',
        desc: 'Bánh mì pate giòn rụm nổi tiếng, có nhân nấm chay thảo mộc cho người ăn chay.',
        lat: 15.8778,
        lng: 108.3315,
        matchedDesire: { member: 'Hoàng Anh', desire: 'Bánh mì có tùy chọn chay' },
        votes: ['Hoàng Anh', 'Minh Đức (Bạn)', 'Lan Vy'],
        hearts: 9,
        dishes: [
          { name: 'Bánh mì Thập cẩm đặc biệt', price: '35.000đ', note: 'Nước sốt gia truyền, đậm vị thịt nướng' },
          { name: 'Bánh mì Pâté Nấm Chay', price: '30.000đ', note: 'Thuần chay thanh đạm, rau thơm Trà Quế tươi' },
          { name: 'Nước Mót thảo mộc sả chanh', price: '16.000đ', note: 'Thanh lọc, cánh sen tươi chụp ảnh đẹp' }
        ]
      },
      {
        id: 'cand-food-2',
        name: 'Bánh Mì Madam Khánh (The Banh Mi Queen)',
        categoryTag: 'Bánh Mì Cổ Truyền',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '115 Trần Cao Vân, Hội An',
        cost: '35.000đ / ổ',
        desc: 'Sốt bơ trứng gia truyền thơm béo, vỏ bánh giòn xốp.',
        lat: 15.8792,
        lng: 108.3278,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-food-3',
        name: 'Quán Bánh Bèo Chén Bà Bảy',
        categoryTag: 'Điểm Tâm Dân Dã',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '2 Hoàng Văn Thụ, Hội An',
        cost: '30.000đ / khay 6 chén',
        desc: 'Bánh bèo chén nhân tôm thịt bùi béo, rắc da heo chiên giòn.',
        lat: 15.8785,
        lng: 108.3291,
        votes: [],
        hearts: 3
      }
    ],
    isHero: false,
    backupOption: {
      name: 'Bánh Mì Madam Khánh (The Banh Mi Queen)',
      address: '115 Trần Cao Vân, Hội An',
      reason: 'Lựa chọn thay thế nếu Bánh Mì Phượng quá đông người xếp hàng',
      lat: 15.8792,
      lng: 108.3278
    },
    dishes: [
      { name: 'Bánh mì Thập cẩm đặc biệt', price: '35.000đ', note: 'Nước sốt gia truyền, đậm vị thịt nướng' },
      { name: 'Bánh mì Pâté Nấm Chay', price: '30.000đ', note: 'Thuần chay thanh đạm, rau thơm Trà Quế tươi' },
      { name: 'Nước Mót thảo mộc sả chanh', price: '16.000đ', note: 'Thanh lọc, cánh sen tươi chụp ảnh đẹp' }
    ]
  },
  {
    id: 'stop-2',
    name: 'Faifo Coffee — Ngắm Mái Ngói Phố Cổ Rooftop',
    time: '11:15 — 12:30',
    category: 'Cafe & View Rooftop',
    categoryTag: 'Check-in Phố Cổ',
    categoryColor: 'bg-terracotta/15 text-terracotta border-terracotta/30',
    address: '130 Trần Phú, P. Minh An, Hội An',
    cost: '55.000đ / đồ uống',
    lat: 15.8771,
    lng: 108.3289,
    image: faifoImg,
    desc: 'Ban công tầng thượng nhìn trọn vẹn dãy mái ngói âm dương rêu phong nhuốm nắng vàng của phố Hội.',
    transitFromPrev: {
      distance: '450m',
      duration: '6 phút',
      mode: 'Đi bộ thong thả qua ngõ cổ',
      haversineOk: true
    },
    votesUp: 2,
    votesDown: 1,
    hearts: 6,
    voters: ['Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Quán cafe ban công rooftop ngắm mái ngói âm dương phố cổ chụp ảnh film'
    },
    selectedCandidateId: 'cand-cafe-1',
    candidates: [
      {
        id: 'cand-cafe-1',
        name: 'Faifo Coffee Rooftop',
        categoryTag: 'View Tầng Thượng Ngắm Mái Ngói',
        categoryColor: 'bg-terracotta/15 text-terracotta border-terracotta/30',
        address: '130 Trần Phú, Hội An',
        cost: '55.000đ / ly',
        desc: 'Ban công tầng thượng nhìn trọn vẹn dãy mái ngói âm dương rêu phong cổ kính.',
        lat: 15.8771,
        lng: 108.3289,
        matchedDesire: { member: 'Lan Vy', desire: 'Cafe rooftop ngắm mái ngói phố cổ' },
        votes: ['Lan Vy', 'Minh Đức (Bạn)'],
        hearts: 8,
        dishes: [
          { name: 'Cà phê Muối Hội An', price: '49.000đ', note: 'Kem béo mặn nhẹ hòa quyện cà phê phin' },
          { name: 'Trà sen long nhãn ủ lạnh', price: '55.000đ', note: 'Dịu mát, cánh hoa sen chụp ảnh đẹp' }
        ]
      },
      {
        id: 'cand-cafe-2',
        name: 'Reaching Out Teahouse (Trà Quán Nhà Gỗ Cổ)',
        categoryTag: 'Không Gian Yên Tĩnh Trong Nhà',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: '131 Trần Phú, Hội An',
        cost: '60.000đ / ấm trà',
        desc: 'Không gian tĩnh lặng trong ngôi nhà cổ thuần gỗ, ấm cúng che mưa hoàn hảo.',
        lat: 15.8769,
        lng: 108.3285,
        isIndoorBackup: true,
        votes: ['Hoàng Anh'],
        hearts: 7,
        dishes: [
          { name: 'Bạch Trà Cổ Thụ & Mứt Gừng', price: '68.000đ', note: 'Hương thơm thanh tao ấm bụng' },
          { name: 'Trà Ô Long Hoa Lài Hữu Cơ', price: '58.000đ', note: 'Thanh lọc tâm hồn trong nhà cổ' }
        ]
      },
      {
        id: 'cand-cafe-3',
        name: 'Hoi An Roastery (Espresso & Cafe Rang Xay)',
        categoryTag: 'Cà Phê Rang Xay Truyền Thống',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '135 Trần Phú, Hội An',
        cost: '45.000đ / ly',
        desc: 'Hương thơm cà phê rang xay ngào ngạt bên khung cửa sổ gỗ rợp bóng hoa giấy.',
        lat: 15.8773,
        lng: 108.3294,
        votes: [],
        hearts: 3
      }
    ],
    isHero: true,
    backupOption: {
      name: 'Reaching Out Teahouse (Trà Tĩnh Lặng Trong Nhà Gỗ Cổ)',
      address: '131 Trần Phú, Hội An',
      reason: 'Không gian yên bình trong nhà gỗ cổ ấm cúng, che mưa hoàn hảo cho cả nhóm',
      lat: 15.8769,
      lng: 108.3285
    },
    dishes: [
      { name: 'Cà phê Muối Hội An', price: '49.000đ', note: 'Lớp kem béo mặn nhẹ hòa quyện cà phê pha phin' },
      { name: 'Trà sen long nhãn ủ lạnh', price: '55.000đ', note: 'Hương thơm tinh tế, dịu mát ngày nắng' }
    ]
  },
  {
    id: 'stop-3',
    name: 'Bếp Cuốn Hội An — Bữa Trưa Ẩm Thực Di Sản',
    time: '12:45 — 14:00',
    category: 'Ẩm thực Di sản',
    categoryTag: 'Bữa Trưa Nhóm',
    categoryColor: 'bg-moss/15 text-moss border-moss/30',
    address: '54 Nguyễn Thái Học, Hội An',
    cost: '140.000đ / người',
    lat: 15.8762,
    lng: 108.3282,
    image: bepcuonImg,
    desc: 'Mẹt cuốn bánh tráng thịt heo nướng, ram tôm giòn rụm và đặc biệt có Cao Lầu chay nấm, gỏi cuốn chay chuẩn vị di sản.',
    transitFromPrev: {
      distance: '280m',
      duration: '4 phút',
      mode: 'Đi bộ qua phố đi bộ',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 9,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Quán đặc sản bản địa có menu món chay phong phú chuẩn vị Hội An'
    },
    selectedCandidateId: 'cand-lunch-1',
    candidates: [
      {
        id: 'cand-lunch-1',
        name: 'Bếp Cuốn Hội An — Ẩm Thực Di Sản',
        categoryTag: 'Đặc Sản Món Chay & Mặn',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: '54 Nguyễn Thái Học, Hội An',
        cost: '140.000đ / người',
        desc: 'Mẹt cuốn Trà Quế, Cao Lầu nấm đùi gà chay ngâm nước giếng Bá Lễ chuẩn vị.',
        lat: 15.8762,
        lng: 108.3282,
        matchedDesire: { member: 'Hoàng Anh', desire: 'Đặc sản có món chay chuẩn vị' },
        votes: ['Hoàng Anh', 'Minh Đức (Bạn)', 'Lan Vy'],
        hearts: 9,
        dishes: [
          { name: 'Cao Lầu Chay Nấm Hương', price: '45.000đ', note: 'Sợi mì ngâm tro củi Bá Lễ, nấm đùi gà xíu (Thuần chay)' },
          { name: 'Mẹt Cuốn Chay Bếp Xưa', price: '110.000đ', note: 'Đậu hũ non chiên giòn, ram bắp, rau thơm Trà Quế (Thuần chay)' },
          { name: 'Cao Lầu thịt xíu Hội An', price: '45.000đ', note: 'Dành cho thành viên ăn mặn, xíu mềm thơm' }
        ]
      },
      {
        id: 'cand-lunch-2',
        name: 'Cơm Gà Bà Buội',
        categoryTag: 'Cơm Gà Cổ Truyền',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '22 Phan Chu Trinh, Hội An',
        cost: '65.000đ / đĩa',
        desc: 'Cơm gà gia truyền vàng óng hạt dẻo thơm, thịt gà xé trộn hành tây giòn ngọt.',
        lat: 15.8781,
        lng: 108.3312,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-lunch-3',
        name: 'Quán Chay An Lạc Hội An',
        categoryTag: 'Thuần Chay Thanh Tịnh',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '84 Phan Chu Trinh, Hội An',
        cost: '40.000đ / phần',
        desc: 'Quán chay lâu đời, cơm chay tự chọn và phở nấm thanh đạm.',
        lat: 15.8775,
        lng: 108.3289,
        votes: [],
        hearts: 3
      }
    ],
    isHero: false,
    backupOption: {
      name: 'Quán Chay An Lạc Hội An',
      address: '84 Phan Chu Trinh, Hội An',
      reason: 'Quán thuần chay thanh tịnh dự phòng',
      lat: 15.8775,
      lng: 108.3289
    },
    dishes: [
      { name: 'Cao Lầu Chay Nấm Hương', price: '45.000đ', note: 'Sợi mì ngâm tro củi Bá Lễ, nấm đùi gà xíu đậm đà (Thuần chay)' },
      { name: 'Mẹt Cuốn Chay Bếp Xưa', price: '110.000đ', note: 'Đậu hũ non chiên giòn, ram bắp, rau thơm Trà Quế (Thuần chay)' },
      { name: 'Cao Lầu thịt xíu Hội An', price: '45.000đ', note: 'Dành cho thành viên ăn mặn, xíu thơm mềm' },
      { name: 'Bánh bao bánh vạc (Hoa Hồng Trắng)', price: '60.000đ', note: 'Mềm trong suốt, rắc hành phi thơm nức' }
    ]
  },
  {
    id: 'stop-break',
    name: 'Về Khách Sạn Nghỉ Trưa & Tránh Nắng Nóng',
    time: '14:15 — 16:15',
    category: 'Nghỉ ngơi',
    categoryTag: 'Hồi Phục Thể Lực',
    categoryColor: 'bg-surface text-graphite border-ash',
    address: '49 Lê Hồng Phong, P. Cẩm Châu, Hội An',
    cost: '0đ',
    lat: 15.8893,
    lng: 108.3375,
    desc: 'Về khách sạn tắm mát, ngả lưng nghỉ trưa phòng lạnh hoặc bơi thư giãn tại hồ bơi trung tâm, tránh khung giờ nắng gắt 35°C.',
    transitFromPrev: {
      distance: '1.4km',
      duration: '5 phút',
      mode: 'Grab Car / Taxi',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 8,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Nghỉ ngơi phòng lạnh tránh nắng gắt 12h30 - 14h30 giữ sức khỏe'
    },
    isHero: false,
    backupOption: {
      name: 'Spa Thảo Dược Anio',
      address: 'Tầng trệt Anio Boutique Hotel',
      reason: 'Thư giãn ngâm chân thảo mộc tại chỗ',
      lat: 15.8893,
      lng: 108.3375
    }
  },
  {
    id: 'stop-beach',
    name: 'Biển An Bàng — Ngắm Hoàng Hôn & Thưởng Thức Nước Dừa',
    time: '16:30 — 18:30',
    category: 'Biển & Chill',
    categoryTag: 'Hoàng Hôn Thư Thái',
    categoryColor: 'bg-navy/15 text-navy border-navy/30',
    address: 'Bãi biển An Bàng, P. Cẩm An, Hội An',
    cost: '60.000đ / người',
    lat: 15.9125,
    lng: 108.3444,
    image: danangImg,
    desc: 'Hóng gió biển chiều mát rượi, dạo chân trần trên bãi cát trắng và thưởng thức đồ uống tại Soul Kitchen hoặc The Deck House.',
    transitFromPrev: {
      distance: '3.8km',
      duration: '8 phút',
      mode: 'Xe trung chuyển của khách sạn',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 9,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Bãi biển lộng gió hóng mát ngắm hoàng hôn chiều muộn'
    },
    selectedCandidateId: 'cand-beach-1',
    candidates: [
      {
        id: 'cand-beach-1',
        name: 'Biển An Bàng — The DeckHouse',
        categoryTag: 'Biển Cát Trắng & Beach Bar',
        categoryColor: 'bg-navy/15 text-navy border-navy/30',
        address: 'Bãi biển An Bàng, Cẩm An, Hội An',
        cost: '60.000đ / người',
        desc: 'Bãi biển lộng gió, dạo chân trần trên cát và chill ghế lười ngắm hoàng hôn.',
        lat: 15.9125,
        lng: 108.3444,
        matchedDesire: { member: 'Lan Vy', desire: 'Hóng gió & hoàng hôn biển chiều mát' },
        votes: ['Lan Vy', 'Minh Đức (Bạn)', 'Hoàng Anh'],
        hearts: 9
      },
      {
        id: 'cand-beach-2',
        name: 'Biển Cửa Đại — Nhà Hàng Gió Biển',
        categoryTag: 'Sóng Lớn & Hải Sản Tươi',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: 'Đường Lạc Long Quân, Cửa Đại, Hội An',
        cost: '80.000đ / người',
        desc: 'Khu vực bãi biển thoáng đãng với bờ kè đá dài ngắm biển khơi.',
        lat: 15.8921,
        lng: 108.3712,
        votes: [],
        hearts: 3
      },
      {
        id: 'cand-beach-3',
        name: 'Rừng Dừa Bảy Mẫu Cẩm Thanh',
        categoryTag: 'Chèo Thuyền Thúng Sông Nước',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: 'Xã Cẩm Thanh, Hội An',
        cost: '70.000đ / người',
        desc: 'Chèo thuyền thúng ngắm hoàng hôn len lỏi qua rặng dừa nước.',
        lat: 15.8692,
        lng: 108.3685,
        votes: [],
        hearts: 5
      }
    ],
    isHero: false,
    backupOption: {
      name: 'The DeckHouse An Bang Beach',
      address: 'Bãi biển An Bàng, Cẩm An, Hội An',
      reason: 'Không gian ngắm biển có mái che lãng mạn',
      lat: 15.9142,
      lng: 108.3411
    }
  },
  {
    id: 'stop-4',
    name: 'Thả Hoa Đăng Sông Hoài & Dạo Phố Đèn Lồng',
    time: '19:00 — 21:00',
    category: 'Trải nghiệm Văn Hóa',
    categoryTag: 'Hoạt Động Buổi Tối',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: 'Bến thuyền Bạch Đằng, bờ sông Hoài, Hội An',
    cost: '30.000đ / người',
    lat: 15.8758,
    lng: 108.3275,
    image: hoadangImg,
    desc: 'Ngồi thuyền gỗ thong thả xuôi dòng sông lung linh hàng ngàn đóa hoa đăng gửi gắm ước nguyện may mắn.',
    transitFromPrev: {
      distance: '4.2km',
      duration: '10 phút',
      mode: 'Xe ô tô đưa về phố cổ',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 10,
    voters: ['Hoàng Anh', 'Minh Đức', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Đi thuyền gỗ thả hoa đăng sông Hoài lung linh về đêm'
    },
    selectedCandidateId: 'cand-night-1',
    candidates: [
      {
        id: 'cand-night-1',
        name: 'Thuyền Thả Hoa Đăng Sông Hoài',
        categoryTag: 'Văn Hóa Đèn Lồng Sông Nước',
        categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
        address: 'Bến Bạch Đằng, bờ sông Hoài, Hội An',
        cost: '30.000đ / người',
        desc: 'Đi thuyền gỗ mộc, thả hoa đăng lung linh ánh nến trên sông Hoài.',
        lat: 15.8758,
        lng: 108.3275,
        matchedDesire: { member: 'Lan Vy', desire: 'Thuyền gỗ thả hoa đăng sông Hoài' },
        votes: ['Lan Vy', 'Minh Đức (Bạn)', 'Hoàng Anh'],
        hearts: 10,
        dishes: [
          { name: 'Chè bắp Cẩm Nam', price: '15.000đ', note: 'Bắp bãi bồi ngọt bùi' },
          { name: 'Xiên nấm nướng than', price: '12.000đ', note: 'Ăn vặt chay nóng hổi' }
        ]
      },
      {
        id: 'cand-night-2',
        name: 'Dạo Phố Đi Bộ & Chợ Đêm Nguyễn Hoàng',
        categoryTag: 'Chợ Đêm & Mua Sắm',
        categoryColor: 'bg-surface text-ink border-ash',
        address: 'Đường Nguyễn Hoàng, Hội An',
        cost: '0đ (Tự do)',
        desc: 'Dạo ngắm các gian hàng đèn lồng nhiều màu sắc và mua quà lưu niệm.',
        lat: 15.8765,
        lng: 108.3265,
        votes: [],
        hearts: 5
      },
      {
        id: 'cand-night-3',
        name: 'Show Diễn Thực Cảnh Ký Ức Hội An',
        categoryTag: 'Show Nghệ Thuật Thực Cảnh',
        categoryColor: 'bg-navy/15 text-navy border-navy/30',
        address: 'Cồn Hến, Cẩm Nam, Hội An',
        cost: '450.000đ / vé',
        desc: 'Chương trình nghệ thuật thực cảnh quy mô 500 diễn viên trên sông Hoài.',
        lat: 15.8741,
        lng: 108.3385,
        votes: [],
        hearts: 4
      }
    ],
    isHero: false,
    backupOption: {
      name: 'Phố Đi Bộ Đèn Lồng & Chợ Đêm Hội An',
      address: 'Đường Nguyễn Hoàng, Hội An',
      reason: 'Dạo bộ ngắm đèn lồng trên bờ nếu sông nước đông thuyền',
      lat: 15.8765,
      lng: 108.3265
    },
    dishes: [
      { name: 'Chè bắp Cẩm Nam', price: '15.000đ', note: 'Bắp bãi bồi sông Thu Bồn ngọt bùi thanh mát' },
      { name: 'Xiên nấm củ quả nướng than', price: '12.000đ / xiên', note: 'Món ăn vặt chay nóng hổi ven sông' },
      { name: 'Xiên thịt nướng cuốn bánh ướt', price: '10.000đ / xiên', note: 'Nướng than hoa thơm lừng ven sông' }
    ]
  }
];

export const ALL_DAY_1_STOPS: Stop[] = INITIAL_STOPS;

export const INITIAL_REVEALED_STOPS: Stop[] = [
  {
    ...INITIAL_STOPS[0], // Stop 1: Sân bay DAD (Cửa ngõ cố định)
    isSlotConfirmed: true
  },
  {
    ...INITIAL_STOPS[1], // Stop 2: Khách sạn lưu trú - ĐANG MỞ BÌNH CHỌN (CHƯA CHỐT)
    name: 'Khách Sạn Lưu Trú — [Đang Mở Bình Chọn Resort/Boutique]',
    desc: 'Lựa chọn nơi lưu trú gần phố cổ, tiện xe đưa đón và phù hợp ngân sách chuyến đi. Chốt xong trạm này mới mở khóa trạm kế tiếp.',
    votesUp: 1,
    voters: ['Lan Vy'],
    isSlotConfirmed: false,
    selectedCandidateId: undefined,
    candidates: INITIAL_STOPS[1].candidates?.map(c =>
      c.id === 'cand-hotel-1' ? { ...c, votes: ['Lan Vy'] } : { ...c, votes: [] }
    )
  }
];

// ==========================================
// DAY 2 ITINERARY: RỪNG DỪA BẢY MẪU & LÀNG QUÊ CẨM THANH (6 STOPS)
// All stops feature democratic candidate venue voting, progressive unlock, and desire matching
// ==========================================
export const ALL_DAY_2_STOPS: Stop[] = [
  {
    id: 'stop-d2-1',
    name: 'Cao Lầu & Mì Quảng Bá Lễ — Điểm Tâm Sáng',
    time: '08:00 — 09:15',
    category: 'Ẩm thực & Bắt đầu',
    categoryTag: 'Điểm Tâm Bản Địa',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: '49/3 Trần Hưng Đạo, P. Minh An, Hội An',
    cost: '45.000đ / tô',
    lat: 15.8791,
    lng: 108.3270,
    desc: 'Thưởng thức tô Cao Lầu nạc xíu và mì quảng thơm ngon, có mì quảng nấm đậu hũ nước cốt thanh đạm dành riêng cho Hoàng Anh.',
    transitFromPrev: {
      distance: '1.2km',
      duration: '4 phút',
      mode: 'Xe điện từ khách sạn Anio',
      haversineOk: true
    },
    votesUp: 2,
    votesDown: 0,
    hearts: 7,
    voters: ['Hoàng Anh', 'Minh Đức'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Bữa sáng bản địa có mì quảng chay nấm thanh đạm'
    },
    selectedCandidateId: 'cand-d2-food-1',
    candidates: [
      {
        id: 'cand-d2-food-1',
        name: 'Cao Lầu & Mì Quảng Bá Lễ',
        categoryTag: 'Cao Lầu & Mì Quảng Di Sản',
        categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
        address: '49/3 Trần Hưng Đạo, Hội An',
        cost: '45.000đ / tô',
        desc: 'Sợi mì ngâm tro củi giếng Bá Lễ, có mì quảng nấm đậu hũ thanh đạm cho người ăn chay.',
        lat: 15.8791,
        lng: 108.3270,
        matchedDesire: { member: 'Hoàng Anh', desire: 'Mì quảng chay nấm thanh đạm' },
        votes: ['Hoàng Anh', 'Minh Đức (Bạn)'],
        hearts: 8,
        dishes: [
          { name: 'Mì Quảng Nấm Đậu Hũ Chay', price: '40.000đ', note: 'Nấm đùi gà, đậu khuôn chiên giòn, bánh tráng nướng' },
          { name: 'Cao Lầu Bá Lễ thịt xíu', price: '45.000đ', note: 'Thịt xíu thơm mềm ngâm nước giếng Bá Lễ' }
        ]
      },
      {
        id: 'cand-d2-food-2',
        name: 'Bánh Mì Madam Khánh — The Banh Mi Queen',
        categoryTag: 'Bánh Mì Cổ Truyền',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '115 Trần Cao Vân, Hội An',
        cost: '35.000đ / ổ',
        desc: 'Sốt bơ trứng gia truyền thơm béo, vỏ bánh giòn rụm.',
        lat: 15.8792,
        lng: 108.3278,
        votes: ['Lan Vy'],
        hearts: 5
      },
      {
        id: 'cand-d2-food-3',
        name: 'Phở Liến Hội An Gia Truyền',
        categoryTag: 'Phở Bò Bản Địa',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '25 Lê Lợi, Hội An',
        cost: '50.000đ / tô',
        desc: 'Nước dùng phở bò ninh xương ngọt thanh, sợi phở dẻo mềm.',
        lat: 15.8785,
        lng: 108.3282,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Bánh Mì Madam Khánh',
      address: '115 Trần Cao Vân, Hội An',
      reason: 'Phương án ăn sáng nhanh tiện mang theo',
      lat: 15.8792,
      lng: 108.3278
    },
    dishes: [
      { name: 'Mì Quảng Nấm Đậu Hũ Chay', price: '40.000đ', note: 'Nấm đùi gà, đậu khuôn chiên giòn, bánh tráng nướng' },
      { name: 'Cao Lầu Bá Lễ thịt xíu', price: '45.000đ', note: 'Thịt xíu thơm mềm ngâm nước giếng Bá Lễ' }
    ]
  },
  {
    id: 'stop-d2-2',
    name: 'Thuyền Thúng Rừng Dừa Bảy Mẫu Cẩm Thanh',
    time: '09:45 — 11:45',
    category: 'Sinh Thái & Trải Nghiệm',
    categoryTag: 'Sông Nước Cẩm Thanh',
    categoryColor: 'bg-moss/15 text-moss border-moss/30',
    address: 'Tổ 2, Thôn Vạn Lăng, Xã Cẩm Thanh, Hội An',
    cost: '70.000đ / vé thuyền thúng',
    lat: 15.8692,
    lng: 108.3685,
    image: hoianImg,
    isHero: true,
    desc: 'Trải nghiệm ngồi thuyền thúng len lỏi giữa rặng dừa nước bạt ngàn, xem nghệ nhân múa thúng xoay tròn điệu nghệ và thử tài câu cua ven sông.',
    transitFromPrev: {
      distance: '4.8km',
      duration: '11 phút',
      mode: 'Taxi / Xe trung chuyển 7 chỗ',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 9,
    voters: ['Hoàng Anh', 'Lan Vy', 'Minh Đức'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Trải nghiệm thuyền thúng sông nước chụp ảnh film thiên nhiên'
    },
    selectedCandidateId: 'cand-d2-coco-1',
    candidates: [
      {
        id: 'cand-d2-coco-1',
        name: 'Thuyền Thúng Bác Bảy & Múa Thúng Điệu Nghệ',
        categoryTag: 'Thuyền Thúng Sông Nước',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: 'Thôn Vạn Lăng, Cẩm Thanh, Hội An',
        cost: '70.000đ / vé',
        desc: 'Chèo len lỏi rặng dừa nước, xem biểu diễn múa thúng xoay tít và trải nghiệm câu cua đồng.',
        lat: 15.8692,
        lng: 108.3685,
        matchedDesire: { member: 'Lan Vy', desire: 'Thuyền thúng rặng dừa chụp ảnh đẹp' },
        votes: ['Lan Vy', 'Hoàng Anh', 'Minh Đức (Bạn)'],
        hearts: 9
      },
      {
        id: 'cand-d2-coco-2',
        name: 'Long Phú Eco-Tour Cẩm Thanh',
        categoryTag: 'Tour Sinh Thái Gia Đình',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: 'Thôn Thanh Nhứt, Cẩm Thanh, Hội An',
        cost: '85.000đ / vé',
        desc: 'Khu sinh thái quy mô rộng, có chòi lá nghỉ ngơi ven sông.',
        lat: 15.8710,
        lng: 108.3660,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d2-coco-3',
        name: 'Tour Chèo Kayak Sông Nước Cẩm Thanh',
        categoryTag: 'Chèo Thuyền Thể Thao',
        categoryColor: 'bg-surface text-ink border-ash',
        address: 'Bến sông Cẩm Thanh, Hội An',
        cost: '120.000đ / kayak đôi',
        desc: 'Tự tay chèo kayak thể thao khám phá luồng lạch rừng dừa.',
        lat: 15.8675,
        lng: 108.3705,
        votes: [],
        hearts: 5
      }
    ],
    backupOption: {
      name: 'Khu Du Lịch Sinh Thái Rừng Dừa Xanh',
      address: 'Xã Cẩm Thanh, Hội An',
      reason: 'Bến thuyền dự phòng râm mát',
      lat: 15.8681,
      lng: 108.3695
    }
  },
  {
    id: 'stop-d2-3',
    name: 'Nhà Hàng Cánh Đồng (The Field) — Bữa Trưa Sinh Thái',
    time: '12:00 — 13:30',
    category: 'Ẩm thực Sinh thái',
    categoryTag: 'Bữa Trưa Ven Đồng',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: 'Thôn Đồng Nà, Xã Cẩm Thanh, Hội An',
    cost: '145.000đ / người',
    lat: 15.8745,
    lng: 108.3580,
    desc: 'Không gian mở nhìn ra cánh đồng lúa xanh ngát, phục vụ thực đơn mộc mạc đồng quê và có thực đơn chay organic rau củ Trà Quế riêng cho Hoàng Anh.',
    transitFromPrev: {
      distance: '1.8km',
      duration: '5 phút',
      mode: 'Xe ô tô 7 chỗ',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 8,
    voters: ['Hoàng Anh', 'Lan Vy', 'Minh Đức'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Nhà hàng sinh thái có menu chay tươi ngon từ rau củ Trà Quế'
    },
    selectedCandidateId: 'cand-d2-lunch-1',
    candidates: [
      {
        id: 'cand-d2-lunch-1',
        name: 'Nhà Hàng Cánh Đồng (The Field Restaurant)',
        categoryTag: 'Ẩm Thực Sinh Thái Hữu Cơ',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: 'Thôn Đồng Nà, Cẩm Thanh, Hội An',
        cost: '145.000đ / người',
        desc: 'View đồng lúa mênh mông, thực đơn thuần chay hữu cơ lấy rau tươi từ vườn Trà Quế.',
        lat: 15.8745,
        lng: 108.3580,
        matchedDesire: { member: 'Hoàng Anh', desire: 'Thực đơn chay organic đồng quê' },
        votes: ['Hoàng Anh', 'Lan Vy', 'Minh Đức (Bạn)'],
        hearts: 9,
        dishes: [
          { name: 'Gỏi cuốn nấm hoa chuối Trà Quế', price: '65.000đ', note: 'Rau thơm organic, tương đậu phộng rang' },
          { name: 'Cơm chiên lá cẩm hạt sen chay', price: '75.000đ', note: 'Hạt sen bùi béo, nấm hương xào thơm' },
          { name: 'Cá lóc nướng trui lá chuối', price: '120.000đ', note: 'Món mặn dân dã đồng quê' }
        ]
      },
      {
        id: 'cand-d2-lunch-2',
        name: 'Quán Vườn Quê Cẩm Thanh',
        categoryTag: 'Ẩm Thực Đồng Quê',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: 'Thôn Thanh Nhứt, Cẩm Thanh, Hội An',
        cost: '110.000đ / người',
        desc: 'Gà nướng lá chanh và rau xào tỏi mộc mạc bên rặng dừa.',
        lat: 15.8720,
        lng: 108.3610,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d2-lunch-3',
        name: 'Nhà Hàng Sen Hội An Ven Sông',
        categoryTag: 'Nhà Hàng Ven Sông',
        categoryColor: 'bg-surface text-ink border-ash',
        address: 'Đường Trần Nhân Tông, Cẩm Thanh',
        cost: '135.000đ / người',
        desc: 'Không gian mở thoáng đãng nhìn ra dòng sông Đò thơ mộng.',
        lat: 15.8760,
        lng: 108.3550,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Nhà Hàng Sen Hội An Ven Sông',
      address: 'Đường Trần Nhân Tông, Cẩm Thanh',
      reason: 'Nhà hàng ven sông điều hòa mát rượi',
      lat: 15.8760,
      lng: 108.3550
    },
    dishes: [
      { name: 'Gỏi cuốn nấm hoa chuối Trà Quế', price: '65.000đ', note: 'Rau thơm organic, tương đậu phộng rang' },
      { name: 'Cơm chiên lá cẩm hạt sen chay', price: '75.000đ', note: 'Hạt sen bùi béo, nấm hương xào thơm' }
    ]
  },
  {
    id: 'stop-d2-4',
    name: 'Về Khách Sạn Anio — Nghỉ Trưa Phòng Lạnh & Bơi Thư Giãn',
    time: '13:45 — 15:45',
    category: 'Nghỉ ngơi',
    categoryTag: 'Tránh Nắng 35°C',
    categoryColor: 'bg-surface text-graphite border-ash',
    address: '49 Lê Hồng Phong, P. Cẩm Châu, Hội An',
    cost: '0đ',
    lat: 15.8893,
    lng: 108.3375,
    desc: 'Trở về khách sạn nghỉ ngơi trong phòng máy lạnh hoặc ngâm mình tại hồ bơi trung tâm, tránh khung giờ nắng gắt đỉnh điểm 13h-15h.',
    transitFromPrev: {
      distance: '2.5km',
      duration: '6 phút',
      mode: 'Xe ô tô đưa về khách sạn',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 8,
    voters: ['Hoàng Anh', 'Lan Vy', 'Minh Đức'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Nghỉ trưa phòng lạnh 13h-15h bảo đảm thể lực'
    },
    isSlotConfirmed: true,
    backupOption: {
      name: 'Spa Anio Thảo Mộc',
      address: 'Anio Boutique Hotel',
      reason: 'Ngâm chân thảo mộc thư giãn',
      lat: 15.8893,
      lng: 108.3375
    }
  },
  {
    id: 'stop-d2-5',
    name: 'Biển Cửa Đại & The Shore Club — Hoàng Hôn Biển Chiều',
    time: '16:15 — 18:30',
    category: 'Biển & Chill',
    categoryTag: 'Hoàng Hôn Sóng Biển',
    categoryColor: 'bg-navy/15 text-navy border-navy/30',
    address: 'Bãi biển Cửa Đại, Đường Lạc Long Quân, Hội An',
    cost: '65.000đ / người',
    lat: 15.8921,
    lng: 108.3712,
    image: danangImg,
    desc: 'Hóng gió biển chiều mát rượi, dạo bước trên bờ cát và thưởng thức dừa xiêm ngọt lịm hoặc cocktail nhẹ ngắm ráng chiều đỏ rực.',
    transitFromPrev: {
      distance: '3.6km',
      duration: '7 phút',
      mode: 'Xe điện khách sạn',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 9,
    voters: ['Lan Vy', 'Minh Đức', 'Hoàng Anh'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Hóng gió biển chiều & ngắm hoàng hôn lộng gió'
    },
    selectedCandidateId: 'cand-d2-beach-1',
    candidates: [
      {
        id: 'cand-d2-beach-1',
        name: 'Biển Cửa Đại & The Shore Club',
        categoryTag: 'Bãi Biển & Beach Lounge',
        categoryColor: 'bg-navy/15 text-navy border-navy/30',
        address: 'Bãi biển Cửa Đại, Lạc Long Quân, Hội An',
        cost: '65.000đ / ly',
        desc: 'Ghế lười sát biển, bãi cát dài thoáng đãng, ngắm hoàng hôn lộng gió.',
        lat: 15.8921,
        lng: 108.3712,
        matchedDesire: { member: 'Lan Vy', desire: 'Hóng gió biển chiều ngắm hoàng hôn' },
        votes: ['Lan Vy', 'Minh Đức (Bạn)', 'Hoàng Anh'],
        hearts: 9
      },
      {
        id: 'cand-d2-beach-2',
        name: 'Bãi Biển Hà My — Hoang Sơ & Tĩnh Lặng',
        categoryTag: 'Biển Yên Bình',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: 'Bãi biển Hà My, Điện Bàn, Hội An',
        cost: '50.000đ / người',
        desc: 'Bãi biển nguyên sơ, hàng dương xanh rì rào che bóng mát.',
        lat: 15.9320,
        lng: 108.3280,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d2-beach-3',
        name: 'Bãi Tắm Tân Thành — Làng Chài Thư Thái',
        categoryTag: 'Làng Chài Ven Biển',
        categoryColor: 'bg-surface text-ink border-ash',
        address: 'Nguyễn Phan Vinh, Cẩm An, Hội An',
        cost: '45.000đ / người',
        desc: 'Bãi biển làng chài bình dị, nhiều quán nước nhỏ xinh.',
        lat: 15.9050,
        lng: 108.3520,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'The Shore Club Mái Che Ven Biển',
      address: 'Đường Lạc Long Quân, Cửa Đại',
      reason: 'Khu vực lounge có mái che thoáng mát nếu trời có gió lớn',
      lat: 15.8921,
      lng: 108.3712
    }
  },
  {
    id: 'stop-d2-6',
    name: 'Chợ Đêm Nguyễn Hoàng & Khám Phá Ẩm Thực Phố Cổ Tối',
    time: '19:00 — 21:30',
    category: 'Trải nghiệm Văn Hóa',
    categoryTag: 'Phố Đèn Lồng Lung Linh',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: 'Đường Nguyễn Hoàng, P. Minh An, Hội An',
    cost: '75.000đ / người',
    lat: 15.8765,
    lng: 108.3265,
    image: hoadangImg,
    desc: 'Dạo quanh hơn 50 gian hàng đèn lồng rực rỡ, mua đồ thủ công mỹ nghệ và thưởng thức các món ăn vặt đường phố: chè hạt sen, bánh xoài, kem ống.',
    transitFromPrev: {
      distance: '4.5km',
      duration: '10 phút',
      mode: 'Xe ô tô đưa về phố cổ',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 10,
    voters: ['Lan Vy', 'Minh Đức', 'Hoàng Anh'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Dạo phố cổ đèn lồng & khám phá chợ đêm sầm uất'
    },
    selectedCandidateId: 'cand-d2-night-1',
    candidates: [
      {
        id: 'cand-d2-night-1',
        name: 'Chợ Đêm Nguyễn Hoàng & Ăn Vặt Ven Sông',
        categoryTag: 'Chợ Đêm & Mua Sắm',
        categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
        address: 'Đường Nguyễn Hoàng, Hội An',
        cost: '75.000đ / người',
        desc: 'Hơn 50 gian hàng đèn lồng lung linh, các món chè bắp hạt sen và quà lưu niệm thủ công.',
        lat: 15.8765,
        lng: 108.3265,
        matchedDesire: { member: 'Lan Vy', desire: 'Phố đèn lồng & chợ đêm ven sông' },
        votes: ['Lan Vy', 'Minh Đức (Bạn)', 'Hoàng Anh'],
        hearts: 10,
        dishes: [
          { name: 'Chè hạt sen long nhãn', price: '20.000đ', note: 'Ngọt thanh bùi béo' },
          { name: 'Bánh bèo chén phố Hội', price: '25.000đ', note: 'Có phần bánh bèo chay nhân đậu hũ' }
        ]
      },
      {
        id: 'cand-d2-night-2',
        name: 'Nhà Hàng Cổ Miss Ly Cafe',
        categoryTag: 'Ẩm Thực Nhà Cổ',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '22 Nguyễn Huệ, Hội An',
        cost: '140.000đ / người',
        desc: 'Không gian nhà cổ ấm cúng, đặc sản hoành thánh chiên và mì xíu.',
        lat: 15.8770,
        lng: 108.3300,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d2-night-3',
        name: 'Tiệc Nướng Sân Vườn Ven Sông Hoài',
        categoryTag: 'Tiệc Nướng Ven Sông',
        categoryColor: 'bg-surface text-ink border-ash',
        address: 'Bến Bạch Đằng, Hội An',
        cost: '120.000đ / người',
        desc: 'Gió sông mát rượi, xiên que nướng than hoa thơm lừng.',
        lat: 15.8755,
        lng: 108.3280,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Nhà Hàng Miss Ly Phố Cổ',
      address: '22 Nguyễn Huệ, Hội An',
      reason: 'Không gian nhà cổ kín đáo trong nhà',
      lat: 15.8770,
      lng: 108.3300
    },
    dishes: [
      { name: 'Chè hạt sen long nhãn', price: '20.000đ', note: 'Ngọt thanh bùi béo' },
      { name: 'Bánh bèo chén phố Hội', price: '25.000đ', note: 'Có phần bánh bèo chay nhân đậu hũ' }
    ]
  }
];

export const INITIAL_DAY_2_REVEALED_STOPS: Stop[] = [
  {
    ...ALL_DAY_2_STOPS[0], // Stop 1: Điểm tâm sáng - ĐANG MỞ BÌNH CHỌN
    name: 'Điểm Tâm Sáng Ngày 2 — [Đang Mở Bình Chọn Mì Quảng / Bánh Mì / Phở]',
    desc: 'Bắt đầu ngày mới với điểm tâm sáng bản địa gần phố cổ. Chốt xong trạm này mới mở khóa trạm Rừng dừa Bảy Mẫu.',
    votesUp: 1,
    voters: ['Hoàng Anh'],
    isSlotConfirmed: false,
    selectedCandidateId: undefined,
    candidates: ALL_DAY_2_STOPS[0].candidates?.map(c =>
      c.id === 'cand-d2-food-1' ? { ...c, votes: ['Hoàng Anh'] } : { ...c, votes: [] }
    )
  }
];

// ==========================================
// DAY 3 ITINERARY: LÀNG GỐM THANH HÀ & TIỄN BAY DAD (4 STOPS)
// All stops feature democratic candidate venue voting, progressive unlock, and desire matching
// ==========================================
export const ALL_DAY_3_STOPS: Stop[] = [
  {
    id: 'stop-d3-1',
    name: 'Quán Giếng Bá Lễ — Bánh Xèo Di Sản & Bánh Cuốn',
    time: '08:00 — 09:15',
    category: 'Ẩm thực Bản địa',
    categoryTag: 'Bánh Xèo Giòn Rụm',
    categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
    address: '45/51 Trần Hưng Đạo, P. Minh An, Hội An',
    cost: '55.000đ / người',
    lat: 15.8795,
    lng: 108.3278,
    desc: 'Bánh xèo vàng ươm giòn tan cuốn bánh tráng rau sống Trà Quế, chấm nước sốt gan đậu bùi béo (có phần bánh xèo nấm chay cho Hoàng Anh).',
    transitFromPrev: {
      distance: '1.2km',
      duration: '4 phút',
      mode: 'Xe điện từ Anio Hotel',
      haversineOk: true
    },
    votesUp: 2,
    votesDown: 0,
    hearts: 8,
    voters: ['Hoàng Anh', 'Minh Đức'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Hoàng Anh',
      desire: 'Bánh xèo nấm giòn rụm với rau tươi Trà Quế thanh vị'
    },
    selectedCandidateId: 'cand-d3-food-1',
    candidates: [
      {
        id: 'cand-d3-food-1',
        name: 'Bánh Xèo Quán Giếng Bá Lễ',
        categoryTag: 'Bánh Xèo Cổ Truyền',
        categoryColor: 'bg-ochre/15 text-ochre border-ochre/30',
        address: '45/51 Trần Hưng Đạo, Hội An',
        cost: '55.000đ / người',
        desc: 'Bánh xèo nấm giá đỗ chay giòn rụm, nước tương đậu phộng gia truyền bùi béo.',
        lat: 15.8795,
        lng: 108.3278,
        matchedDesire: { member: 'Hoàng Anh', desire: 'Bánh xèo chay giòn rụm nước chấm bùi' },
        votes: ['Hoàng Anh', 'Minh Đức (Bạn)'],
        hearts: 9,
        dishes: [
          { name: 'Bánh xèo nấm giá đỗ chay', price: '30.000đ / chiếc', note: 'Rau tươi mầm Trà Quế, tương sốt bùi béo' },
          { name: 'Bánh xèo tôm thịt Bá Lễ', price: '35.000đ / chiếc', note: 'Vàng rụm, nhân tôm thịt đậm đà' }
        ]
      },
      {
        id: 'cand-d3-food-2',
        name: 'Bánh Ướt Thịt Nướng Bà Hường',
        categoryTag: 'Bánh Ướt Thịt Nướng Than',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '31 Hoàng Diệu, Hội An',
        cost: '50.000đ / phần',
        desc: 'Bánh ướt mỏng mịn cuốn thịt xiên nướng chấm nước mắm ớt tỏi.',
        lat: 15.8788,
        lng: 108.3325,
        votes: ['Lan Vy'],
        hearts: 5
      },
      {
        id: 'cand-d3-food-3',
        name: 'Bún Bò Giò Heo Cô Năm Phố Cổ',
        categoryTag: 'Bún Bò Đậm Đà',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '89 Phan Chu Trinh, Hội An',
        cost: '45.000đ / tô',
        desc: 'Nước dùng đậm đà mùi sả ruốc thơm nức, giò heo giòn sần sật.',
        lat: 15.8778,
        lng: 108.3295,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Bánh Ướt Thịt Nướng Bà Hường',
      address: '31 Hoàng Diệu, Hội An',
      reason: 'Địa chỉ đặc sản kế cận',
      lat: 15.8788,
      lng: 108.3325
    },
    dishes: [
      { name: 'Bánh xèo nấm giá đỗ chay', price: '30.000đ / chiếc', note: 'Rau tươi mầm Trà Quế, tương sốt bùi béo' },
      { name: 'Bánh xèo tôm thịt Bá Lễ', price: '35.000đ / chiếc', note: 'Vàng rụm, nhân tôm thịt đậm đà' }
    ]
  },
  {
    id: 'stop-d3-2',
    name: 'Làng Gốm Thanh Hà & Công Viên Đất Nung',
    time: '09:45 — 11:30',
    category: 'Làng Nghề Di Sản',
    categoryTag: 'Gốm Đất Nung 500 Năm',
    categoryColor: 'bg-terracotta/15 text-terracotta border-terracotta/30',
    address: 'Khu phố 5, P. Thanh Hà, Hội An',
    cost: '40.000đ / vé vào cổng',
    lat: 15.8762,
    lng: 108.3035,
    image: hoianImg,
    isHero: true,
    desc: 'Tận tay trải nghiệm chuốt gốm trên bàn xoay truyền thống, nhận món quà lưu niệm tò he gốm đất nung và chiêm ngưỡng công viên gốm lớn nhất Việt Nam.',
    transitFromPrev: {
      distance: '3.2km',
      duration: '8 phút',
      mode: 'Taxi / Xe 7 chỗ',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 9,
    voters: ['Lan Vy', 'Minh Đức', 'Hoàng Anh'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Lan Vy',
      desire: 'Trải nghiệm nặn gốm thủ công & chụp ảnh kiến trúc đất nung'
    },
    selectedCandidateId: 'cand-d3-pottery-1',
    candidates: [
      {
        id: 'cand-d3-pottery-1',
        name: 'Lò Gốm Truyền Thống & Công Viên Đất Nung Thanh Hà',
        categoryTag: 'Làng Gốm & Đất Nung Di Sản',
        categoryColor: 'bg-terracotta/15 text-terracotta border-terracotta/30',
        address: 'P. Thanh Hà, Hội An',
        cost: '40.000đ / vé',
        desc: 'Tự tay chuốt gốm trên bàn xoay, tặng tò he nặn thổi kêu vui tai, ngắm công viên đất nung kỳ quan.',
        lat: 15.8762,
        lng: 108.3035,
        matchedDesire: { member: 'Lan Vy', desire: 'Trải nghiệm nặn gốm & công viên đất nung' },
        votes: ['Lan Vy', 'Minh Đức (Bạn)', 'Hoàng Anh'],
        hearts: 9
      },
      {
        id: 'cand-d3-pottery-2',
        name: 'Làng Mộc Kim Bồng (Qua Đò Sông Thu Bồn)',
        categoryTag: 'Làng Nghề Mộc Cổ Truyền',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: 'Xã Cẩm Kim, Hội An',
        cost: '40.000đ / vé đò',
        desc: 'Đi đò sang cù lao chiêm ngưỡng nghệ nhân chạm trổ mộc tinh xảo.',
        lat: 15.8670,
        lng: 108.3230,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d3-pottery-3',
        name: 'Bảo Tàng Lịch Sử Gốm Sứ Mậu Dịch',
        categoryTag: 'Bảo Tàng Cổ Vật Trong Nhà',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '80 Trần Phú, Hội An',
        cost: '30.000đ / vé',
        desc: 'Trưng bày hàng trăm cổ vật gốm sứ trục vớt từ các con tàu đắm mậu dịch cổ.',
        lat: 15.8770,
        lng: 108.3275,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Bảo Tàng Gốm Sứ Mậu Dịch',
      address: '80 Trần Phú, Hội An',
      reason: 'Không gian trưng bày trong nhà mát mẻ',
      lat: 15.8770,
      lng: 108.3275
    }
  },
  {
    id: 'stop-d3-3',
    name: 'Mua Đặc Sản Bánh Đậu Xanh Làm Quà & Trả Phòng Anio',
    time: '11:45 — 12:45',
    category: 'Mua Sắm & Check-out',
    categoryTag: 'Quà Di Sản Gốc',
    categoryColor: 'bg-moss/15 text-moss border-moss/30',
    address: '49 Lê Hồng Phong & Cơ sở Bánh đậu xanh Hội An',
    cost: '120.000đ / người',
    lat: 15.8893,
    lng: 108.3375,
    desc: 'Mua sắm đặc sản bánh đậu xanh nướng củi, trà tim sen thảo mộc làm quà cho người thân, hoàn tất thu xếp hành lý và thủ tục trả phòng khách sạn.',
    transitFromPrev: {
      distance: '3.5km',
      duration: '9 phút',
      mode: 'Xe ô tô đưa về khách sạn',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 8,
    voters: ['Minh Đức', 'Hoàng Anh', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Minh Đức',
      desire: 'Mua đặc sản chuẩn gốc làm quà & kiểm soát đúng ngân sách 3.5tr'
    },
    selectedCandidateId: 'cand-d3-gift-1',
    candidates: [
      {
        id: 'cand-d3-gift-1',
        name: 'Lò Bánh Đậu Xanh Nướng & Trà Sen Cổ Truyền',
        categoryTag: 'Đặc Sản Quà Quê Gốc',
        categoryColor: 'bg-moss/15 text-moss border-moss/30',
        address: '49 Lê Hồng Phong & Phan Chu Trinh, Hội An',
        cost: '120.000đ / hộp quà',
        desc: 'Bánh đậu xanh nướng giòn thơm đặc sản gốc Hội An, trà sen thanh tao bọc hộp quà trang nhã.',
        lat: 15.8893,
        lng: 108.3375,
        matchedDesire: { member: 'Minh Đức', desire: 'Đặc sản làm quà chuẩn gốc & ngân sách hợp lý' },
        votes: ['Minh Đức (Bạn)', 'Hoàng Anh', 'Lan Vy'],
        hearts: 9
      },
      {
        id: 'cand-d3-gift-2',
        name: 'Xưởng Đèn Lồng Lụa Hà Linh',
        categoryTag: 'Đèn Lồng Lụa Thủ Công',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '72 Trần Phú, Hội An',
        cost: '100.000đ / chiếc',
        desc: 'Đèn lồng khung tre bọc lụa Hà Đông gấp gọn tiện mang lên máy bay.',
        lat: 15.8772,
        lng: 108.3280,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d3-gift-3',
        name: 'Trầm Hương Phố Cổ & Quà Di Sản',
        categoryTag: 'Trầm Hương Thảo Mộc',
        categoryColor: 'bg-surface text-ink border-ash',
        address: '15 Nguyễn Thái Học, Hội An',
        cost: '150.000đ / phần',
        desc: 'Nụ trầm hương Quảng Nam tự nhiên thơm dịu thư thái.',
        lat: 15.8760,
        lng: 108.3270,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Cửa Hàng Đặc Sản Phố Hội OCOP',
      address: '12 Hoàng Diệu, Hội An',
      reason: 'Trung tâm đặc sản có tem kiểm định OCOP',
      lat: 15.8790,
      lng: 108.3320
    }
  },
  {
    id: 'stop-d3-4',
    name: 'Cơm Gà Bà Buội & Xe Ô Tô Đưa Tiễn Sân Bay DAD (Ga T1)',
    time: '13:00 — 15:30',
    category: 'Ẩm thực & Tiễn bay',
    categoryTag: 'Kết Thúc Chuyến Đi',
    categoryColor: 'bg-navy/15 text-navy border-navy/30',
    address: '22 Phan Chu Trinh (Hội An) → Sân Bay Quốc Tế Đà Nẵng (DAD)',
    cost: '75.000đ / người (Bữa trưa)',
    lat: 16.0538,
    lng: 108.2022,
    desc: 'Dùng bữa cơm gà gia truyền thơm dẻo (có cơm chiên nấm đùi gà xíu chay cho Hoàng Anh), sau đó xe 7 chỗ đón tiễn đoàn thẳng về Ga T1 Sân bay Đà Nẵng.',
    transitFromPrev: {
      distance: '29.2km',
      duration: '45 phút',
      mode: 'Xe ô tô 7 chỗ riêng đón tiễn sân bay',
      haversineOk: true
    },
    votesUp: 3,
    votesDown: 0,
    hearts: 10,
    voters: ['Minh Đức', 'Hoàng Anh', 'Lan Vy'],
    suggestedBy: 'AI Agent tuyển chọn',
    matchedDesire: {
      member: 'Minh Đức',
      desire: 'Xe ô tô đưa tiễn đúng giờ bay tại ga T1 Sân bay DAD'
    },
    selectedCandidateId: 'cand-d3-airport-1',
    candidates: [
      {
        id: 'cand-d3-airport-1',
        name: 'Cơm Gà Bà Buội & Xe Đưa Tiễn Ga T1 DAD',
        categoryTag: 'Cơm Gà Cổ Truyền & Tiễn Bay',
        categoryColor: 'bg-navy/15 text-navy border-navy/30',
        address: '22 Phan Chu Trinh, Hội An → Ga T1 Sân bay DAD',
        cost: '75.000đ / người',
        desc: 'Cơm gà xé vàng óng gia truyền, có phần cơm nấm đùi gà xíu chay riêng cho Hoàng Anh, xe 7 chỗ đưa thẳng ra sân bay.',
        lat: 16.0538,
        lng: 108.2022,
        matchedDesire: { member: 'Minh Đức', desire: 'Xe riêng tiễn ga T1 DAD đúng giờ bay' },
        votes: ['Minh Đức (Bạn)', 'Hoàng Anh', 'Lan Vy'],
        hearts: 10,
        dishes: [
          { name: 'Cơm nấm đùi gà chay xào sả ớt', price: '50.000đ', note: 'Cơm thơm nghệ, nấm xào thấm vị' },
          { name: 'Cơm gà xé gia truyền Bà Buội', price: '65.000đ', note: 'Gà ta thả vườn, gỏi hành tây rau răm' }
        ]
      },
      {
        id: 'cand-d3-airport-2',
        name: 'Mì Quảng Ếch Bếp Trang (Đà Nẵng) & Tiễn Bay',
        categoryTag: 'Mì Quảng Ếch Đà Nẵng',
        categoryColor: 'bg-amber-100 text-amber-800 border-amber-200',
        address: '441 Ông Ích Khiêm, Hải Châu, Đà Nẵng',
        cost: '65.000đ / phần',
        desc: 'Mẹt mì quảng ếch om nóng trong thố đất đậm đà trên đường ra sân bay.',
        lat: 16.0620,
        lng: 108.2150,
        votes: [],
        hearts: 4
      },
      {
        id: 'cand-d3-airport-3',
        name: 'Bê Thui Cầu Mống Mười Hiển & Tiễn Bay',
        categoryTag: 'Đặc Sản Quảng Nam',
        categoryColor: 'bg-surface text-ink border-ash',
        address: 'Quốc lộ 1A, Điện Bàn → Sân bay DAD',
        cost: '90.000đ / phần',
        desc: 'Thịt bê thui tái chín da giòn, chấm mắm nêm đậm đà.',
        lat: 15.9000,
        lng: 108.2300,
        votes: [],
        hearts: 3
      }
    ],
    backupOption: {
      name: 'Phòng Chờ Sân Bay DAD & Mì Quảng Ga Quốc Nội',
      address: 'Ga T1 Sân bay Đà Nẵng',
      reason: 'Ăn nhẹ ngay tại sân bay trước giờ lên tàu bay',
      lat: 16.0538,
      lng: 108.2022
    },
    dishes: [
      { name: 'Cơm nấm đùi gà chay xào sả ớt', price: '50.000đ', note: 'Cơm thơm nghệ, nấm xào thấm vị' },
      { name: 'Cơm gà xé gia truyền Bà Buội', price: '65.000đ', note: 'Gà ta thả vườn, gỏi hành tây rau răm' }
    ]
  }
];

export const INITIAL_DAY_3_REVEALED_STOPS: Stop[] = [
  {
    ...ALL_DAY_3_STOPS[0], // Stop 1: Bánh Xèo Bà Lễ - ĐANG MỞ BÌNH CHỌN
    name: 'Điểm Tâm Sáng Ngày 3 — [Đang Mở Bình Chọn Bánh Xèo / Bánh Ướt / Bún Bò]',
    desc: 'Điểm tâm sáng ngày cuối cùng với các món nóng giòn đặc sản Hội An. Chốt xong trạm này mới mở khóa trạm Làng Gốm Thanh Hà.',
    votesUp: 1,
    voters: ['Hoàng Anh'],
    isSlotConfirmed: false,
    selectedCandidateId: undefined,
    candidates: ALL_DAY_3_STOPS[0].candidates?.map(c =>
      c.id === 'cand-d3-food-1' ? { ...c, votes: ['Hoàng Anh'] } : { ...c, votes: [] }
    )
  }
];

export const PROPOSALS: ProposalOption[] = [
  {
    key: 'A',
    title: 'Phương Án A: Phố Cổ & Di Sản Ẩm Thực',
    tag: 'Gợi Ý Phổ Biến Nhất',
    stopsCount: 8,
    highlights: ['Đón sân bay DAD', 'Anio Hotel', 'Bánh mì Phượng', 'Faifo Rooftop', 'Bếp Cuốn', 'Biển An Bàng', 'Hoa đăng sông Hoài'],
    estCost: '480.000đ / ngày ẩm thực',
    totalTripEst: '3.450.000đ / người (Đạt ngân sách)',
    vibe: 'Thong thả, lãng mạn, chuẩn vị di sản, có món chay ngon.',
    daysOverview: [
      { day: 1, title: 'Ngày 1: Đón Bay & Phố Cổ Hội An', desc: 'Sân bay DAD → Check-in Anio Hotel → Bánh mì Phượng → Faifo Coffee → Bếp Cuốn → Nghỉ trưa → Biển An Bàng → Hoa đăng sông Hoài' },
      { day: 2, title: 'Ngày 2: Rừng Dừa Bảy Mẫu & Làng Quê', desc: 'Chèo thuyền thúng Cẩm Thanh → Nghỉ trưa cafe sân vườn → Hoàng hôn bãi biển → Chợ đêm Hội An' },
      { day: 3, title: 'Ngày 3: Làng Gốm Thanh Hà & Tiễn Bay', desc: 'Trải nghiệm chuốt gốm thủ công → Mua sắm đặc sản bánh đậu xanh → Trả phòng & Tiễn sân bay Đà Nẵng' }
    ],
    votes: ['Hoàng Anh', 'Lan Vy']
  },
  {
    key: 'B',
    title: 'Phương Án B: Sinh Thái Trải Nghiệm Hoạt Bát',
    tag: 'Trải Nghiệm Năng Động',
    stopsCount: 7,
    highlights: ['Chèo thuyền thúng Bảy Mẫu', 'Múa thúng sông nước', 'Nặn gốm Thanh Hà', 'Hải sản Cửa Đại'],
    estCost: '540.000đ / ngày',
    totalTripEst: '3.800.000đ / người',
    vibe: 'Gần gũi thiên nhiên, vui nhộn, chụp ảnh sống động nhiều hoạt động ngoài trời.',
    daysOverview: [
      { day: 1, title: 'Ngày 1: Đón Bay & Biển Mỹ Khê', desc: 'Đón sân bay DAD → Bán đảo Sơn Trà → Check-in khách sạn biển → Chợ đêm Helio' },
      { day: 2, title: 'Ngày 2: Sinh Thái Rừng Dừa Bảy Mẫu', desc: 'Thuyền thúng Cẩm Thanh → Bắt cá câu cua sông nước → Tiệc hải sản Cửa Đại' },
      { day: 3, title: 'Ngày 3: Phố Cổ Hội An & Tiễn Bay', desc: 'Khám phá Chùa Cầu → Thả hoa đăng sớm → Xe đưa ra sân bay DAD' }
    ],
    votes: []
  },
  {
    key: 'C',
    title: 'Phương Án C: Chill Biển An Bàng & Cafe Hoàng Hôn',
    tag: 'Nghỉ Dưỡng Thảnh Thơi',
    stopsCount: 6,
    highlights: ['Brunch tại Soul Kitchen', 'Tắm biển An Bàng', 'Cafe The Deck House hoàng hôn'],
    estCost: '620.000đ / ngày',
    totalTripEst: '4.200.000đ / người',
    vibe: 'Thư giãn hoàn toàn, gió biển dịu mát, cocktails thư thái, nhịp điệu thong dong.',
    daysOverview: [
      { day: 1, title: 'Ngày 1: Biển An Bàng & Beach Bar', desc: 'Đón bay → Nhận resort ven biển → Chill Soul Kitchen → Ngắm hoàng hôn biển' },
      { day: 2, title: 'Ngày 2: Phố Cổ Hội An Về Chiều', desc: 'Dạo bộ ngõ cổ rêu phong → Uống nước Mót → Cafe Reaching Out nhà cổ' },
      { day: 3, title: 'Ngày 3: Spa Thư Giãn & Khởi Hành Về', desc: 'Thư giãn spa trị liệu thảo mộc → Mua quà di sản → Tiễn sân bay DAD' }
    ],
    votes: []
  }
];

export const INITIAL_CHECKLIST: ChecklistItem[] = [
  { id: 1, text: 'Căn cước công dân / Hộ chiếu gốc', category: 'Giấy Tờ', assignedTo: 'Cả nhóm', done: true },
  { id: 2, text: 'Vé máy bay khứ hồi điện tử (Vietnam Airlines VN114)', category: 'Giấy Tờ', assignedTo: 'Minh Đức', done: true },
  { id: 3, text: 'Xác nhận đặt phòng Anio Boutique Hotel', category: 'Lưu Trú', assignedTo: 'Hoàng Anh', done: true },
  { id: 4, text: 'Ô dù cầm tay gấp gọn (phòng mưa rào chiều)', category: 'Vật Dụng', assignedTo: 'Hoàng Anh', done: true },
  { id: 5, text: 'Đồ bơi & kính râm đi biển An Bàng', category: 'Trang Phục', assignedTo: 'Lan Vy', done: true },
  { id: 6, text: 'Kem chống nắng SPF 50+ & thuốc say xe', category: 'Sức Khỏe', assignedTo: 'Minh Đức', done: true },
  { id: 7, text: 'Sạc dự phòng 20.000mAh & cáp sạc nhanh', category: 'Điện Tử', assignedTo: 'Minh Đức', done: false },
  { id: 8, text: 'Giày sandal êm chân đi bộ ngõ cổ không mỏi', category: 'Trang Phục', assignedTo: 'Cả nhóm', done: true }
];

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 1,
    sender: 'friend',
    name: 'Hoàng Anh',
    time: '08:00',
    text: 'Hú le cả nhà ơi! Cuối tuần này cả nhóm mình đi Đà Nẵng - Hội An 3N2Đ là chốt cứng lịch rồi nha 🎉 Giờ từng người khai báo gu du lịch với ngân sách để nhờ @agent thiết kế khung tổng quan nhé!'
  },
  {
    id: 2,
    sender: 'friend',
    name: 'Lan Vy',
    time: '08:02',
    text: 'Hí hí em hóng chuyến này mãi! Ngân sách em tầm 3.5 triệu/người thôi nha mn, đi thong thả thôi chứ đừng chạy sô mệt lắm. Em mê cafe view mái ngói phố cổ chụp ảnh film nè 📸, chiều thích dạo bãi biển ngắm hoàng hôn chill chill, tối đi thuyền thả hoa đăng sông Hoài nữa ạ!'
  },
  {
    id: 3,
    sender: 'friend',
    name: 'Hoàng Anh',
    time: '08:04',
    text: 'Duyệt luôn! Mình thì ăn chay trường nên quán nào cũng phải soi kỹ xem có món chay bản địa chuẩn vị không đấy nhé, không là mình chỉ ngồi uống nước lọc nhìn hai người ăn thịt nướng thôi đó haha 😂 Với lại trưa 12h30 - 14h30 trời Hội An nắng gắt 35°C dễ say nắng lắm, nhóm mình phải về phòng lạnh nghỉ ngơi nghen. Minh Đức làm trưởng đoàn lo vụ xe cộ đón tiễn sân bay với tìm khách sạn nha!'
  }
];

export interface MemberDesireItem {
  title: string;
  category: string;
  detail: string;
}

export interface MemberDesireGroup {
  memberName: string;
  avatarColor: string;
  roleBadge: string;
  desires: MemberDesireItem[];
}

export const MEMBER_DESIRES: MemberDesireGroup[] = [
  {
    memberName: 'Lan Vy',
    avatarColor: 'bg-moss/20 text-moss',
    roleBadge: 'Gu Check-in & Hoàng Hôn Biển',
    desires: [
      {
        title: 'Cafe Rooftop Ngắm Mái Ngói Cổ',
        category: 'Không gian & Check-in',
        detail: 'Ngồi ban công tầng cao ngắm trọn vẹn dãy ngói âm dương rêu phong phố Hội để chụp ảnh film.'
      },
      {
        title: 'Hóng Gió & Hoàng Hôn Biển Chiều',
        category: 'Thư giãn thiên nhiên',
        detail: 'Bãi biển lộng gió chiều mát, đi dạo cát trắng và uống nước dừa tươi thư thái.'
      },
      {
        title: 'Thả Hoa Đăng Sông Hoài Buổi Tối',
        category: 'Văn hóa bản địa',
        detail: 'Đi thuyền gỗ mộc, thả hoa đăng lung linh ánh nến cầu may mắn khi phố lên đèn.'
      }
    ]
  },
  {
    memberName: 'Hoàng Anh',
    avatarColor: 'bg-ochre/20 text-ochre',
    roleBadge: 'Ẩm Thực Chay & Thể Lực',
    desires: [
      {
        title: 'Đặc Sản Bản Địa Có Món Chay Chuẩn Vị',
        category: 'Khẩu vị ẩm thực',
        detail: 'Ăn chay trường, cần quán đặc sản có món chay phong phú (Cao lầu chay nấm, gỏi cuốn chay).'
      },
      {
        title: 'Điểm Tâm Sáng Tiện Lợi & Bánh Mì Chay',
        category: 'Ăn sáng thanh đạm',
        detail: 'Bữa sáng nhanh gọn, có ổ bánh mì pate chay nấm tươi ngon chuẩn vị Hội An.'
      },
      {
        title: 'Nghỉ Trưa Phòng Lạnh Tránh Nắng 12h30 - 14h30',
        category: 'Sức khỏe & Nhịp sinh hoạt',
        detail: 'Khung giờ trưa nắng gắt 35°C về khách sạn ngả lưng nghỉ ngơi, không đi bộ ngoài trời.'
      }
    ]
  },
  {
    memberName: 'Minh Đức (Bạn)',
    avatarColor: 'bg-terracotta/20 text-terracotta',
    roleBadge: 'Hậu Cần, Lưu Trú & Ngân Sách',
    desires: [
      {
        title: 'Kiểm Soát Ngân Sách 3.500.000đ / Người',
        category: 'Tài chính chuyến đi',
        detail: 'Toàn bộ chi phí ăn uống, lưu trú, vé tham quan gói gọn trong mức 3.5tr/người cho 3N2Đ.'
      },
      {
        title: 'Xe Ô Tô 7 Chỗ Đón Sân Bay DAD Ga T1',
        category: 'Trung chuyển cửa ngõ',
        detail: 'Hạ cánh ga quốc nội Đà Nẵng có xe đón thẳng về Hội An qua cung đường biển êm ái.'
      },
      {
        title: 'Khách Sạn Boutique Di Sản Gần Phố Cổ',
        category: 'Lưu trú nghỉ dưỡng',
        detail: 'Không gian kiến trúc Đông Dương hoài cổ, cự ly gần phố cổ để tiện đi bộ thong thả.'
      }
    ]
  }
];

// Keep backward compatibility
export const MEMBER_WISHLIST = MEMBER_DESIRES.map(m => ({
  memberName: m.memberName,
  avatarColor: m.avatarColor,
  badge: m.roleBadge,
  suggestions: m.desires.map(d => ({
    name: d.title,
    category: d.category,
    note: d.detail
  }))
}));

export interface ScriptStep {
  stepIndex: number;
  label: string;
  shortDesc: string;
  userPrompt: string;
  badge: string;
}

export const DEMO_SCENARIO_STEPS: ScriptStep[] = [
  {
    stepIndex: 1,
    label: 'Khởi Động Kèo & Đưa Bài Toán Nguyện Vọng Cho @agent',
    shortDesc: 'Đà Nẵng - Hội An, 3N2Đ, 3.5tr/người, món chay, tránh nắng 35°C & ảnh film',
    userPrompt: '@agent Nhóm mình 3 người đi Đà Nẵng - Hội An 3N2Đ cuối tuần này, ngân sách giữ đúng 3.5 triệu/người. Lan Vy mê cafe rooftop ngắm mái ngói & hoàng hôn biển; Hoàng Anh ăn chay trường & cần nghỉ trưa tránh nắng 35°C; mình cần xe đón sân bay DAD & khách sạn boutique tiện đi lại. Hãy tính toán đề xuất các phương án vĩ mô phù hợp nhất cho nhóm!',
    badge: '1. Khởi Động Kèo'
  },
  {
    stepIndex: 2,
    label: 'Tranh Luận 3 Phương Án & Biểu Quyết Khóa Vĩ Mô A',
    shortDesc: 'Nhóm phân tích A, B, C; đạt 100% đồng thuận A; Host khóa vĩ mô mở Tổng Quan 3N2Đ',
    userPrompt: '@agent Cả nhóm đã thảo luận và bỏ phiếu đạt 100% đồng thuận (3/3 thành viên) cho Phương Án A (Phố Cổ & Di Sản Ẩm Thực). Host tiến hành Khóa Lộ Trình Vĩ Mô và mở bảng Tổng Quan 3N2Đ nhé!',
    badge: '2. Khóa Vĩ Mô A'
  },
  {
    stepIndex: 3,
    label: 'Bàn Luận Chỗ Ở & Biểu Quyết Khách Sạn Anio Boutique',
    shortDesc: 'Lan Vy & Minh Đức ưng Anio (1.45tr/phòng); chốt xong trạm 2 mới mở duy nhất trạm 3',
    userPrompt: '@agent Về chỗ ở: Nhóm mình biểu quyết chốt Anio Boutique Hotel (2/3 phiếu). Chốt xong trạm khách sạn để mở khóa trạm tiếp theo nhé!',
    badge: '3. Chốt Khách Sạn'
  },
  {
    stepIndex: 4,
    label: 'Săn Điểm Tâm Sáng & Kiểm Tra Món Chay (Bánh Mì Phượng)',
    shortDesc: 'Hoàng Anh check pate nấm chay; nhóm chốt 3/3; mở duy nhất trạm 4 Cafe sáng',
    userPrompt: '@agent Điểm tâm sáng nhóm vote chốt Bánh Mì Phượng (có bánh mì chay nấm cho Hoàng Anh). Chốt trạm 3 và mở khóa trạm Cafe sáng giúp nhóm nhé!',
    badge: '4. Chốt Bánh Mì'
  },
  {
    stepIndex: 5,
    label: 'Tranh Luận Quán Cafe Sống Ảo (Faifo Rooftop vs Reaching Out)',
    shortDesc: 'Lan Vy nài nỉ góc ngắm ngói âm dương; vote Faifo (2/3); mở Trạm 5 Ăn Trưa & Trạm 6 Nghỉ Trưa',
    userPrompt: '@agent Trạm cafe sáng nhóm vote chọn Faifo Coffee Rooftop (2/3 phiếu). Chốt trạm cafe và mở khóa trạm ăn trưa để Hoàng Anh kiểm tra món chay nhé!',
    badge: '5. Chốt Faifo Cafe'
  },
  {
    stepIndex: 6,
    label: 'Đối Soát Thực Đơn Chay Bếp Cuốn & Tránh Nắng Đỉnh Điểm 35°C',
    shortDesc: 'Agent tư vấn Cao Lầu chay giếng Bá Lễ; nhóm chốt 3/3; mở khóa Trạm 7 Biển & Trạm 8 Hoa Đăng',
    userPrompt: '@agent Trưa nay tại Bếp Cuốn có món chay cho Hoàng Anh không? Cả nhóm đồng thuận 3/3 vote chốt Bếp Cuốn và mở khóa các trạm chiều tối nhé!',
    badge: '6. Chốt Bếp Cuốn'
  },
  {
    stepIndex: 7,
    label: 'Xử Lý Sự Cố Đột Xuất: Cảnh Báo Mưa Dông 15h30 & Auto-Swap',
    shortDesc: 'Lan Vy báo dông lốc sợ ướt máy ảnh; Agent tự động hoán đổi Faifo sang Reaching Out nhà cổ',
    userPrompt: '@agent Chiều nay trời mưa dông to, chuyển quán cafe sang Reaching Out Teahouse trong nhà ấm cúng và khóa lịch trình chính thức Ngày 1 giúp nhóm với!',
    badge: '7. Xử Lý Mưa Dông'
  },
  {
    stepIndex: 8,
    label: 'Khám Phá Ngày 2: Kèo Thuyền Thúng Rừng Dừa & Bữa Trưa Ven Đồng',
    shortDesc: 'Sang Ngày 2; chốt Mì Quảng Bá Lễ & Thuyền thúng Bác Bảy; mở khóa The Field & Biển Cửa Đại',
    userPrompt: '@agent Mở tab Ngày 2: Nhóm mình biểu quyết chốt Điểm tâm Mì Quảng Bá Lễ và Thuyền thúng Bác Bảy múa thúng xoay tít (70k/người) nhé!',
    badge: '8. Biểu Quyết Ngày 2'
  },
  {
    stepIndex: 9,
    label: 'Chốt Ngày 3: Nặn Gốm Thanh Hà, Mua Quà & Khóa Toàn Bộ (Final Lock)',
    shortDesc: 'Bánh xèo Bá Lễ, nặn tò he, bánh đậu xanh nướng, xe tiễn ga T1 DAD; Host Khóa 100%',
    userPrompt: '@agent Sang Ngày 3: Nhóm chốt ăn sáng Bánh xèo Giếng Bá Lễ, nặn gốm Thanh Hà, mua đặc sản bánh đậu xanh nướng củi làm quà và xe 7 chỗ tiễn thẳng ga T1 sân bay DAD lúc 14h15. Host tiến hành Khóa Toàn Bộ Lịch Trình 3N2Đ luôn nhé!',
    badge: '9. Khóa Toàn Bộ 100%'
  }
];
