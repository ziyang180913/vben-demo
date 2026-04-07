<template>
  <div class="modal-income-consumption-occupation">
    <!-- 收入区间分布 -->
    <OuterDiv title="收入区间分布" :other-title="incomeTitle" :tips="TipsExplainComponent">
      <div class="chart-container" :style="{ height: '320px' }">
        <ColumnPlot
          :data="incomeData"
          :height="320"
          :colors="chartColor"
          :legend="false"
          :meta="{
            value: {
              alias: '占比',
              formatter: (v: number) => `${v}%`,
            },
          }"
        />
      </div>
    </OuterDiv>

    <!-- 消费区间分布 -->
    <OuterDiv title="消费区间分布" :other-title="consumptionTitle" :tips="TipsExplainComponent">
      <div class="chart-container" :style="{ height: '320px' }">
        <ColumnPlot
          :data="consumptionData"
          :height="320"
          :colors="chartColor"
          :legend="false"
          :meta="{
            value: {
              alias: '占比',
              formatter: (v: number) => `${v}%`,
            },
          }"
        />
      </div>
    </OuterDiv>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, ref, onMounted } from 'vue';
  import OuterDiv from '../OuterDiv/index.vue';
  import ColumnPlot from '@/components/Echart/ColumnPlot/ColumnPlot.vue';
  import TipsExplain from '@/components/TipsExplain/src/TipsExplain/index.vue';
  import tipsContent from './tips-content';

  interface DataItem {
    type: string;
    value: number;
  }

  interface DistributionData {
    data: DataItem[];
    num: string;
    marketNum: string;
  }

  interface Props {
    data?: Record<string, any>;
    isMarket?: boolean;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
    isMarket: false,
  });

  // ========== Mock 数据 ==========
  // 模拟收入消费职业数据
  const mockData = {
    // 收入区间分布数据
    收入区间分布: {
      '0-3K': { 比例: 0.08 },
      '3K-5K': { 比例: 0.15 },
      '5K-8K': { 比例: 0.25 },
      '8K-12K': { 比例: 0.22 },
      '12K-20K': { 比例: 0.18 },
      '20K-30K': { 比例: 0.08 },
      '30K以上': { 比例: 0.04 },
      收入总体均值: 9850.5,
      市平均收入: 8750.3,
    },
    // 消费区间分布数据
    消费区间分布: {
      '0-1K': { 比例: 0.05 },
      '1K-2K': { 比例: 0.12 },
      '2K-3K': { 比例: 0.2 },
      '3K-5K': { 比例: 0.28 },
      '5K-8K': { 比例: 0.18 },
      '8K-12K': { 比例: 0.1 },
      '12K以上': { 比例: 0.07 },
      消费总体均值: 4850.75,
      市平均消费: 4200.5,
    },
  };

  // 模拟异步请求获取数据
  const fetchMockData = (): Promise<Record<string, any>> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockData);
      }, 300); // 模拟 300ms 延迟
    });
  };

  // 组件内部的数据状态
  const internalData = ref<Record<string, any>>({});

  // 图表颜色
  const chartColor = ['#4D6AFF', '#4DCB73', '#36CBCB', '#B57FEE', '#FF7A7D', '#5B8BEE', '#FAD337'];

  // TipsExplain 组件
  const TipsExplainComponent = h(TipsExplain, { content: tipsContent });

  // 处理数据，转换为图表需要的格式
  const handleData = (obj: Record<string, any>): DataItem[] => {
    return Object.keys(obj)
      .map((item) => {
        const val = obj[item]['比例'];
        return {
          type: item,
          value: Number((val * 100).toFixed(2)),
        };
      })
      .sort((a, b) => {
        // 排序：提取数字部分进行比较
        const sortA = extractNumber(a.type);
        const sortB = extractNumber(b.type);
        return sortA - sortB;
      });
  };

  // 提取字符串中的数字用于排序
  const extractNumber = (str: string): number => {
    const match = str.match(/(\d+)/);
    return match ? Number(match[1]) : 0;
  };

  // 处理数据（优先使用外部传入的数据，否则使用内部模拟数据）
  const processedData = computed(() => {
    const result: Record<string, DistributionData> = {};
    // 优先使用外部传入的 data，如果没有则使用内部 mock 数据
    const data = Object.keys(props.data || {}).length > 0 ? props.data : internalData.value;

    Object.keys(data || {}).forEach((item) => {
      if (item === '收入区间分布') {
        const { 收入总体均值, 市平均收入, ...rest } = data[item];
        result[item] = {
          data: handleData(rest),
          num: (收入总体均值 || 0).toFixed(2),
          marketNum: (市平均收入 || 0).toFixed(2),
        };
      } else if (item === '消费区间分布') {
        const { 消费总体均值, 市平均消费, ...rest } = data[item];
        result[item] = {
          data: handleData(rest),
          num: (消费总体均值 || 0).toFixed(2),
          marketNum: (市平均消费 || 0).toFixed(2),
        };
      }
    });

    return result;
  });

  // 收入数据
  const incomeData = computed(() => {
    return processedData.value?.['收入区间分布']?.data || [];
  });

  // 消费数据
  const consumptionData = computed(() => {
    return processedData.value?.['消费区间分布']?.data || [];
  });

  // 收入标题
  const incomeTitle = computed(() => {
    const item = processedData.value?.['收入区间分布'];
    if (!item) return '';
    const marketPart = !props.isMarket ? ` | 市平均收入：${item.marketNum}` : '';
    return `【收入总体均值：${item.num}${marketPart}】`;
  });

  // 消费标题
  const consumptionTitle = computed(() => {
    const item = processedData.value?.['消费区间分布'];
    if (!item) return '';
    const marketPart = !props.isMarket ? ` | 市平均消费：${item.marketNum}` : '';
    return `【消费总体均值：${item.num}${marketPart}】`;
  });

  // 组件挂载时模拟请求数据
  onMounted(async () => {
    // 如果外部没有传入数据，则模拟请求
    if (Object.keys(props.data || {}).length === 0) {
      const res = await fetchMockData();
      internalData.value = res;
    }
  });
</script>

<style lang="less" scoped></style>
