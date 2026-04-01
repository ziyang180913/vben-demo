import { mockGatheringPointPortrait, mockHotelData } from './mock';

// 定义数据类型
export interface DataItem {
  type: string;
  value: number | null;
}

export interface ProcessedData {
  hotelBrand?: DataItem[] | null;
  hotelLevel?: DataItem[] | null;
  hotel?: DataItem[] | null;
  sex?: DataItem[] | null;
  source_city?: {
    one?: DataItem[] | null;
    two?: DataItem[] | null;
  } | null;
  purposes?: DataItem[] | null;
  ages?: DataItem[] | null;
  income_level?: DataItem[] | null;
}

export interface ColumnConfig {
  title: string;
  key: string;
  width?: string;
  align?: string;
  tooltip?: boolean;
}

export interface ComponentConfig {
  type: string;
  value?: string;
  title?: string;
  height?: string | number;
  fieldProps?: any;
  footer?: (item: any, data: any) => any;
}

export interface RightConfigChild {
  label: string;
  value: string;
  right?: {
    default: string;
    type: string;
    picker: string;
    callback?: (date: any, _: any, param: any) => Promise<any>;
  };
  components: ComponentConfig[];
  footer?: (item: any, data: any) => any;
}

export interface RightConfigItem {
  label: string;
  value: string;
  callback?: (date: any, _: any, param: any) => Promise<any>;
  children?: RightConfigChild[];
}

// 数据处理函数
export const getData2 = (data: any | null): ProcessedData => {
  if (!data) {
    return {
      hotelBrand: null,
      hotelLevel: null,
      hotel: null,
      sex: null,
      source_city: null,
      purposes: null,
      ages: null,
      income_level: null,
    };
  }

  const param: ProcessedData = {};

  if (data.sex) {
    param.sex = [
      {
        value: data.sex['女'] ? +(data.sex['女'] * 100).toFixed(2) : 0,
        type: '女',
      },
      {
        value: data.sex['男'] ? +(data.sex['男'] * 100).toFixed(2) : 0,
        type: '男',
      },
    ];
  }

  if (data.hotel_prices) {
    param.hotel = Object.keys(data.hotel_prices).map((item) => ({
      type: item,
      value: +((data.hotel_prices?.[item] || 0) * 100).toFixed(2) || 0,
    }));
  }

  if (data.hotel_levels) {
    param.hotelLevel = Object.keys(data.hotel_levels).map((item) => ({
      type: item,
      value: +((data.hotel_levels?.[item] || 0) * 100).toFixed(2) || 0,
    }));
  }

  if (data.hotel_brands) {
    param.hotelBrand = Object.keys(data.hotel_brands)
      .map((item) => ({
        type: item,
        value: data.hotel_brands?.[item] || null,
      }))
      .sort((a, b) => (b.value || 0) - (a.value || 0));
  }

  if (data.source_city) {
    param.source_city = {
      one: Object.keys(data.source_city?.source_province || {}).map((item) => ({
        type: item,
        value: data.source_city?.source_province?.[item]
          ? Number((data.source_city?.source_province?.[item] * 100).toFixed(2))
          : null,
      })),
      two: Object.keys(data.source_city?.source_city || {}).map((item) => ({
        type: item.split(',').at(-1) || '',
        value: data.source_city?.source_city?.[item]
          ? Number((data.source_city?.source_city?.[item] * 100).toFixed(2))
          : null,
      })),
    };
  }

  if (data.purposes) {
    param.purposes = Object.keys(data.purposes).map((item) => ({
      type: item,
      value: +((data.purposes?.[item] || 0) * 100).toFixed(2) || 0,
    }));
  }

  if (data.ages) {
    param.ages = Object.keys(data.ages).map((item) => ({
      type: item,
      value: +((data.ages?.[item] || 0) * 100).toFixed(2) || 0,
    }));
  }

  if (data.income_level) {
    param.income_level = Object.keys(data.income_level).map((item) => ({
      type: item,
      value: +((data.income_level?.[item] || 0) * 100).toFixed(2) || 0,
    }));
  }

  return param;
};

// 配置对象
const config = {
  columns: [
    {
      title: '序号',
      key: 'index',
      width: '8%',
      align: 'center',
    },
    {
      title: '聚客点名称',
      key: 'name',
      tooltip: true,
      width: '20%',
    },
    {
      title: '类型',
      key: 'fence_type',
      width: '20%',
      align: 'center',
    },
    {
      title: '月聚客指数',
      key: 'month_uv',
      width: '20%',
      align: 'center',
    },
  ] as ColumnConfig[],

  rightCofig: [
    {
      label: '客群画像分析',
      value: '2',
      callback: async (_date: any, _: any, _param: any) => {
        try {
          const res = mockGatheringPointPortrait();
          if (res.code === 200) {
            return !res.data
              ? {
                  hotelBrand: null,
                  hotelLevel: null,
                  hotel: null,
                  sex: null,
                  purposes: null,
                  ages: null,
                  income_level: null,
                }
              : getData2(res.data);
          }
          return {};
        } catch (error) {
          console.error(error);
          return {};
        }
      },
      children: [
        {
          value: 'portrait',
          components: [
            {
              type: 'PieChart',
              value: 'sex',
              title: '客群性别分析',
              height: 163,
              fieldProps: {
                colors: ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
                radius: 0.75,
                innerRadius: 0.5,
              },
            },
            {
              type: 'PieChart',
              value: 'hotel',
              title: '酒店价格偏好',
              height: 163,
              fieldProps: {
                colors: ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
                radius: 0.75,
                innerRadius: 0.5,
              },
            },
            {
              type: 'ColumnPlotStack',
              value: 'hotelBrand',
              title: '酒店品牌',
              fieldProps: {
                legend: false,
                meta: {
                  value: {
                    alias: '比例',
                    formatter: (v: number) => (v ? `${(v * 100).toFixed(2)}%` : null),
                  },
                },
              },
            },
            {
              type: 'MultiLevelPie',
              value: 'source_city',
              title: '来源城市',
              height: 163,
            },
            {
              type: 'PieChart',
              value: 'hotelLevel',
              title: '酒店等级',
              height: 163,
              fieldProps: {
                colors: ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
                radius: 0.75,
                innerRadius: 0.5,
              },
            },
            {
              type: 'PieChart',
              value: 'income_level',
              title: '客群收入水平分层',
              height: 163,
              fieldProps: {
                colors: ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
                radius: 0.75,
                innerRadius: 0.5,
              },
            },
            {
              type: 'PieChart',
              value: 'purposes',
              title: '住宿目的分类',
              height: 163,
              fieldProps: {
                colors: ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
                radius: 0.75,
                innerRadius: 0.5,
              },
            },
            {
              type: 'PieChart',
              value: 'ages',
              title: '客群年龄分布',
              height: 163,
              fieldProps: {
                colors: ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
                radius: 0.75,
                innerRadius: 0.5,
              },
            },
          ],
        },
      ],
    },
  ] as RightConfigItem[],
};

export default config;
