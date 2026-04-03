<template>
  <div class="column-plot-wrapper" :style="{ height: `${height}px` }">
    <div
      v-show="!isEmpty"
      ref="chartRef"
      class="column-plot-container"
      style="width: 100%; height: 100%"
    ></div>

    <div v-if="isEmpty" class="empty-container">
      <a-empty :image="emptyImage" :description="emptyDescription" />
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import type { EChartsOption } from 'echarts';
  import { merge } from 'lodash-es';
  import { Empty as AEmpty } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';

  interface DataItem {
    type: string;
    value: number;
    [key: string]: any;
  }

  interface Props {
    data: DataItem[];
    height?: number;
    legend?: boolean;
    colors?: string[];
    options?: EChartsOption;
    emptyDescription?: string;
    emptyImage?: any;
    meta?: {
      value?: {
        alias?: string;
        formatter?: (v: number) => string | null;
      };
    };
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 200,
    legend: true,
    colors: () => ['#4D6AFF', '#4DCB73', '#36CBCB', '#B57FEE', '#FF7A7D', '#5B8BEE', '#FAD337'],
    options: () => ({}),
    emptyDescription: '暂无数据',
    emptyImage: AEmpty.PRESENTED_IMAGE_SIMPLE,
  });

  const chartRef = ref<HTMLDivElement>();
  const { setOptions, getInstance } = useECharts(chartRef);

  // 判断数据是否为空
  const isEmpty = computed(() => !props.data || props.data.length === 0);

  // 获取图表配置
  const getChartOption = (): EChartsOption => {
    if (isEmpty.value) return {};

    const formatter = props.meta?.value?.formatter;
    const alias = props.meta?.value?.alias || '数值';

    const baseOption: EChartsOption = {
      color: props.colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const item = params[0];
          const val = formatter ? formatter(item.value) : item.value;
          return `${item.name}<br/>${item.marker} ${item.seriesName || alias}: <b>${val}</b>`;
        },
      },
      legend: {
        show: props.legend,
        bottom: '0%',
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: props.legend ? '15%' : '5%',
        top: '15%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: props.data.map((item) => item.type),
        axisLabel: { rotate: props.data.length > 6 ? 30 : 0 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => (formatter ? formatter(value) : value),
        },
      },
      series: [
        {
          name: alias,
          type: 'bar',
          barMaxWidth: 30,
          data: props.data.map((item) => item.value),
          itemStyle: {
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };

    return merge({}, baseOption, props.options);
  };

  // 渲染图表
  const renderChart = () => {
    if (isEmpty.value) {
      const instance = getInstance();
      instance?.clear();
      return;
    }
    setOptions(getChartOption(), true);
  };

  // 监听数据及配置变化
  watch(
    [() => props.data, () => props.options, () => props.colors, isEmpty],
    () => {
      renderChart();
    },
    { deep: true, immediate: true },
  );
</script>

<style scoped>
  .column-plot-wrapper {
    position: relative;
    width: 100%;

    /* 确保容器有最小高度，方便空组件居中显示 */
    min-height: 150px;
  }

  .column-plot-container {
    width: 100%;
  }

  .empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;

    /* 稍微调整 padding 让空状态更美观 */
    padding: 20px 0;
  }
</style>
