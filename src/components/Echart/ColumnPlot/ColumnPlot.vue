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
  import { ref, shallowRef, onMounted, onUnmounted, watch, computed, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { merge } from 'lodash-es';
  // 引入 Ant Design Vue 的 Empty 组件
  import { Empty as AEmpty } from 'ant-design-vue';

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
    options?: echarts.EChartsOption;
    // 新增：支持自定义空状态文字
    emptyDescription?: string;
    // 新增：支持自定义空状态图片 (Simple | Presentation | string)
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
    colors: () => ['#4D6AFF', '#36CBCB', '#FF7A7D', '#FAD336', '#B57FEE', '#4DCB73'],
    options: () => ({}),
    emptyDescription: '暂无数据',
    emptyImage: AEmpty.PRESENTED_IMAGE_SIMPLE, // 默认使用简洁版图片
  });

  const chartRef = ref<HTMLElement>();
  const chartInstance = shallowRef<echarts.ECharts | null>(null);
  let resizeObserver: ResizeObserver | null = null;

  // 判断数据是否为空
  const isEmpty = computed(() => !props.data || props.data.length === 0);

  /**
   * 核心逻辑：合并默认配置与外部配置
   */
  const finalOption = computed(() => {
    if (isEmpty.value) return {};

    const formatter = props.meta?.value?.formatter;
    const alias = props.meta?.value?.alias || '数值';

    const baseOption: echarts.EChartsOption = {
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
  });

  /**
   * 渲染/更新图表
   */
  const renderChart = async () => {
    if (isEmpty.value) {
      if (chartInstance.value) {
        chartInstance.value.clear();
      }
      return;
    }

    await nextTick();

    if (!chartInstance.value && chartRef.value) {
      chartInstance.value = echarts.init(chartRef.value);
    }

    if (chartInstance.value) {
      chartInstance.value.setOption(finalOption.value, { notMerge: true });
    }
  };

  const initChart = async () => {
    if (isEmpty.value) return;

    await nextTick();
    if (!chartRef.value) return;

    chartInstance.value = echarts.init(chartRef.value);
    renderChart();

    resizeObserver = new ResizeObserver(() => {
      chartInstance.value?.resize();
    });
    resizeObserver.observe(chartRef.value);
  };

  onMounted(initChart);

  onUnmounted(() => {
    resizeObserver?.disconnect();
    if (chartInstance.value) {
      chartInstance.value.dispose();
      chartInstance.value = null;
    }
  });

  watch(
    [() => props.data, () => props.options, () => props.colors, isEmpty],
    () => {
      renderChart();
    },
    { deep: true },
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
