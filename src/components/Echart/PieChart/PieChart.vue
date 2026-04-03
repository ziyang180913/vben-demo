<template>
  <div class="pie-chart-wrapper" :style="{ height: `${height}px` }">
    <div v-if="isEmpty" class="empty-status">
      <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>

    <div v-show="!isEmpty" ref="chartRef" class="pie-chart-container"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, watch } from 'vue';
  import type { EChartsOption } from 'echarts';
  import { Empty } from 'ant-design-vue';
  import { useECharts } from '@/hooks/web/useECharts';

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
    // 扩展性：允许传入额外的 echarts 配置
    extraOption?: EChartsOption;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 200,
    colors: () => ['#4D6AFF', '#36CBCB', '#FF7A7D', '#FAD336', '#B57FEE', '#4DCB73'],
    radius: 0.75,
    innerRadius: 0.5,
    extraOption: () => ({}),
  });

  const chartRef = ref<HTMLDivElement>();
  const { setOptions } = useECharts(chartRef);

  // 判断数据是否为空
  const isEmpty = computed(() => !props.data || props.data.length === 0);

  // 获取图表配置
  const getChartOption = (): EChartsOption => {
    return {
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
  };

  // 更新图表
  const updateChart = () => {
    if (!props.data?.length) return;
    const option = getChartOption();
    setOptions({ ...option, ...props.extraOption });
  };

  // 监听数据变化
  watch(
    () => props.data,
    () => {
      if (props.data?.length) {
        updateChart();
      }
    },
    { deep: true, immediate: true },
  );

  // 监听配置项变化
  watch(
    [() => props.extraOption, () => props.colors],
    () => {
      updateChart();
    },
    { deep: true },
  );
</script>

<style scoped>
  .pie-chart-wrapper {
    display: flex;
    flex-direction: column;
    width: 100%;
  }

  .pie-chart-container {
    flex: 1; /* 自动填充 wrapper 高度 */
    width: 100%;
    min-height: 0;
  }

  .empty-status {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
  }
</style>
