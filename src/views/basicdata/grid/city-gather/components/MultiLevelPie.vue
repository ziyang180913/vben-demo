<template>
  <div ref="chartRef" class="multi-level-pie-container"></div>
</template>

<script setup lang="ts">
  import { ref, onMounted, onUnmounted, watch } from 'vue';
  import * as echarts from 'echarts';

  interface DataItem {
    type: string;
    value: number;
  }

  interface CityData {
    one?: DataItem[] | null;
    two?: DataItem[] | null;
  }

  interface Props {
    data: CityData;
    height?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 200,
  });

  const chartRef = ref<HTMLElement>();
  let chartInstance: echarts.ECharts | null = null;

  const initChart = () => {
    if (!chartRef.value) return;
    chartInstance = echarts.init(chartRef.value);
    updateChart();
  };

  const updateChart = () => {
    if (!chartInstance) return;

    const innerData = props.data?.one || [];
    const outerData = props.data?.two || [];

    if (!innerData.length && !outerData.length) {
      chartInstance.clear();
      return;
    }

    const option: echarts.EChartsOption = {
      tooltip: { trigger: 'item', formatter: '{b}: {c}%' },
      series: [
        {
          type: 'pie',
          radius: [0, '40%'],
          label: { show: true, position: 'inner', formatter: '{b}', fontSize: 10 },
          labelLine: { show: false },
          data: innerData
            .filter((item) => item.value !== null)
            .map((item) => ({
              name: item.type,
              value: item.value,
            })),
        },
        {
          type: 'pie',
          radius: ['50%', '70%'],
          label: { show: true, formatter: '{b}: {c}%', fontSize: 10 },
          data: outerData
            .filter((item) => item.value !== null)
            .map((item) => ({
              name: item.type,
              value: item.value,
            })),
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
  .multi-level-pie-container {
    width: 100%;
    height: 100%;
  }
</style>
