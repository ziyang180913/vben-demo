<template>
  <div class="group-column-plot-wrapper" :style="{ height: `${height}px` }">
    <div
      v-show="!isEmpty"
      ref="chartRef"
      class="group-column-plot-container"
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
    // 分组字段，如季度
    group: string;
    // 系列名称，如工作人口/居住人口
    series: string;
    // 数值
    value: number;
  }

  interface Props {
    data: DataItem[];
    height?: number;
    legend?: boolean;
    colors?: string[];
    options?: EChartsOption;
    emptyDescription?: string;
    emptyImage?: any;
    // 是否显示标签
    label?: boolean;
    // 标签格式化函数
    labelFormatter?: (value: number) => string;
    // 柱条最大宽度
    barMaxWidth?: number;
    // 柱条间距
    barGap?: string;
    // 系列柱条间距
    barCategoryGap?: string;
  }

  const props = withDefaults(defineProps<Props>(), {
    height: 300,
    legend: true,
    colors: () => ['#4D6AFF', '#4DCB73', '#36CBCB', '#B57FEE', '#FF7A7D', '#5B8BEE', '#FAD337'],
    options: () => ({}),
    emptyDescription: '暂无数据',
    emptyImage: AEmpty.PRESENTED_IMAGE_SIMPLE,
    label: true,
    labelFormatter: (v: number) => `${v}`,
    barMaxWidth: 40,
    barGap: '20%',
    barCategoryGap: '30%',
  });

  const chartRef = ref<HTMLDivElement>();
  const { setOptions, getInstance } = useECharts(chartRef);

  // 判断数据是否为空
  const isEmpty = computed(() => !props.data || props.data.length === 0);

  // 获取所有分组（X轴数据）
  const getGroups = computed(() => {
    const groups = new Set<string>();
    props.data.forEach((item) => groups.add(item.group));
    return Array.from(groups);
  });

  // 获取所有系列（图例数据）
  const getSeriesNames = computed(() => {
    const series = new Set<string>();
    props.data.forEach((item) => series.add(item.series));
    return Array.from(series);
  });

  // 获取图表配置
  const getChartOption = (): EChartsOption => {
    if (isEmpty.value) return {};

    const groups = getGroups.value;
    const seriesNames = getSeriesNames.value;

    // 构建系列数据
    const series = seriesNames.map((seriesName, index) => ({
      name: seriesName,
      type: 'bar',
      data: groups.map((group) => {
        const item = props.data.find((d) => d.group === group && d.series === seriesName);
        return {
          value: item?.value || 0,
          itemStyle: {
            color: props.colors[index % props.colors.length],
            borderRadius: [4, 4, 0, 0],
          },
        };
      }),
      barMaxWidth: props.barMaxWidth,
      label: {
        show: props.label,
        position: 'top',
        formatter: (params: any) => props.labelFormatter?.(params.value) || params.value,
      },
    }));

    const baseOption: EChartsOption = {
      color: props.colors,
      tooltip: {
        trigger: 'axis',
        axisPointer: { type: 'shadow' },
        formatter: (params: any[]) => {
          if (!params || params.length === 0) return '';
          let result = params[0].name + '<br/>';
          params.forEach((item) => {
            result += `${item.marker} ${item.seriesName}: <b>${props.labelFormatter?.(item.value) || item.value}</b><br/>`;
          });
          return result;
        },
      },
      legend: {
        show: props.legend,
        bottom: '0%',
        itemWidth: 12,
        itemHeight: 12,
        textStyle: {
          fontSize: 12,
        },
      },
      grid: {
        left: '0.5%',
        right: '0.5%',
        bottom: props.legend ? '9%' : '2%',
        top: '3%',
        containLabel: true,
      },
      xAxis: {
        type: 'category',
        data: groups,
        axisLabel: {
          rotate: groups.length > 6 ? 30 : 0,
          fontSize: 12,
        },
        axisTick: {
          alignWithLabel: true,
        },
      },
      yAxis: {
        type: 'value',
        axisLabel: {
          formatter: (value: number) => props.labelFormatter?.(value) || `${value}`,
        },
        splitLine: {
          lineStyle: {
            type: 'dashed',
          },
        },
      },
      series,
      barGap: props.barGap,
      barCategoryGap: props.barCategoryGap,
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
  .group-column-plot-wrapper {
    position: relative;
    width: 100%;
    min-height: 150px;
  }

  .group-column-plot-container {
    width: 100%;
  }

  .empty-container {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 20px 0;
  }
</style>
