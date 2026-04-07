<template>
  <div class="customer-base">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">加载中...</div>
    </div>

    <template v-else>
      <!-- 第一行：性别、婚姻状况 -->
      <div
        class="font-20-left-500-pr85 color-border-pr12 customer-base-sex"
        style="margin-bottom: 20px"
      >
        <OtherTitle title="性别">
          <PieChart
            :data="sexData"
            :height="220"
            :radius="0.8"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </OtherTitle>
        <OtherTitle title="婚姻状况">
          <PieChart
            :data="marriageData"
            :height="220"
            :radius="0.8"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </OtherTitle>
      </div>

      <!-- 第二行：未成年子女情况、有无房产 -->
      <div
        class="font-20-left-500-pr85 color-border-pr12 customer-base-sex"
        style="margin-bottom: 20px"
      >
        <OtherTitle title="未成年子女情况">
          <PieChart
            :data="childData"
            :height="220"
            :radius="0.8"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </OtherTitle>
        <OtherTitle title="有无房产">
          <PieChart
            :data="realEstateData"
            :height="220"
            :radius="0.8"
            :inner-radius="0.5"
            :colors="pieColor"
          />
        </OtherTitle>
      </div>

      <!-- 第三行：孩子年龄、学历 -->
      <div class="chart-row-flex">
        <OuterDiv
          title="孩子年龄"
          :style="{ width: params?.model !== 'sales_office' ? '49%' : '100%', margin: 0 }"
          :tips="tipsComponent"
        >
          <ColumnPlot
            :data="childAgeData"
            :height="320"
            :colors="chartColor"
            :legend="false"
            :meta="{ value: { formatter: (v: number) => `${v}%` } }"
          />
        </OuterDiv>
        <OuterDiv
          v-if="params?.model !== 'sales_office'"
          title="学历"
          :style="{ width: '49%', margin: 0 }"
          :tips="tipsComponent"
        >
          <ColumnPlot
            :data="educationData"
            :height="320"
            :colors="chartColor"
            :legend="false"
            :meta="{ value: { formatter: (v: number) => `${v}%` } }"
          />
        </OuterDiv>
      </div>

      <!-- 第四行：年龄段 -->
      <OuterDiv title="年龄段" :style="{ margin: '0 0 20px 0' }" :tips="tipsComponent">
        <ColumnPlot
          :data="ageGroupData"
          :height="320"
          :colors="chartColor"
          :legend="false"
          :meta="{ value: { formatter: (v: number) => `${v}%` } }"
        />
      </OuterDiv>

      <!-- 第五行：职业分布 -->
      <OuterDiv title="职业分布" :style="{ margin: '0' }" :tips="tipsComponent">
        <ColumnPlot
          :data="occupationData"
          :height="320"
          :colors="chartColor"
          :legend="false"
          :meta="{ value: { formatter: (v: number) => `${v}%` } }"
        />
      </OuterDiv>
    </template>
  </div>
</template>

<script setup lang="ts">
  import { computed, h, defineComponent, ref, onMounted } from 'vue';
  import OuterDiv from '../OuterDiv/index.vue';
  import { PieChart } from '@/components/Echart/PieChart';
  import { ColumnPlot } from '@/components/Echart/ColumnPlot';
  import { TipsExplain } from '@/components/TipsExplain';
  import tipsContent from './tips-content';

  interface ChartDataItem {
    type: string;
    city: string;
    percent: number;
    value: number;
  }

  interface ColumnDataItem {
    type: string;
    value: number;
  }

  interface Props {
    data?: Record<string, any>;
    params?: Record<string, any>;
  }

  const props = withDefaults(defineProps<Props>(), {
    data: () => ({}),
    params: () => ({}),
  });

  // 加载状态
  const loading = ref(true);
  // Mock 数据存储
  const mockData = ref<Record<string, any>>({});

  // 模拟请求获取数据
  const fetchMockData = () => {
    return new Promise<Record<string, any>>((resolve) => {
      setTimeout(() => {
        resolve({
          // 性别数据（饼图）
          性别: {
            man: 0.48,
            woman: 0.52,
          },
          // 婚姻状况数据（饼图）
          婚姻: {
            已婚: 0.65,
            未婚: 0.35,
          },
          // 有无小孩数据（饼图）
          有无小孩: {
            有小孩: 0.42,
            无小孩: 0.58,
          },
          // 有无房产数据（饼图）
          有无房产: {
            有房产: 0.72,
            无房产: 0.28,
          },
          // 孩子年龄数据（柱状图）
          孩子年龄: {
            '0-3岁': 0.25,
            '4-6岁': 0.3,
            '7-12岁': 0.28,
            '13-18岁': 0.17,
          },
          // 学历数据（柱状图）
          学历: {
            高中及以下学历: 0.22,
            大专学历: 0.28,
            本科学历: 0.35,
            硕士及以上学历: 0.15,
          },
          // 年龄段数据（柱状图）
          年龄段: {
            '18-25岁': 0.18,
            '26-30岁': 0.25,
            '31-35岁': 0.22,
            '36-40岁': 0.2,
            '41-50岁': 0.1,
            '50岁以上': 0.05,
          },
          // 职业分布数据（柱状图）
          职业分布: {
            企业白领: 0.35,
            个体经营: 0.2,
            学生: 0.15,
            自由职业: 0.12,
            公务员: 0.1,
            其他: 0.08,
          },
        });
      }, 800); // 模拟 800ms 延迟
    });
  };

  // 组件挂载时获取数据
  onMounted(async () => {
    // 如果外部传入了数据，使用外部数据；否则使用 mock 数据
    if (Object.keys(props.data || {}).length > 0) {
      mockData.value = props.data;
      loading.value = false;
    } else {
      const data = await fetchMockData();
      mockData.value = data;
      loading.value = false;
    }
  });

  // 图表颜色配置
  const chartColor = ['#4D6AFF', '#4DCB73', '#36CBCB', '#B57FEE', '#FF7A7D', '#5B8BEE', '#FAD337'];
  const pieColor = ['#4D6AFF', '#FF7A7D'];

  // 提示内容组件（使用渲染函数组件）
  const tipsComponent = defineComponent({
    setup() {
      return () => h(TipsExplain, { content: tipsContent });
    },
  });

  // 性别数据
  const sexData = computed<ChartDataItem[]>(() => {
    const sexData = mockData.value?.['性别'] || {};
    return Object.keys(sexData).map((item) => {
      const isSex = item === 'man' ? '男' : '女';
      const val = sexData[item] || 0;
      return {
        type: isSex,
        city: isSex,
        percent: val,
        value: Number((val * 100).toFixed(2)),
      };
    });
  });

  // 婚姻状况数据
  const marriageData = computed<ChartDataItem[]>(() => {
    const marriageData = mockData.value?.['婚姻'] || {};
    return Object.keys(marriageData).map((item) => {
      const val = marriageData[item] || 0;
      return {
        type: item,
        city: item,
        percent: val,
        value: Number((val * 100).toFixed(2)),
      };
    });
  });

  // 未成年子女情况数据
  const childData = computed<ChartDataItem[]>(() => {
    const childData = mockData.value?.['有无小孩'] || {};
    return Object.keys(childData).map((item) => {
      const val = childData[item] || 0;
      return {
        type: item,
        city: item,
        percent: val,
        value: Number((val * 100).toFixed(2)),
      };
    });
  });

  // 有无房产数据
  const realEstateData = computed<ChartDataItem[]>(() => {
    const realEstateData = mockData.value?.['有无房产'] || {};
    return Object.keys(realEstateData).map((item) => {
      const val = realEstateData[item] || 0;
      return {
        type: item,
        city: item,
        percent: val,
        value: Number((val * 100).toFixed(2)),
      };
    });
  });

  // 处理柱状图数据
  const handleColumnData = (key: string, splitKey?: string): ColumnDataItem[] => {
    const data = mockData.value?.[key] || {};
    return Object.keys(data).map((item) => {
      const str = splitKey ? `${item.split(splitKey)[0]}${splitKey}` : item;
      const val = data[item];
      return {
        type: str,
        value: Number((val * 100).toFixed(2)),
      };
    });
  };

  // 孩子年龄数据
  const childAgeData = computed(() => handleColumnData('孩子年龄', '岁'));

  // 学历数据
  const educationData = computed(() => handleColumnData('学历', '历'));

  // 年龄段数据
  const ageGroupData = computed(() => handleColumnData('年龄段'));

  // 职业分布数据
  const occupationData = computed(() => handleColumnData('职业分布'));

  // OtherTitle 组件
  const OtherTitle = defineComponent({
    props: {
      title: {
        type: String,
        required: true,
      },
    },
    setup(props, { slots }) {
      return () =>
        h('div', { class: 'color-border-pr12 customer-base-sex-title' }, [
          h(
            'div',
            { class: 'color-border-pr12', style: { display: 'flex', marginRigth: '10px' } },
            [props.title, ' ', h(tipsComponent)],
          ),
          h('div', { style: { margin: '0 auto', width: '415px' } }, slots.default?.()),
        ]);
    },
  });
</script>

<style lang="less" scoped>
  @import './index.less';

  .chart-row-flex {
    display: flex;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .loading-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 400px;
  }

  .loading-spinner {
    padding: 20px;
    color: #999;
    font-size: 14px;
  }
</style>
