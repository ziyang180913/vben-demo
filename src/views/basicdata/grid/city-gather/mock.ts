// 城市聚客点 - 本地 mock 数据

export interface HotDataItem {
  id: number;
  name: string;
  lng: number;
  lat: number;
  lon?: number;
  marker?: {
    lon: number;
    lat: number;
  };
  boundary: number[][];
  polygon?: number[][];
  fence_type?: string;
  month_uv?: number;
  circle_id?: string;
  area?: string;
  hotel_cnt?: number;
  room_cnt?: number;
  month_live_cnt?: number;
  weekday_live_avg?: number;
  weekend_live_avg?: number;
}

// 模拟聚客点列表数据
export const mockGatheringPoint = (
  zipcode?: string,
): { code: number; data: HotDataItem[]; message?: string } => {
  const baseLng = 113.9 + Math.random() * 0.1;
  const baseLat = 22.5 + Math.random() * 0.05;

  const data: HotDataItem[] = [
    {
      id: 1,
      name: '福田CBD商圈',
      lng: baseLng,
      lat: baseLat,
      marker: { lon: baseLng, lat: baseLat },
      boundary: [
        [baseLng - 0.01, baseLat - 0.01],
        [baseLng + 0.01, baseLat - 0.01],
        [baseLng + 0.01, baseLat + 0.01],
        [baseLng - 0.01, baseLat + 0.01],
      ],
      polygon: [
        [baseLng - 0.01, baseLat - 0.01],
        [baseLng + 0.01, baseLat - 0.01],
        [baseLng + 0.01, baseLat + 0.01],
        [baseLng - 0.01, baseLat + 0.01],
      ],
      fence_type: '商务',
      month_uv: 125000,
      circle_id: 'SW001',
      area: '2.5km²',
      hotel_cnt: 12,
      room_cnt: 3500,
      month_live_cnt: 8500,
      weekday_live_avg: 280,
      weekend_live_avg: 320,
    },
    {
      id: 2,
      name: '东门步行街',
      lng: baseLng + 0.03,
      lat: baseLat + 0.02,
      marker: { lon: baseLng + 0.03, lat: baseLat + 0.02 },
      boundary: [
        [baseLng + 0.02, baseLat + 0.01],
        [baseLng + 0.04, baseLat + 0.01],
        [baseLng + 0.04, baseLat + 0.03],
        [baseLng + 0.02, baseLat + 0.03],
      ],
      polygon: [
        [baseLng + 0.02, baseLat + 0.01],
        [baseLng + 0.04, baseLat + 0.01],
        [baseLng + 0.04, baseLat + 0.03],
        [baseLng + 0.02, baseLat + 0.03],
      ],
      fence_type: '商业',
      month_uv: 98000,
      circle_id: 'SY002',
      area: '1.8km²',
      hotel_cnt: 8,
      room_cnt: 2100,
      month_live_cnt: 6200,
      weekday_live_avg: 210,
      weekend_live_avg: 280,
    },
    {
      id: 3,
      name: '深圳湾公园',
      lng: baseLng - 0.02,
      lat: baseLat - 0.03,
      marker: { lon: baseLng - 0.02, lat: baseLat - 0.03 },
      boundary: [
        [baseLng - 0.03, baseLat - 0.04],
        [baseLng - 0.01, baseLat - 0.04],
        [baseLng - 0.01, baseLat - 0.02],
        [baseLng - 0.03, baseLat - 0.02],
      ],
      polygon: [
        [baseLng - 0.03, baseLat - 0.04],
        [baseLng - 0.01, baseLat - 0.04],
        [baseLng - 0.01, baseLat - 0.02],
        [baseLng - 0.03, baseLat - 0.02],
      ],
      fence_type: '旅游',
      month_uv: 156000,
      circle_id: 'LY003',
      area: '4.2km²',
      hotel_cnt: 5,
      room_cnt: 1200,
      month_live_cnt: 4500,
      weekday_live_avg: 150,
      weekend_live_avg: 380,
    },
    {
      id: 4,
      name: '会展中心',
      lng: baseLng + 0.05,
      lat: baseLat - 0.01,
      marker: { lon: baseLng + 0.05, lat: baseLat - 0.01 },
      boundary: [
        [baseLng + 0.04, baseLat - 0.02],
        [baseLng + 0.06, baseLat - 0.02],
        [baseLng + 0.06, baseLat],
        [baseLng + 0.04, baseLat],
      ],
      polygon: [
        [baseLng + 0.04, baseLat - 0.02],
        [baseLng + 0.06, baseLat - 0.02],
        [baseLng + 0.06, baseLat],
        [baseLng + 0.04, baseLat],
      ],
      fence_type: '展会',
      month_uv: 87000,
      circle_id: 'ZH004',
      area: '3.0km²',
      hotel_cnt: 15,
      room_cnt: 4200,
      month_live_cnt: 9800,
      weekday_live_avg: 330,
      weekend_live_avg: 290,
    },
    {
      id: 5,
      name: '市人民医院',
      lng: baseLng - 0.04,
      lat: baseLat + 0.03,
      marker: { lon: baseLng - 0.04, lat: baseLat + 0.03 },
      boundary: [
        [baseLng - 0.05, baseLat + 0.02],
        [baseLng - 0.03, baseLat + 0.02],
        [baseLng - 0.03, baseLat + 0.04],
        [baseLng - 0.05, baseLat + 0.04],
      ],
      polygon: [
        [baseLng - 0.05, baseLat + 0.02],
        [baseLng - 0.03, baseLat + 0.02],
        [baseLng - 0.03, baseLat + 0.04],
        [baseLng - 0.05, baseLat + 0.04],
      ],
      fence_type: '就医',
      month_uv: 65000,
      circle_id: 'JY005',
      area: '1.5km²',
      hotel_cnt: 6,
      room_cnt: 1500,
      month_live_cnt: 5200,
      weekday_live_avg: 175,
      weekend_live_avg: 160,
    },
    {
      id: 6,
      name: '万象城综合体',
      lng: baseLng + 0.01,
      lat: baseLat + 0.04,
      marker: { lon: baseLng + 0.01, lat: baseLat + 0.04 },
      boundary: [
        [baseLng, baseLat + 0.03],
        [baseLng + 0.02, baseLat + 0.03],
        [baseLng + 0.02, baseLat + 0.05],
        [baseLng, baseLat + 0.05],
      ],
      polygon: [
        [baseLng, baseLat + 0.03],
        [baseLng + 0.02, baseLat + 0.03],
        [baseLng + 0.02, baseLat + 0.05],
        [baseLng, baseLat + 0.05],
      ],
      fence_type: '综合',
      month_uv: 112000,
      circle_id: 'ZH006',
      area: '2.2km²',
      hotel_cnt: 10,
      room_cnt: 2800,
      month_live_cnt: 7800,
      weekday_live_avg: 260,
      weekend_live_avg: 310,
    },
  ];

  return {
    code: 200,
    data,
    message: 'success',
  };
};

// 模拟酒店圈数据
export const mockHotelCircle = (
  id: number,
): { code: number; data?: { fence: any[]; poi_data: any[] }; message?: string } => {
  const baseLng = 113.9 + Math.random() * 0.1;
  const baseLat = 22.5 + Math.random() * 0.05;

  return {
    code: 200,
    data: {
      fence: [
        [baseLng - 0.005, baseLat - 0.005],
        [baseLng + 0.005, baseLat - 0.005],
        [baseLng + 0.005, baseLat + 0.005],
        [baseLng - 0.005, baseLat + 0.005],
      ],
      poi_data: [
        {
          poi_id: `H${id}01`,
          poi_name: '希尔顿酒店',
          location: `${baseLng + 0.002},${baseLat + 0.001}`,
        },
        {
          poi_id: `H${id}02`,
          poi_name: '万豪酒店',
          location: `${baseLng - 0.001},${baseLat - 0.002}`,
        },
        {
          poi_id: `H${id}03`,
          poi_name: '洲际酒店',
          location: `${baseLng + 0.003},${baseLat - 0.001}`,
        },
      ],
    },
    message: 'success',
  };
};

// 模拟客群画像数据
export const mockGatheringPointPortrait = (): { code: number; data: any; message?: string } => {
  return {
    code: 200,
    data: {
      sex: {
        女: 0.48,
        男: 0.52,
      },
      hotel_prices: {
        '200元以下': 0.15,
        '200-400元': 0.35,
        '400-600元': 0.3,
        '600元以上': 0.2,
      },
      hotel_levels: {
        经济型: 0.25,
        舒适型: 0.35,
        高档型: 0.3,
        豪华型: 0.1,
      },
      hotel_brands: {
        如家: 120,
        汉庭: 98,
        全季: 85,
        亚朵: 72,
        桔子: 65,
        维也纳: 58,
        锦江之星: 45,
        '7天': 38,
      },
      source_city: {
        source_province: {
          广东: 0.45,
          湖南: 0.12,
          湖北: 0.1,
          江西: 0.08,
          广西: 0.07,
          福建: 0.06,
          其他: 0.12,
        },
        source_city: {
          '深圳市,深圳': 0.28,
          '广州市,广州': 0.17,
          '东莞市,东莞': 0.08,
          '长沙市,长沙': 0.12,
          '武汉市,武汉': 0.1,
          '南昌市,南昌': 0.08,
          '南宁市,南宁': 0.07,
          '福州市,福州': 0.06,
          '其他,其他': 0.04,
        },
      },
      purposes: {
        商务出差: 0.42,
        旅游度假: 0.28,
        探亲访友: 0.18,
        其他: 0.12,
      },
      ages: {
        '18-25岁': 0.22,
        '26-35岁': 0.38,
        '36-45岁': 0.25,
        '46-55岁': 0.1,
        '55岁以上': 0.05,
      },
      income_level: {
        '5000元以下': 0.15,
        '5000-10000元': 0.3,
        '10000-20000元': 0.35,
        '20000元以上': 0.2,
      },
    },
    message: 'success',
  };
};

// 模拟酒店数据
export const mockHotelData = (): { code: number; data: any; message?: string } => {
  return {
    code: 200,
    data: {
      price_data: {
        '200元以下': 45,
        '200-400元': 120,
        '400-600元': 85,
        '600元以上': 35,
      },
      level_data: {
        经济型: 80,
        舒适型: 110,
        高档型: 70,
        豪华型: 25,
      },
      brand_data: {
        如家: 65,
        汉庭: 58,
        全季: 48,
        亚朵: 42,
      },
      occupancy_data: {
        '60%以下': 25,
        '60%-70%': 55,
        '70%-80%': 85,
        '80%-90%': 65,
        '90%以上': 45,
      },
    },
    message: 'success',
  };
};
