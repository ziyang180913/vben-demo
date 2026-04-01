<template>
  <div ref="chartRef" class="column-plot-container"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import * as echarts from 'echarts';

  interface DataItem {
    type: string;
    value: number;
  }

  interface Props {
    data: DataItem[];
    height?: number;
    legend?: boolean;
    seriesField?: string;
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
  });

  const chartRef = ref<HTMLElement>();
  let chartInstance: echarts.ECharts | null = null;

  const initChart = () => {
    if (!chartRef.value) return;
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  };

  const updateChart = () => {
    if (!chartInstance || !props.data?.length) return;

    const formatter = props.meta?.value?.formatter;
    const alias = props.meta?.value?.alias || '';

    const option: echarts.EChartsOption = {
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any) => {
          const data = params[0];
          const value = formatter ? formatter(data.value) : data.value;
          return `${data.name}<br/>${alias}: ${value}`;
        },
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        top: props.legend ? '15%' : '5%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: props.data.map((item) => item.type),
        axisLabel: { rotate: 30, fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => (formatter ? formatter(value) : value),
        },
      },
      series: [
        {
          type: 'bar',
          data: props.data.map((item) => item.value),
          itemStyle: {
            color: '#4D6AFF',
            borderRadius: [4, 4, 0, 0],
          },
        },
      ],
    };

    chartInstance.setOption(option);
  };

  const handleResize = () => {
    chartInstance?.resize();
  };

  onMounted(() => {
    initChart();
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstance?.dispose();
  });

  watch(() => props.data, updateChart, { deep: true });
</script>

<style scoped>
  .column-plot-container {
    width: 100%;
    height: 100%;
  }
</style>
