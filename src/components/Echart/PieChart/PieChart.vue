<template>
  <div class="pie-chart-wrapper" :style="{ height: `${height}px` }">
    <div v-if="isEmpty" class="empty-status">
      <Empty :image="Empty.PRESENTED_IMAGE_SIMPLE" />
    </div>

    <div v-show="!isEmpty" ref="chartRef" class="pie-chart-container"></div>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted, computed, onUnmounted, watch, nextTick } from 'vue';
  import * as echarts from 'echarts';
  import { Empty } from 'ant-design-vue'; // 确保安装了 ant-design-vue

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
    // 3. 扩展性：允许传入额外的 echarts 配置
    extraOption?: echarts.EChartsOption;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 200,
    // 4. 默认设置你要求的一组颜色
    colors: () => ['#4D6AFF', '#36CBCB', '#FF7A7D', '#FAD336', '#B57FEE', '#4DCB73'],
    radius: 0.75,
    innerRadius: 0.5,
    extraOption: () => ({}),
  });

  const chartRef = ref<HTMLElement>();
  let chartInstance: echarts.ECharts | null = null;

  // 判断数据是否为空
  const isEmpty = computed(() => !props.data || props.data.length === 0);
  // 初始化图表
  const initChart = async () => {
    if (!chartRef.value) return;

    // 确保 DOM 已经根据 v-show 完成渲染
    await nextTick();

    if (!chartInstance) {
      chartInstance = echarts.init(chartRef.value);
    }
    updateChart();
  };

  // 更新图表逻辑（重点优化扩展性）
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
          // 保持原有的半径计算逻辑
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

    // 5. 合并扩展配置：使用 echarts 自带的 merge 策略
    // 如果 props.extraOption 有值，它会覆盖上面的默认配置
    chartInstance.setOption({ ...option, ...props.extraOption });
  };

  const handleResize = () => {
    chartInstance?.resize();
  };

  onMounted(() => {
    if (props.data && props.data.length > 0) {
      initChart();
    }
    window.addEventListener('resize', handleResize);
  });

  onUnmounted(() => {
    window.removeEventListener('resize', handleResize);
    chartInstance?.dispose();
  });

  // 6. 监听数据变化：增加对空值切换的处理
  watch(
    () => props.data,
    (newData) => {
      if (newData && newData.length > 0) {
        initChart(); // 内部有 nextTick，确保从空到有能正确初始化
      }
    },
    { deep: true },
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
