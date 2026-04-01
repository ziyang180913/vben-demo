<template>
  <div ref="chartRef" class="pie-chart-container"></div>
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
    colors?: string[];
    radius?: number;
    innerRadius?: number;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 200,
    colors: () => ['#FF7A7D', '#4D6AFF', '#36CBCB', '#B57FEE', '#FAD337'],
    radius: 0.75,
    innerRadius: 0.5,
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

    const option: echarts.EChartsOption = {
      color: props.colors,
      tooltip: {
        trigger: 'item',
        formatter: '{b}: {c}%',
      },
      series: [
        {
          type: 'pie',
          radius: [`${props.innerRadius * 100}%`, `${props.radius * 100}%`],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: true,
            formatter: '{b}\n{c}%',
            fontSize: 12,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
          },
          data: props.data.map((item) => ({
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
  .pie-chart-container {
    width: 100%;
    height: 100%;
  }
</style>
